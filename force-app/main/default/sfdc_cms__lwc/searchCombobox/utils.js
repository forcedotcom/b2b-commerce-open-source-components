import { i18n } from './labels';
import { OPTION_TYPE } from './constants';
export const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 9);
};
export const findHighlightedItemIndex = (items = []) => {
  return items.findIndex(item => {
    return item.highlight;
  });
};
export const mapItemsToSuggestions = items => {
  return items.map(item => ({
    value: item?.text ?? ''
  }));
};
export const setItemHighlight = (items = [], index) => {
  return items.map((item, idx) => {
    const data = {
      ...item
    };
    if (idx === index) {
      data.highlight = true;
    } else {
      data.highlight = false;
    }
    return data;
  });
};
export const computeDisplayItems = (items = []) => {
  return items.map(item => {
    const type = item.type || '';
    let _item;
    switch (type) {
      case OPTION_TYPE.OPTION_INLINE:
        _item = {
          ...item,
          category: item.category || '',
          id: generateRandomId(),
          highlight: false,
          title: item.text,
          value: item.text
        };
        break;
      default:
        _item = {
          ...item
        };
        break;
    }
    return _item;
  });
};
export const computeAdvancedSearchItem = (searchTerm = '') => {
  let item = {};
  if (!searchTerm) {
    return item;
  }
  const searchForText = i18n.searchFor.replace('{searchTerm}', searchTerm);
  item = {
    id: generateRandomId(),
    type: OPTION_TYPE.OPTION_INLINE,
    category: 'advanced-search',
    text: searchForText,
    title: searchForText,
    highlight: true,
    iconName: 'utility:search',
    iconAlternativeText: i18n.search,
    value: searchTerm
  };
  return item;
};