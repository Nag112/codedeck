#ifndef CODEDECK_DEBOUNCE_H
#define CODEDECK_DEBOUNCE_H

#include <stdint.h>

typedef struct {
  uint32_t last_change_ms;
  uint8_t stable;
  uint8_t pending;
  uint8_t initialized;
} debounce_t;

/* Returns 1 on press, 0 on release, -1 if stable state did not change.
 * raw is 1 when the switch is closed (active-low GPIO already inverted). */
static inline int debounce_update(debounce_t *d, uint8_t raw, uint32_t now_ms, uint32_t window_ms) {
  if (!d->initialized) {
    d->initialized = 1;
    d->stable = raw;
    d->pending = raw;
    d->last_change_ms = now_ms;
    return -1;
  }
  if (raw != d->pending) {
    d->pending = raw;
    d->last_change_ms = now_ms;
    return -1;
  }
  if (raw != d->stable && (now_ms - d->last_change_ms) >= window_ms) {
    d->stable = raw;
    return (int)raw;
  }
  return -1;
}

#endif
