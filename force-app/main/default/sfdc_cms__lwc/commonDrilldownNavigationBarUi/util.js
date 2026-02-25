export function throttle(fn, timeout) {
  let timer = null;
  let tailInvoked = false;
  return function (...args) {
    if (timer === null) {
      timer = setTimeout(() => {
        timer = null;
        if (tailInvoked) {
          tailInvoked = false;
          fn(...args);
        }
      }, timeout);
      fn(...args);
    } else {
      tailInvoked = true;
    }
  };
}