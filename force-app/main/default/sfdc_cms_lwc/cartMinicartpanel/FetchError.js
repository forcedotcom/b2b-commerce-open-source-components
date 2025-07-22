import { default as errorConstructors } from './errorConstructors';
function registerErrorConstructor(type, ctor) {
  errorConstructors.set(type, ctor);
}
function verifyType(prop, type = 'string') {
  return prop === null || (type === 'array' ? typeof prop === 'undefined' || Array.isArray(prop) : ['undefined', type].includes(typeof prop));
}
function isFetchErrorResponse(value) {
  return value !== null && typeof value === 'object' && Reflect.has(value, 'message') && Reflect.has(value, 'type') && verifyType(value?.message) && verifyType(value?.type) && verifyType(value?.arguments, 'object');
}
function isFetchErrorData(value) {
  return value !== null && typeof value === 'object' && Reflect.has(value, 'url') && Reflect.has(value, 'status') && Reflect.has(value, 'statusText') && Reflect.has(value, 'errors') && verifyType(value?.url, 'string') && verifyType(value?.status, 'number') && verifyType(value?.statusText, 'string') && verifyType(value?.errors, 'array');
}
function normalizeArguments(args) {
  if (args) {
    return Reflect.ownKeys(args).reduce((acc, key) => {
      typeof key === 'string' && Reflect.set(acc, key, Reflect.get(args, key));
      return acc;
    }, {});
  }
  return {};
}
function toFetchErrorResponse({
  message,
  type,
  arguments: args
} = {}) {
  return {
    message: message ?? '',
    type: type ?? '',
    arguments: normalizeArguments(args)
  };
}
function normalizeErrors(value) {
  if (Array.isArray(value)) {
    return value.reduce((acc, element) => {
      if (isFetchErrorResponse(element)) {
        acc.push(toFetchErrorResponse(element));
      }
      return acc;
    }, []);
  } else if (isFetchErrorResponse(value)) {
    return [toFetchErrorResponse(value)];
  }
  return [];
}
function normalizeMessage(errors) {
  return errors.find(error => error.message.length > 0)?.message ?? '';
}
function normalizeData(value) {
  if (isFetchErrorData(value)) {
    const {
      url,
      status,
      statusText,
      errors
    } = value;
    return {
      url: url ?? null,
      status: typeof status === 'number' ? status : null,
      statusText: statusText ?? null,
      errors: normalizeErrors(errors)
    };
  }
  return {
    url: null,
    status: null,
    statusText: null,
    errors: normalizeErrors(value)
  };
}
class FetchError extends Error {
  name = 'FetchError';
  url = null;
  status = null;
  statusText = null;
  errors = [];
  constructor(data) {
    super();
    let {
      url,
      status,
      statusText,
      errors
    } = normalizeData(data);
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.errors = errors;
    this.message = statusText ?? normalizeMessage(errors);
    Object.defineProperty(this, 'url', {
      enumerable: true,
      get: () => url,
      set(v) {
        url = typeof v === 'string' ? v : null;
      }
    });
    Object.defineProperty(this, 'status', {
      enumerable: true,
      get: () => status,
      set(v) {
        status = typeof v === 'number' ? v : null;
      }
    });
    Object.defineProperty(this, 'statusText', {
      enumerable: true,
      get: () => statusText,
      set(v) {
        statusText = typeof v === 'string' ? v : null;
      }
    });
    Object.defineProperty(this, 'errors', {
      enumerable: true,
      get: () => errors,
      set(v) {
        errors = normalizeErrors(v);
        this.message = normalizeMessage(errors);
      }
    });
  }
}
registerErrorConstructor('FetchError', FetchError);
export { FetchError };
export { toFetchErrorResponse, isFetchErrorResponse, isFetchErrorData, normalizeArguments, normalizeErrors, normalizeMessage, normalizeData };