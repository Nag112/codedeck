#include <assert.h>
#include <stdio.h>
#include "codedeck_debounce.h"

int main(void) {
  debounce_t d = {0};
  assert(debounce_update(&d, 0, 0, 20) == -1);
  assert(debounce_update(&d, 1, 5, 20) == -1);
  assert(debounce_update(&d, 1, 10, 20) == -1);
  assert(debounce_update(&d, 1, 26, 20) == 1);
  assert(debounce_update(&d, 1, 40, 20) == -1);
  assert(debounce_update(&d, 0, 41, 20) == -1);
  assert(debounce_update(&d, 0, 70, 20) == 0);
  puts("debounce ok");
  return 0;
}
