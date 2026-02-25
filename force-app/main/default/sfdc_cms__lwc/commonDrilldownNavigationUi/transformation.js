import { newTabLabel } from './labels';
import sanitizeValue from 'site/commonRichtextsanitizerUtils';
const MAX_DEPTH = 5;
var WINDOW_TARGET = function (WINDOW_TARGET) {
  WINDOW_TARGET["BLANK"] = "_blank";
  WINDOW_TARGET["SELF"] = "_self";
  return WINDOW_TARGET;
}(WINDOW_TARGET || {});
let idCounter = 0;
const MENU_ITEMS_TO_SKIP = ['SystemLink', 'Modal'];
export const toMenuItems = (items, level = 1) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.filter(item => !MENU_ITEMS_TO_SKIP.includes(item.actionType)).map(({
    actionType,
    actionValue,
    active,
    label,
    subMenu,
    target,
    pageReference
  }) => {
    const sanitizedLabel = sanitizeValue(label);
    const result = {
      id: (idCounter++).toString(),
      label: sanitizedLabel,
      active,
      target,
      href: actionValue,
      type: actionType,
      isSelected: false,
      pageReference
    };
    if (target === 'NewWindow') {
      result.ariaLabel = newTabLabel.replace('{0}', sanitizedLabel);
      result.target = WINDOW_TARGET.BLANK;
    } else {
      result.target = WINDOW_TARGET.SELF;
    }
    if (Array.isArray(subMenu) && subMenu.length && level < MAX_DEPTH) {
      result.subMenu = toMenuItems(subMenu, level + 1);
    }
    return result;
  });
};