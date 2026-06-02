import { getSiteKey, initUser, registerBuyer, verifyUser } from 'commerce/loginApi';
import { internalError, incorrectCodeError } from './labels';
import { RECAPTCHA_URL, RECAPTCHA_SUBMIT } from './constants';
import PasswordlessLoginModal from 'site/commonPasswordlessLoginModal';
import Toast from 'site/commonToast';
import { loadScript } from 'lightning/platformResourceLoader';
const REGISTRATION_ADDRESS_KEYS = ['name', 'firstName', 'lastName', 'companyName', 'street', 'city', 'postalCode', 'region', 'country'];
export function toRegistrationAddress(address) {
  const out = {};
  if (!address) {
    return out;
  }
  for (const key of REGISTRATION_ADDRESS_KEYS) {
    if (address[key] !== undefined) {
      out[key] = address[key];
    }
  }
  return out;
}
function handleLoginError(msg, element) {
  Toast.show({
    label: msg,
    variant: 'error'
  }, element);
}
async function reInitializeUser(loginInfo, element) {
  let currentToken;
  const siteKey = (await getSiteKey({
    registrationProcess: loginInfo.regProcess
  })).siteKey;
  if (siteKey) {
    try {
      currentToken = await globalThis.grecaptcha.execute(siteKey, {
        action: RECAPTCHA_SUBMIT
      });
    } catch {
      currentToken = '';
    }
  }
  const options = {
    registrationProcess: loginInfo.regProcess,
    verificationMethod: loginInfo.verificationMethod,
    userData: {
      Email: loginInfo.email
    },
    customData: {
      useEmailVerificationMethod: loginInfo.verificationMethod === 'Email' ? true : false
    },
    templateId: '',
    captchaToken: currentToken
  };
  try {
    const response = await initUser(options);
    if (response.success && response.verificationMethod) {
      loginInfo.requestId = response.requestId;
      loginInfo.phoneNumber = response.verificationRecipient;
      loginInfo.verificationMethod = response.verificationMethod;
    }
  } catch (error) {
    handleLoginError(internalError, element);
  }
}
async function verifyUserAndRedirect(loginInfo, event) {
  event.detail.callback('', true);
  const options = {
    otp: event.detail.otp,
    requestId: loginInfo.requestId,
    startUrl: loginInfo.startUrlString,
    registrationProcess: loginInfo.regProcess,
    verificationMethod: loginInfo.verificationMethod,
    userData: {
      Email: loginInfo.email,
      MobilePhone: loginInfo.phoneNumber
    },
    customData: {
      useEmailVerificationMethod: loginInfo.verificationMethod === 'Email' ? true : false
    }
  };
  try {
    const response = await verifyUser(options);
    if (response.success) {
      window.open(response.redirectUrl, '_self');
    }
  } catch (error) {
    event.detail.callback(incorrectCodeError, false);
  }
}
async function handleOpenModal(loginInfo, element) {
  await PasswordlessLoginModal.open({
    size: 'small',
    description: 'One time passcode modal',
    deliveryMethod: loginInfo.verificationMethod,
    phoneNumber: loginInfo.phoneNumber,
    onsubmit: e => {
      verifyUserAndRedirect(loginInfo, e);
    },
    onresend: () => {
      reInitializeUser(loginInfo, element);
    },
    onemailswitch: () => {
      loginInfo.verificationMethod = 'Email';
      reInitializeUser(loginInfo, element);
    }
  });
}
export async function initializeUser(loginInfo, element) {
  let currentToken;
  const siteKey = (await getSiteKey({
    registrationProcess: loginInfo.regProcess
  })).siteKey;
  if (siteKey) {
    try {
      currentToken = await globalThis.grecaptcha.execute(siteKey, {
        action: RECAPTCHA_SUBMIT
      });
    } catch {
      currentToken = '';
    }
  }
  const options = {
    registrationProcess: loginInfo.regProcess,
    verificationMethod: loginInfo.verificationMethod,
    userData: {
      Email: loginInfo.email
    },
    customData: {
      useEmailVerificationMethod: loginInfo.verificationMethod === 'Email' ? true : false
    },
    templateId: '',
    captchaToken: currentToken
  };
  try {
    const response = await initUser(options);
    if (response.success && response.verificationMethod) {
      loginInfo.requestId = response.requestId;
      loginInfo.phoneNumber = response.verificationRecipient;
      loginInfo.verificationMethod = response.verificationMethod;
      handleOpenModal(loginInfo, element);
    }
    return response;
  } catch (error) {
    handleLoginError(internalError, element);
    return {
      success: false
    };
  }
}
export async function registerCheckoutUser(regProcess, checkoutDetails, registerOptions) {
  let currentToken;
  const siteKey = (await getSiteKey({
    registrationProcess: regProcess
  })).siteKey;
  if (siteKey) {
    currentToken = await globalThis.grecaptcha.execute(siteKey, {
      action: RECAPTCHA_SUBMIT
    });
  }
  const useBillingAddressForRegistration = registerOptions?.useBillingAddressForRegistration === true;
  const billingAddress = checkoutDetails?.billingInfo?.address;
  const deliveryAddress = checkoutDetails?.deliveryGroups?.items?.[0]?.deliveryAddress;
  const rawAddresses = useBillingAddressForRegistration ? billingAddress ? [billingAddress] : [] : deliveryAddress ? [deliveryAddress] : [];
  const addresses = rawAddresses.map(toRegistrationAddress);
  const options = {
    captchaToken: currentToken,
    email: checkoutDetails?.contactInfo?.email,
    phoneNumber: checkoutDetails?.contactInfo?.phoneNumber,
    firstName: checkoutDetails?.contactInfo?.firstName,
    lastName: checkoutDetails?.contactInfo?.lastName,
    addressList: {
      addresses
    }
  };
  return registerBuyer(options);
}
export async function loadCaptcha(regProcess, element) {
  let siteKey = '';
  const options = {
    registrationProcess: regProcess
  };
  const response = await getSiteKey(options);
  if (response?.siteKey) {
    siteKey = response.siteKey;
  }
  const scriptExists = document.querySelector(`script[src^="${RECAPTCHA_URL}"]`);
  if (!scriptExists) {
    loadScript(element, RECAPTCHA_URL + siteKey);
  }
}