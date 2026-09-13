# Serial protocol

Newline-delimited JSON, UTF-8. `protocol` field is currently `1`.

## Device → host

```json
{"type":"hello","protocol":1,"fw":"1.0.0","keys":12,"layout":"3x4"}
{"type":"press","key":0,"t":1234}
{"type":"release","key":0,"t":1300}
{"type":"pong","t":1400}
{"type":"update_ready","chunk":256}
{"type":"update_ack","seq":0,"written":256}
{"type":"update_ok","fw":"1.0.1"}
{"type":"update_error","error":"md5 failed"}
```

## Host → device

```json
{"type":"ping"}
{"type":"get_info"}
{"type":"update_begin","size":1048576,"md5":"32 hex chars","fw":"1.0.1"}
{"type":"update_chunk","seq":0,"data":"<base64>"}
{"type":"update_end"}
{"type":"update_abort"}
```

Key indices are `0 .. keys-1`. Firmware update details: [firmware-update.md](firmware-update.md).
