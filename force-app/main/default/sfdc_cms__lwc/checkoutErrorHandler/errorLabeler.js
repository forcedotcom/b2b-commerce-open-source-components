import { PaymentAuthorizationError } from 'site/paymentAuthorizationError';
import { genericErrorHeader, unknownErrorBody, noDeliveryAddressesBody, noDeliveryMethodsErrorLabel, insufficientInventoryBody, insufficientInventoryHeader, invalidContactPhoneBody, fatalErrorBody, returnToCart, returnToCheckout, paymentErrorBody, paymentErrorHeader } from './labels';
import { FetchError } from './fetchError';
export let CheckoutError = function (CheckoutError) {
  CheckoutError["CANNOT_START_CHECKOUT"] = "CANNOT_START_CHECKOUT";
  CheckoutError["CANNOT_POLL_CHECKOUT"] = "CANNOT_POLL_CHECKOUT";
  CheckoutError["NULL_CHECKOUT_JSON"] = "NULL_CHECKOUT_JSON";
  CheckoutError["NULL_CHECKOUTID"] = "NULL_CHECKOUTID";
  CheckoutError["SESSION_IN_ERROR"] = "SESSION_IN_ERROR";
  CheckoutError["SESSION_NOT_LOADED"] = "SESSION_NOT_LOADED";
  CheckoutError["NO_DELIVERY_ADDRESSES"] = "NO_DELIVERY_ADDRESSES";
  CheckoutError["INSUFFICIENT_INVENTORY"] = "INSUFFICIENT_INVENTORY";
  CheckoutError["NO_DELIVERY_METHODS"] = "NO_DELIVERY_METHODS";
  CheckoutError["CHECKOUT_FORM_BUSY"] = "CHECKOUT_FORM_BUSY";
  CheckoutError["MISSING_DELIVERY_GROUP_ID"] = "MISSING_DELIVERY_GROUP_ID";
  CheckoutError["MISSING_ORDER_REFERENCE_NUMBER"] = "MISSING_ORDER_REFERENCE_NUMBER";
  CheckoutError["INVALID_CONTACT_PHONE"] = "INVALID_CONTACT_PHONE";
  CheckoutError["PAYMENT_ORPHANED"] = "PAYMENT_ORPHANED";
  return CheckoutError;
}({});
export const noErrorLabels = {
  body: '',
  header: ''
};
export const unknownErrorLabels = {
  body: unknownErrorBody,
  header: genericErrorHeader
};
export const noDeliveryMethodsLabels = {
  body: noDeliveryMethodsErrorLabel,
  header: genericErrorHeader
};
export const fatalErrorLabels = {
  body: fatalErrorBody,
  header: genericErrorHeader,
  returnToCart: returnToCart
};
export const paymentErrorLabels = {
  body: paymentErrorBody,
  header: genericErrorHeader,
  redirectHeader: paymentErrorHeader,
  returnToCheckout
};
function isPlatformError(error) {
  return !!error && typeof error === 'object' && 'errorCode' in error && typeof error.errorCode === 'string' && 'message' in error && typeof error.message === 'string';
}
function isPlatformErrors(errors) {
  return !!errors && typeof errors === 'object' && Array.isArray(errors) && isPlatformError(errors[0]);
}
function isIntegrationError(error) {
  return !!error && typeof error === 'object' && 'detail' in error && typeof error.detail === 'string';
}
function isIntegrationErrors(errors) {
  return !!errors && typeof errors === 'object' && Array.isArray(errors) && isIntegrationError(errors[0]);
}
function convertErrorBody(error) {
  if (!error.message) {
    return fatalErrorBody;
  }
  switch (error.message) {
    case CheckoutError.CANNOT_POLL_CHECKOUT:
    case CheckoutError.CANNOT_START_CHECKOUT:
    case CheckoutError.NULL_CHECKOUTID:
    case CheckoutError.NULL_CHECKOUT_JSON:
    case CheckoutError.SESSION_IN_ERROR:
    case CheckoutError.SESSION_NOT_LOADED:
      return fatalErrorBody;
    case CheckoutError.NO_DELIVERY_ADDRESSES:
      return noDeliveryAddressesBody;
    case CheckoutError.NO_DELIVERY_METHODS:
      return noDeliveryMethodsErrorLabel;
    case CheckoutError.INSUFFICIENT_INVENTORY:
      return insufficientInventoryBody;
    case CheckoutError.INVALID_CONTACT_PHONE:
      return invalidContactPhoneBody;
    default:
      {
        return error.message;
      }
  }
}
function generateErrorHeader(error) {
  if (!error.message) {
    return genericErrorHeader;
  }
  switch (error.message) {
    case CheckoutError.INSUFFICIENT_INVENTORY:
      return insufficientInventoryHeader;
    default:
      {
        return genericErrorHeader;
      }
  }
}
function isExceptionWithError(exception) {
  return !!exception && typeof exception === 'object' && 'error' in exception;
}
function isExceptionWithErrors(exception) {
  return !!exception && typeof exception === 'object' && 'errors' in exception;
}
export function isCheckoutIntegrationError(checkoutInformation) {
  const errors = checkoutInformation?.errors;
  return Array.isArray(errors) && errors.length > 0;
}
export function generateErrorDetail(exception = '') {
  if (typeof exception === 'string' && exception) {
    return exception;
  } else if (exception instanceof PaymentAuthorizationError) {
    return exception.paymentError?.detail || paymentErrorBody;
  } else if (isExceptionWithError(exception) && isPlatformErrors(exception.error) && exception.error?.length) {
    return exception.error[0].message;
  } else if (isExceptionWithErrors(exception) && isIntegrationErrors(exception.errors) && exception.errors?.length) {
    return exception.errors[0].detail;
  } else if (isPlatformErrors(exception) && exception?.length) {
    return exception[0].message;
  } else if (exception instanceof FetchError) {
    return exception.errors[0].message;
  } else if (exception instanceof Error) {
    return convertErrorBody(exception);
  }
  return unknownErrorBody;
}
export function generateErrorLabel(exception = '', defaultErrorLabel = unknownErrorLabels) {
  const errorLabels = {
    ...defaultErrorLabel
  };
  errorLabels.body = generateErrorDetail(exception);
  if (exception instanceof Error) {
    errorLabels.header = generateErrorHeader(exception);
  }
  return errorLabels;
}
export function generateNotificationLabel(notification) {
  const errorLabels = {
    ...unknownErrorLabels
  };
  if (notification?.detail) {
    errorLabels.body = notification.detail;
  }
  if (notification?.type === '/commerce/errors/payment-failure') {
    errorLabels.header = paymentErrorHeader;
  }
  if (notification?.type === '/commerce/global/place-order') {
    errorLabels.returnToCart = returnToCart;
  }
  return errorLabels;
}
export function generateCheckoutIntegrationErrorLabel(checkoutInformation) {
  const errorDetail = checkoutInformation?.errors?.[0]?.detail;
  return generateErrorLabel(errorDetail);
}
export function generateCheckoutInformationErrorLabel(checkoutInformation) {
  if (checkoutInformation?.error) {
    return generateErrorLabel(checkoutInformation.error);
  }
  if (isCheckoutIntegrationError(checkoutInformation?.data)) {
    return generateCheckoutIntegrationErrorLabel(checkoutInformation?.data);
  }
  return noErrorLabels;
}
export function isCheckoutInformationError(checkoutInformation) {
  return !!checkoutInformation?.error || isCheckoutIntegrationError(checkoutInformation?.data);
}
export function unwrapActionError(e) {
  if (isExceptionWithError(e)) {
    return e.error;
  }
  return e;
}