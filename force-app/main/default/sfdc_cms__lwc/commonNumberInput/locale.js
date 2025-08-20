import locale from '@salesforce/i18n/locale';
import decimalSeparator from '@salesforce/i18n/number.decimalSeparator';
import groupingSeparator from '@salesforce/i18n/number.groupingSeparator';
export const getLocale = () => locale;
export const getDecimalSeparator = () => decimalSeparator;
export const getGroupingSeparator = () => groupingSeparator;