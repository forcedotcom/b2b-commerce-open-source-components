export function debounce(func, time) {
  let timeout = null;
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = globalThis.setTimeout(() => {
      timeout = null;
      func(...args);
    }, time);
  };
}