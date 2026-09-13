#ifndef CODEDECK_PINS_H
#define CODEDECK_PINS_H

#include <Arduino.h>

#ifndef CODEDECK_KEYS
#define CODEDECK_KEYS 12
#endif

/* Direct GPIO, one pin per 2-pin switch. The other switch pin is GND.
 * Avoids ESP32-S3 strapping pins and USB D+/D- (19/20). */
#if CODEDECK_KEYS == 9
static const uint8_t kKeyPins[9] = {4, 5, 6, 7, 8, 9, 10, 11, 12};
#else
static const uint8_t kKeyPins[12] = {4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 21};
#endif

static const uint8_t kKeyCount = sizeof(kKeyPins) / sizeof(kKeyPins[0]);

#endif
