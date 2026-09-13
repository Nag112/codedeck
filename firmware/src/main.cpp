#include <Arduino.h>
#include <ArduinoJson.h>
#include <Update.h>
#include <mbedtls/base64.h>

#include "codedeck_debounce.h"
#include "codedeck_pins.h"

#ifndef CODEDECK_FW_VERSION
#define CODEDECK_FW_VERSION "1.0.0"
#endif
#ifndef CODEDECK_PROTOCOL
#define CODEDECK_PROTOCOL 1
#endif
#ifndef CODEDECK_DEBOUNCE_MS
#define CODEDECK_DEBOUNCE_MS 20
#endif
#ifndef CODEDECK_UPDATE_CHUNK
#define CODEDECK_UPDATE_CHUNK 256
#endif

static debounce_t gDebounce[12];
static bool gUpdating = false;
static uint32_t gUpdateSize = 0;
static uint32_t gWritten = 0;
static int gExpectedSeq = 0;
static char gUpdateFw[24];

static void sendJson(const JsonDocument &doc) {
  serializeJson(doc, Serial);
  Serial.print('\n');
}

static void sendHello() {
  JsonDocument doc;
  doc["type"] = "hello";
  doc["protocol"] = CODEDECK_PROTOCOL;
  doc["fw"] = CODEDECK_FW_VERSION;
  doc["keys"] = kKeyCount;
  doc["layout"] = kKeyCount == 9 ? "3x3" : "3x4";
  sendJson(doc);
}

static void sendError(const char *error) {
  JsonDocument doc;
  doc["type"] = "update_error";
  doc["error"] = error;
  sendJson(doc);
}

static void abortUpdate() {
  if (gUpdating) {
    Update.abort();
  }
  gUpdating = false;
  gUpdateSize = 0;
  gWritten = 0;
  gExpectedSeq = 0;
}

static bool decodeBase64(const char *input, uint8_t *out, size_t outCap, size_t *outLen) {
  size_t written = 0;
  int rc = mbedtls_base64_decode(out, outCap, &written, reinterpret_cast<const unsigned char *>(input), strlen(input));
  if (rc != 0) {
    return false;
  }
  *outLen = written;
  return true;
}

static void handleLine(const String &line) {
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, line);
  if (err) {
    return;
  }
  const char *type = doc["type"] | "";
  if (strcmp(type, "ping") == 0 || strcmp(type, "get_info") == 0) {
    if (strcmp(type, "ping") == 0) {
      JsonDocument pong;
      pong["type"] = "pong";
      pong["t"] = millis();
      sendJson(pong);
    }
    sendHello();
    return;
  }
  if (strcmp(type, "update_abort") == 0) {
    abortUpdate();
    sendError("aborted");
    return;
  }
  if (strcmp(type, "update_begin") == 0) {
    abortUpdate();
    gUpdateSize = doc["size"] | 0;
    const char *md5 = doc["md5"] | "";
    const char *fw = doc["fw"] | "";
    strncpy(gUpdateFw, fw, sizeof(gUpdateFw) - 1);
    gUpdateFw[sizeof(gUpdateFw) - 1] = 0;
    if (gUpdateSize < 1 || strlen(md5) != 32) {
      sendError("invalid update_begin");
      return;
    }
    if (!Update.begin(gUpdateSize)) {
      sendError(Update.errorString());
      return;
    }
    Update.setMD5(md5);
    gUpdating = true;
    gWritten = 0;
    gExpectedSeq = 0;
    JsonDocument ready;
    ready["type"] = "update_ready";
    ready["chunk"] = CODEDECK_UPDATE_CHUNK;
    sendJson(ready);
    return;
  }
  if (strcmp(type, "update_chunk") == 0) {
    if (!gUpdating) {
      sendError("no update in progress");
      return;
    }
    int seq = doc["seq"] | -1;
    const char *data = doc["data"] | "";
    if (seq != gExpectedSeq) {
      abortUpdate();
      sendError("seq mismatch");
      return;
    }
    uint8_t buf[CODEDECK_UPDATE_CHUNK + 8];
    size_t decoded = 0;
    if (!decodeBase64(data, buf, sizeof(buf), &decoded) || decoded == 0) {
      abortUpdate();
      sendError("base64");
      return;
    }
    size_t wrote = Update.write(buf, decoded);
    if (wrote != decoded) {
      abortUpdate();
      sendError(Update.errorString());
      return;
    }
    gWritten += wrote;
    gExpectedSeq += 1;
    JsonDocument ack;
    ack["type"] = "update_ack";
    ack["seq"] = seq;
    ack["written"] = gWritten;
    sendJson(ack);
    return;
  }
  if (strcmp(type, "update_end") == 0) {
    if (!gUpdating) {
      sendError("no update in progress");
      return;
    }
    if (gWritten != gUpdateSize) {
      abortUpdate();
      sendError("size mismatch");
      return;
    }
    if (!Update.end(true)) {
      abortUpdate();
      sendError(Update.errorString());
      return;
    }
    JsonDocument ok;
    ok["type"] = "update_ok";
    ok["fw"] = gUpdateFw[0] ? gUpdateFw : CODEDECK_FW_VERSION;
    sendJson(ok);
    Serial.flush();
    delay(200);
    ESP.restart();
  }
}

void setup() {
  Serial.begin(115200);
  uint32_t start = millis();
  while (!Serial && millis() - start < 2000) {
    delay(10);
  }
  for (uint8_t i = 0; i < kKeyCount; i++) {
    pinMode(kKeyPins[i], INPUT_PULLUP);
    memset(&gDebounce[i], 0, sizeof(gDebounce[i]));
  }
  sendHello();
}

void loop() {
  static String line;
  while (Serial.available()) {
    char c = static_cast<char>(Serial.read());
    if (c == '\n') {
      handleLine(line);
      line = "";
    } else if (c != '\r' && line.length() < 1200) {
      line += c;
    }
  }

  if (gUpdating) {
    return;
  }

  uint32_t now = millis();
  for (uint8_t i = 0; i < kKeyCount; i++) {
    uint8_t raw = digitalRead(kKeyPins[i]) == LOW ? 1 : 0;
    int edge = debounce_update(&gDebounce[i], raw, now, CODEDECK_DEBOUNCE_MS);
    if (edge < 0) {
      continue;
    }
    JsonDocument doc;
    doc["type"] = edge ? "press" : "release";
    doc["key"] = i;
    doc["t"] = now;
    sendJson(doc);
  }
}
