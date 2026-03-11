let _hostElement = null;
const markerDiff = {};
export function getAllMarkersDiff() {
  return markerDiff;
}
export function ekgStart(key) {
  if (globalThis.performance && typeof globalThis.performance?.getEntriesByName === 'function' && !globalThis.performance.getEntriesByName('t-delta~' + key + '~start').length) {
    globalThis.performance.mark('t-delta~' + key + '~start');
  }
}
export function ekgEnd(key) {
  if (globalThis.performance && typeof globalThis.performance?.getEntriesByName === 'function' && !globalThis.performance.getEntriesByName('t-delta~' + key + '~end').length) {
    globalThis.performance.mark('t-delta~' + key + '~end');
    try {
      globalThis.performance.measure(key, 't-delta~' + key + '~start', 't-delta~' + key + '~end');
      const delta = globalThis.performance.getEntriesByName(key)[0].duration;
      markerDiff[key] = Math.round(delta);
    } catch (e) {
      // Do not log errors, these errors are caused by calling end without start.
    }
  }
}
export function ekgElapsedTime(key) {
  if (globalThis.performance && typeof globalThis.performance?.getEntriesByName === 'function' && !globalThis.performance.getEntriesByName('t-load-' + key).length) {
    const time = Math.round(globalThis.performance.now());
    globalThis.performance.measure('t-load-' + key, {
      start: 0,
      end: globalThis.performance.now()
    });
    markerDiff['t-load-' + key] = time;
  }
}
export function setHostElementForEkg(hostElement) {
  _hostElement = hostElement;
}
export function ekgPublishLogs() {
  const all = getAllMarkersDiff();
  _hostElement?.setAttribute('data-ekg', JSON.stringify(all));
}
ekgElapsedTime('0-ekg');
ekgStart('t-checkout-1');
ekgStart('t-address-1');