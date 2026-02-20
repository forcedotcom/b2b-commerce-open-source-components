import { api, LightningElement, wire, track } from 'lwc';
import { NavigationContext, generateUrl, navigate } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import { generateTextFormatStyles, generatePaddingClass, generateThemeTextSizeProperty } from 'experience/styling';
const MENU_ITEMS_TO_SKIP = ['SystemLink', 'Modal'];
const DEFAULT_ORIENTATION = 'vertical';
const DEFAULT_MAX_DEPTH = 1;
const textNodeMap = {
  h1: 'heading1',
  h2: 'heading2',
  h3: 'heading3',
  h4: 'heading4',
  h5: 'heading5',
  h6: 'heading6',
  p: 'paragraph'
};

/**
 * @slot header
 */
export default class CommonLinksList extends LightningElement {
  static renderMode = 'light';
  _orientation = DEFAULT_ORIENTATION;
  _maxDepth = DEFAULT_MAX_DEPTH;
  _rawTextDisplayInfo = '{}';
  @track
  _parsedDisplayInfo = {};
  @api
  navigationMenuData;
  get linkListItems() {
    return Array.isArray(this.navigationMenuData) ? this.prepareItems(this.navigationMenuData) : [];
  }
  @api
  set orientation(value) {
    this._orientation = value === 'horizontal' ? value : DEFAULT_ORIENTATION;
  }
  get orientation() {
    return this._orientation;
  }
  @api
  set maxDepth(value) {
    const numberValue = typeof value === 'string' ? parseInt(value, 10) : value;
    this._maxDepth = Number.isInteger(numberValue) && (numberValue >= 1 || numberValue === -1) ? numberValue : DEFAULT_MAX_DEPTH;
  }
  get maxDepth() {
    return this._maxDepth;
  }
  @api
  linkColor;
  @api
  linkHoverColor;
  @api
  textAlign;
  @api
  get textDisplayInfo() {
    return this._rawTextDisplayInfo;
  }
  set textDisplayInfo(value) {
    this._rawTextDisplayInfo = value;
    this._parsedDisplayInfo = JSON.parse(value);
  }
  get textNodeTag() {
    return textNodeMap[this._parsedDisplayInfo?.headingTag || 'h3'];
  }
  @api
  textDecoration = '{}';
  @api
  linkSpacing;
  get hasItems() {
    return this.linkListItems.length > 0;
  }
  @wire(NavigationContext)
  navContext;
  handleItemClick(event) {
    const {
      value
    } = event.detail;
    const {
      actionType
    } = value;
    let {
      actionValue = ''
    } = value;
    const pageReference = {
      type: 'standard__webPage',
      attributes: {
        url: actionValue
      }
    };
    if (actionType === 'InternalLink' && actionValue?.startsWith(basePath)) {
      actionValue = actionValue.substring(basePath.length);
      pageReference.attributes.url = actionValue;
      navigate(this.navContext, pageReference);
    } else {
      const generatedUrl = generateUrl(this.navContext, pageReference);
      window.open(generatedUrl, '_self');
    }
  }
  prepareItems(items) {
    return items.filter(item => !MENU_ITEMS_TO_SKIP.includes(item.actionType)).reduce((acc, item, idx) => {
      acc.push(this.prepareItem(item, String(idx)));
      return acc;
    }, []);
  }
  prepareItem(item, id) {
    const clone = {
      ...item,
      id
    };
    if (Array.isArray(clone.subMenu) && clone.subMenu.length > 0) {
      clone.subMenu = clone.subMenu.map((subItem, subIdx) => this.prepareItem(subItem, `${id}_${subIdx}`));
    }
    return clone;
  }
  get dxpClassForSize() {
    const _textStyle = this._parsedDisplayInfo?.textStyle || 'heading-small';
    return generateThemeTextSizeProperty(_textStyle);
  }
  get computedTextStyles() {
    const computedStyles = generateTextFormatStyles(JSON.parse(this.textDecoration));
    return {
      weight: computedStyles.weight ? computedStyles.weight : '',
      style: computedStyles.style ? computedStyles.style : '',
      decoration: computedStyles.decoration ? computedStyles.decoration : ''
    };
  }
  get linkTextWeight() {
    return this.computedTextStyles.weight || 'var(' + this.dxpClassForSize + '-font-weight)';
  }
  get linkTextStyle() {
    return this.computedTextStyles.style || 'var(' + this.dxpClassForSize + '-font-style)';
  }
  get linkTextDecoration() {
    return this.computedTextStyles.decoration || 'var(' + this.dxpClassForSize + '-text-decoration)';
  }
  get linkTextFontSize() {
    return 'var(' + this.dxpClassForSize + '-font-size)';
  }
  get linkTextFontFamily() {
    return 'var(' + this.dxpClassForSize + '-font-family)';
  }
  get lineItemPadding() {
    return generatePaddingClass(this.linkSpacing || 'none', 'vertical') || '';
  }
}