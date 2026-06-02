import { past6Month, pastYear, allTime } from './labels';
export const PAST_6_MONTHS = 'past6Months';
export const PAST_YEAR = 'pastYear';
export const ALL_TIME = 'allTime';
export const DATE_FILTER_OPTIONS = [{
  value: PAST_6_MONTHS,
  label: past6Month
}, {
  value: PAST_YEAR,
  label: pastYear
}, {
  value: ALL_TIME,
  label: allTime
}];