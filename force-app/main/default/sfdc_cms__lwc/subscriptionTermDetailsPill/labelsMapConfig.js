import { termDefinedEveryMonthPillText, termDefinedEveryNMonthsPillText, termDefinedEveryYearPillText, termDefinedEveryNYearsPillText, evergreenEveryMonthPillText, evergreenEveryNMonthsPillText, evergreenEveryYearPillText, evergreenEveryNYearsPillText } from './labels';
const PRICING_TERM_UNITS = {
  MONTHS: 'Months',
  ANNUAL: 'Annual'
};
export const SELLING_MODEL_TYPES = {
  EVERGREEN: 'Evergreen',
  ONE_TIME: 'OneTime',
  TERM_DEFINED: 'TermDefined'
};
export const LABELS_MAP = {
  [SELLING_MODEL_TYPES.EVERGREEN]: {
    [PRICING_TERM_UNITS.MONTHS]: {
      ONE: evergreenEveryMonthPillText,
      MORE_THAN_ONE: evergreenEveryNMonthsPillText
    },
    [PRICING_TERM_UNITS.ANNUAL]: {
      ONE: evergreenEveryYearPillText,
      MORE_THAN_ONE: evergreenEveryNYearsPillText
    }
  },
  [SELLING_MODEL_TYPES.TERM_DEFINED]: {
    [PRICING_TERM_UNITS.MONTHS]: {
      ONE: termDefinedEveryMonthPillText,
      MORE_THAN_ONE: termDefinedEveryNMonthsPillText
    },
    [PRICING_TERM_UNITS.ANNUAL]: {
      ONE: termDefinedEveryYearPillText,
      MORE_THAN_ONE: termDefinedEveryNYearsPillText
    }
  }
};