import { LightningElement, api } from 'lwc';
import { KEY, INPUT_DEBOUNCE_DELAY } from './constants';
import { computeDisplayItems, computeAdvancedSearchItem, generateRandomId, findHighlightedItemIndex, setItemHighlight, mapItemsToSuggestions } from './utils';
import { debounce, clearDebounceTimeout } from 'experience/utils';
import { computeMarkedItems } from './highlightingUtils';
import { generateMatchingStyles } from 'experience/styling';
export default class CommonCombobox extends LightningElement {
  static renderMode = 'light';
  _focused = false;
  @api
  get items() {
    return this._items;
  }
  set items(value) {
    this._items = value;
    let displayItems = computeDisplayItems(value);
    if (this.showHighlightning) {
      displayItems = computeMarkedItems(displayItems, this._searchTerm);
    }
    let advancedSearchItem;
    if (this.showAdvancedSearch && this._searchTerm && this._focused) {
      advancedSearchItem = computeAdvancedSearchItem(this._searchTerm);
    }
    if (advancedSearchItem) {
      displayItems = [advancedSearchItem, ...displayItems];
    }
    this._displayItems = displayItems;
  }
  @api
  showSearchButton = false;
  @api
  showActivityIndicator = false;
  @api
  showAdvancedSearch = false;
  @api
  showHighlightning = false;
  @api
  inputPlaceholderText = '';
  @api
  customStyles;
  @api
  get term() {
    return this._searchTerm;
  }
  set term(newTerm) {
    this._searchTerm = newTerm;
  }
  get _normalizedTerm() {
    return this._searchTerm || '';
  }
  _displayItems = [];
  _items = [];
  _searchTerm = '';
  _listBoxId = generateRandomId();
  _activeOptionId;
  _listBoxExpanded = false;
  get customListBoxStyles() {
    const styles = this.customStyles || {};
    return {
      ...generateMatchingStyles(styles, 'suggestions-'),
      ...generateMatchingStyles(styles, 'search-container-')
    };
  }
  notifyInputTextChangePromise;
  renderedCallback() {
    this.syncA11y();
  }
  disconnectedCallback() {
    this.notifyInputTextChangePromise && clearDebounceTimeout(this.notifyInputTextChangePromise);
  }
  handleKeyDown(event) {
    const index = findHighlightedItemIndex(this._displayItems);
    switch (event.key) {
      case KEY.ARROW_DOWN:
        this.highlightItem(index, +1);
        break;
      case KEY.ARROW_UP:
        this.highlightItem(index, -1);
        break;
      case KEY.ENTER:
        this.handleEnterKeyDown(event);
        break;
      default:
        break;
    }
  }
  highlightItem(baseIndex, steps) {
    const itemCount = this._displayItems.length;
    let newActiveIndex = (baseIndex + steps) % itemCount;
    if (newActiveIndex < 0) {
      newActiveIndex = itemCount - 1;
    }
    const newDisplayItems = setItemHighlight([...this._displayItems], newActiveIndex);
    this._displayItems = newDisplayItems;
  }
  handleInputTextChange(event) {
    event.stopPropagation();
    this._searchTerm = event.detail.text;
    this.notifyInputTextChangePromise = this.notifyInputTextChangeDebounced();
  }
  notifyInputTextChangeDebounced = debounce(() => {
    this.dispatchEvent(new CustomEvent('searchtermchange', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        searchTerm: this._searchTerm
      }
    }));
  }, INPUT_DEBOUNCE_DELAY);
  handleEnterKeyDown(event) {
    const position = findHighlightedItemIndex(this._displayItems);
    if (event.isComposing || event.keyCode === 229) {
      return;
    }
    if (position > -1) {
      const {
        value,
        category
      } = this._displayItems[position];
      const selectionValue = category === 'advanced-search' ? this._searchTerm : value;
      this.notifyOptionSelection({
        value: selectionValue,
        position: position + 1,
        category
      });
    } else {
      this.notifySearchAction(this._searchTerm);
    }
  }
  handleOptionSelection(event) {
    event.stopPropagation();
    const {
      value,
      position,
      category
    } = event.detail;
    this.notifyOptionSelection({
      value,
      position,
      category
    });
  }
  notifyOptionSelection(option) {
    const {
      value,
      position,
      category
    } = option;
    const createSuggestionArray = mapItemsToSuggestions(this._items);
    this.dispatchEvent(new CustomEvent('searchoptionselection', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        value,
        position,
        category
      }
    }));
  }
  handleInputFocused(event) {
    this._focused = true;
  }
  handleInputBlur(event) {
    event.stopPropagation();
    this._focused = false;
    this._displayItems = [];
  }
  handleInputClear(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('searchtermchange', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        searchTerm: ''
      }
    }));
  }
  handleInputClick(event) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('searchlistopenrequest', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        searchTerm: this._searchTerm
      }
    }));
  }
  handleSearch(event) {
    event.stopPropagation();
    const {
      searchTerm
    } = event.detail;
    this.notifySearchAction(searchTerm);
  }
  notifySearchAction(searchTerm) {
    this.dispatchEvent(new CustomEvent('searchrequest', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        searchTerm
      }
    }));
  }
  syncA11y() {
    if (this._displayItems.length) {
      if (!this._listBoxId) {
        this._listBoxId = generateRandomId();
      }
      this._listBoxExpanded = true;
    } else {
      this._listBoxId = null;
      this._listBoxExpanded = false;
    }
    const input = this.querySelector('site-search-input-suggestions');
    const index = findHighlightedItemIndex(this._displayItems);
    if (index >= 0) {
      this._activeOptionId = this._displayItems[index].id;
    } else {
      this._activeOptionId = '';
    }
    input.listBoxId = this._listBoxId;
    input.listBoxExpanded = this._listBoxExpanded;
    input.activeOptionId = this._activeOptionId;
    const listBox = this.querySelector('site-search-listbox');
    listBox.listBoxId = this._listBoxId;
  }
}