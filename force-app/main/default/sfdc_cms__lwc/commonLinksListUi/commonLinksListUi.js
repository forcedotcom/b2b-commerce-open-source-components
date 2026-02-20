import { api, LightningElement } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import { isClickableItem, isExternalItem } from './util';
const DEFAULT_DEPTH = 0;
const DEFAULT_MAX_DEPTH = -1;
const DEFAULT_ORIENTATION = 'vertical';
const DEFAULT_MARK_ACTIVE = 0;
export const DEFAULT_H3 = 'heading3';
let idCounter = -1;
const uniqueId = () => {
  ++idCounter;
  return `${idCounter}`;
};
export default class CommonLinksListUi extends LightningElement {
  static renderMode = 'light';
  _rawItems = [];
  _rawItemsMap = {};
  _items = null;
  _depth = DEFAULT_DEPTH;
  _maxDepth = DEFAULT_MAX_DEPTH;
  _maxDepthChildren = DEFAULT_MAX_DEPTH;
  _orientation = DEFAULT_ORIENTATION;
  _markActive = DEFAULT_MARK_ACTIVE;
  _wasConnected = false;
  @api
  set items(value) {
    this._rawItems = Array.isArray(value) ? value.map(item => this.ensureItemId(item)) : [];
    this._rawItemsMap = this._rawItems.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    this._items = this.computeItems();
  }
  get items() {
    return this._items;
  }
  @api
  set depth(value) {
    const numberValue = typeof value === 'string' ? parseInt(value, 10) : value;
    this._depth = Number.isInteger(numberValue) && numberValue >= 0 ? numberValue : DEFAULT_DEPTH;
  }
  get depth() {
    return this._depth;
  }
  get depthChildren() {
    return this._depth + 1;
  }
  @api
  set maxDepth(value) {
    const numberValue = typeof value === 'string' ? parseInt(value, 10) : value;
    const maxDepth = Number.isInteger(numberValue) && numberValue >= 1 ? numberValue : DEFAULT_MAX_DEPTH;
    if (maxDepth === -1) {
      this._maxDepth = this._maxDepthChildren = -1;
    } else {
      this._maxDepth = Math.max(1, maxDepth);
      this._maxDepthChildren = Math.max(0, maxDepth - 1);
    }
    this._items = this.computeItems();
  }
  get maxDepth() {
    return this._maxDepth;
  }
  get maxDepthChildren() {
    return this._maxDepthChildren;
  }
  @api
  set orientation(value) {
    this._orientation = value === 'horizontal' ? value : DEFAULT_ORIENTATION;
  }
  get orientation() {
    return this._orientation;
  }
  @api
  linkColor;
  @api
  linkHoverColor;
  @api
  lineItemPadding;
  @api
  linkTextAlign;
  @api
  linkTextWeight;
  @api
  linkTextStyle;
  @api
  linkTextDecoration;
  @api
  linkTextFontSize;
  @api
  linkTextFontFamily;
  @api
  textNodeTag = DEFAULT_H3;
  get isH1() {
    return this.textNodeTag === 'heading1';
  }
  get isH2() {
    return this.textNodeTag === 'heading2';
  }
  get isH3() {
    return this.textNodeTag === 'heading3';
  }
  get isH4() {
    return this.textNodeTag === 'heading4';
  }
  get isH5() {
    return this.textNodeTag === 'heading5';
  }
  get isH6() {
    return this.textNodeTag === 'heading6';
  }
  get isBody() {
    return this.textNodeTag === 'paragraph';
  }
  get customStyles() {
    return generateStyleProperties({
      '--com-c-link-list-anchor-text-color': this.linkColor ?? '',
      '--com-c-link-list-anchor-text-hover-color': this.linkHoverColor ?? '',
      '--com-c-link-list-font-weight': this.linkTextWeight ?? '',
      '--com-c-link-list-font-style': this.linkTextStyle ?? '',
      '--com-c-link-list-decoration': this.linkTextDecoration ?? '',
      '--com-c-link-list-font-size': this.linkTextFontSize ?? '',
      '--com-c-link-list-font-family': this.linkTextFontFamily ?? ''
    });
  }
  @api
  set markActive(value) {
    this._markActive = typeof value === 'number' && isFinite(value) ? value : DEFAULT_MARK_ACTIVE;
    if (this._markActive) {
      this.handleMarkActive();
    }
  }
  get markActive() {
    return this._markActive;
  }
  @api
  parentId = 'root';
  get listClasses() {
    const isHorizontal = this._orientation === 'horizontal';
    const isRoot = this._depth === 0;
    const classes = isRoot ? ['is-root'] : ['is-child', `is-child-${this._depth}`];
    if (isHorizontal) {
      classes.push('is-horizontal', 'slds-list_horizontal');
    } else if (!isHorizontal && !isRoot) {
      classes.push('slds-is-nested');
    }
    return classes;
  }
  connectedCallback() {
    this._wasConnected = true;
    this._items = this.computeItems();
  }
  handleClick(event) {
    event.preventDefault();
    const textStyleElement = event.currentTarget.parentElement;
    const parentLIElement = textStyleElement?.parentElement;
    const listEl = parentLIElement;
    listEl.dataset.active = 'true';
    if (this._depth === 0) {
      this.broadcastMarkActive();
    }
    this.dispatchEvent(this.createItemEvent('itemclick', listEl));
  }
  handleChildClick(event) {
    const {
      currentTarget
    } = event;
    currentTarget.parentElement.dataset.active = 'true';
    if (this._depth === 0) {
      this.broadcastMarkActive();
    }
  }
  handleMouseEnter(event) {
    const {
      currentTarget
    } = event;
    const listEl = currentTarget;
    listEl.classList.add('is-hovered');
    this.dispatchEvent(this.createItemEvent('itemmouseenter', listEl));
  }
  handleMouseLeave(event) {
    const {
      currentTarget
    } = event;
    const listEl = currentTarget;
    listEl.classList.remove('is-hovered');
    this.dispatchEvent(this.createItemEvent('itemmouseleave', listEl));
  }
  createItemEvent(type, target) {
    const {
      id
    } = target.dataset;
    return new CustomEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        value: this._rawItemsMap[id]
      }
    });
  }
  ensureItemId(item) {
    if (item && (typeof item.id === 'string' || typeof item.id === 'number' && isFinite(item.id)) && String(item.id).trim().length > 0) {
      return item;
    }
    const id = uniqueId();
    return {
      ...item,
      id
    };
  }
  computeItems() {
    if (!this._wasConnected || this._rawItems.length === 0) {
      return null;
    }
    if (this._maxDepthChildren === 0) {
      return this._rawItems.map(item => ({
        ...item,
        subMenu: [],
        isClickable: isClickableItem(item),
        isExternal: isExternalItem(item),
        cssClasses: `is-leaf${this.lineItemPadding ? ' ' + this.lineItemPadding : ''}`
      }));
    }
    return this._rawItems.map(item => {
      const hasChildren = Array.isArray(item.subMenu) && item.subMenu.length;
      return {
        ...item,
        subMenu: hasChildren ? [...item.subMenu] : [],
        isClickable: isClickableItem(item),
        isExternal: isExternalItem(item),
        cssClasses: `${hasChildren ? 'is-parent' : 'is-leaf'}${this.lineItemPadding ? ' ' + this.lineItemPadding : ''}`
      };
    });
  }
  broadcastMarkActive() {
    this._markActive = this._markActive + 1;
    this.handleMarkActive();
  }
  handleMarkActive() {
    if (!import.meta.env.SSR) {
      const listEls = this.querySelectorAll(`ul > li[data-parent-id="${this.parentId}"]`);
      listEls.forEach(listEl => {
        if (listEl.dataset.active === 'true') {
          listEl.classList.add('is-active');
          delete listEl.dataset.active;
        } else {
          listEl.classList.remove('is-active');
        }
      });
    }
  }
}