import cardTypeIconTitle from '@salesforce/label/site.paymentSavedPaymentMethodsCard.cardTypeIconTitle';
import cardExpiredDateLabel from '@salesforce/label/site.paymentSavedPaymentMethodsCard.cardExpiredDateLabel';
import { VISA, MASTERCARD, AMEX, DINERS, DISCOVER, UNIONPAY, JCB, ACH, BACS, BECS, CREDIT_CARD, IDEAL, BANCONTACT, SEPA_DEBIT } from './icons';
const CARD_BRANDS = ['visa', 'mastercard', 'amex', 'diners', 'discover', 'unionpay', 'jcb', 'mc', 'cup'];
const DEFAULT_CARD_ICON = 'credit_card';
export function getCardIconName(network) {
  if (CARD_BRANDS.includes(network.toLowerCase())) {
    return network.toLowerCase();
  }
  return DEFAULT_CARD_ICON;
}
export function generateIcon(type = '', network = '') {
  let image = '';
  if (type && type.toLowerCase() === 'card') {
    switch (getCardIconName(network)) {
      case CARD_BRANDS[0]:
        {
          image = VISA;
          break;
        }
      case CARD_BRANDS[1]:
      case CARD_BRANDS[7]:
        {
          image = MASTERCARD;
          break;
        }
      case CARD_BRANDS[2]:
        {
          image = AMEX;
          break;
        }
      case CARD_BRANDS[3]:
        {
          image = DINERS;
          break;
        }
      case CARD_BRANDS[4]:
        {
          image = DISCOVER;
          break;
        }
      case CARD_BRANDS[5]:
      case CARD_BRANDS[8]:
        {
          image = UNIONPAY;
          break;
        }
      case CARD_BRANDS[6]:
        {
          image = JCB;
          break;
        }
      default:
        {
          image = CREDIT_CARD;
          break;
        }
    }
  } else if (type) {
    switch (type.toLowerCase()) {
      case 'us_bank_account':
        {
          image = ACH;
          break;
        }
      case 'bacs_debit':
        {
          image = BACS;
          break;
        }
      case 'au_becs_debit':
        {
          image = BECS;
          break;
        }
      case 'ideal':
        {
          image = IDEAL;
          break;
        }
      case 'bancontact':
        {
          image = BANCONTACT;
          break;
        }
      case 'sepa_debit':
        {
          image = SEPA_DEBIT;
          break;
        }
      default:
        {
          break;
        }
    }
  }
  return image;
}
export function generateIconTitle(type = '', network = '') {
  return cardTypeIconTitle.replace('{0}', network ? network : type);
}
export function formatExpiredDate(expirationMonth = '', expirationYear = '') {
  return cardExpiredDateLabel.replace('{0}', expirationMonth).replace('{1}', expirationYear);
}