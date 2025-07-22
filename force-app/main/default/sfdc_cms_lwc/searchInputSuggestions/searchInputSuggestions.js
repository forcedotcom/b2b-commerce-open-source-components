import { LightningElement, api } from 'lwc';
import { i18n } from './labels';
import { generateStyleProperties } from 'experience/styling';
import { FixedBorderStyles, KEY } from './constants';
import { generateRandomId } from './utils';
import BasePath from '@salesforce/community/basePath';
export default class SearchInputSuggestions extends LightningElement {
  static renderMode = 'light';
  @api
  get listBoxId() {
    return this._listBoxId;
  }
  set listBoxId(value) {
    this._listBoxId = value;
    this.syncA11y();
  }
  @api
  get listBoxExpanded() {
    return this._listBoxExpanded;
  }
  set listBoxExpanded(value) {
    this._listBoxExpanded = !!value;
    this.syncA11y();
  }
  @api
  get activeOptionId() {
    return this._activeOptionId;
  }
  set activeOptionId(value) {
    this._activeOptionId = value;
    this.syncA11y();
  }
  _showActivityIndicator = false;
  @api
  get showActivityIndicator() {
    return this._showActivityIndicator;
  }
  set showActivityIndicator(show) {
    this._showActivityIndicator = show;
  }
  @api
  get showSearchButton() {
    return this._showSearchButton;
  }
  set showSearchButton(value) {
    this._showSearchButton = !!value;
  }
  @api
  inputPlaceholderText = '';
  @api
  customStyles;
  @api
  focus() {
    this.inputElement.focus();
  }
  get searchIconPath() {
    return `${BasePath}/assets/icons/search.svg#search`;
  }
  _listBoxId;
  _listBoxExpanded = false;
  _activeOptionId;
  _showSearchButton = false;
  _inputValue;
  _isActive = false;
  _isSearchButtonFocused = false;
  _isSearchButtonHovering = false;
  get inputElement() {
    return this.querySelector('input');
  }
  @api
  get text() {
    let inputText = this._inputValue;
    if (this.inputElement !== null) {
      inputText = this.inputElement.value;
    }
    return inputText;
  }
  set text(newInputText) {
    this._inputValue = newInputText;
  }
  get _normalizedText() {
    return this._inputValue || '';
  }
  get i18n() {
    return i18n;
  }
  get inputWrapperClass() {
    let classes = ['input-wrapper'];
    if (this._isActive) {
      classes = [...classes, 'active'];
    }
    if (!this.showSearchButton) {
      classes = [...classes, 'slds-input-has-icon slds-input-has-icon_left'];
    }
    return classes;
  }
  get searchInputClass() {
    return this.showSearchButton ? 'search-input-with-button' : 'search-input-without-button';
  }
  get inputBorderStyles() {
    let style;
    if (this.listBoxExpanded) {
      style = FixedBorderStyles.expandedListBoxBottomBorderSearchInputStylesButtonHidden;
      if (this.showSearchButton) {
        style = FixedBorderStyles.expandedListBoxBottomBorderSearchInputStylesButtonShown;
      }
    } else if (this.showSearchButton) {
      style = FixedBorderStyles.inputWithAdjacentSearchButtonRightBorderStyles;
    }
    return style;
  }
  get searchInputStyle() {
    const styles = {
      ...this.getContainerStyles(),
      ...this.getInputStyles()
    };
    const definedStyles = Object.fromEntries(Object.entries(styles).filter(([, value]) => value !== undefined));
    const inputStyles = generateStyleProperties(definedStyles);
    return `${inputStyles};${this.inputBorderStyles}`;
  }
  get searchButtonStyle() {
    const isHovering = this._isSearchButtonHovering || this._isSearchButtonFocused;
    const buttonStyles = [{
      name: 'background-color',
      value: isHovering ? this.customStyles?.['search-button-background-hover-color'] : this.customStyles?.['search-button-background-color']
    }, {
      name: 'color',
      value: isHovering ? this.customStyles?.['search-button-hover-color'] : this.customStyles?.['search-button-color']
    }, {
      name: 'border-color',
      value: this.customStyles?.['search-container-border-color']
    }, {
      name: 'border-radius',
      value: this.customStyles?.['search-container-border-radius']
    }];
    const btnStyles = generateStyleProperties(buttonStyles);
    if (this.listBoxExpanded) {
      return `${btnStyles}; ${FixedBorderStyles.expandedListBoxBottomBorderSearchButtonStyles}`;
    }
    return `${btnStyles}; ${FixedBorderStyles.buttonLeftBorderStyles}`;
  }
  get searchIconStyles() {
    const iconStyles = {
      fill: this.customStyles?.['search-input-icon-color'] || ''
    };
    return generateStyleProperties(iconStyles);
  }
  get _customCSSProperties() {
    const customPropertyStyles = {
      '--b2b-search-color-text-placeholder': this.customStyles?.['search-input-text-placeholder-color'] || ''
    };
    return generateStyleProperties(customPropertyStyles);
  }
  getInputStyles() {
    return {
      'background-color': this.customStyles?.['search-input-background-color'],
      'border-style': this.customStyles?.['search-input-border-style'],
      color: this.customStyles?.['search-input-color']
    };
  }
  getContainerStyles() {
    return {
      'border-color': this.customStyles?.['search-container-border-color'],
      'border-radius': this.customStyles?.['search-container-border-radius']
    };
  }
  get _showClearButton() {
    return this._normalizedText.length > 0;
  }
  handleInputChange(event) {
    const text = event.target.value;
    this.dispatchEvent(new CustomEvent('inputtextchange', {
      bubbles: true,
      cancelable: true,
      detail: {
        text
      }
    }));
  }
  handleInputBlur() {
    this._isActive = false;
    this.dispatchEvent(new CustomEvent('inputblur', {
      bubbles: true,
      cancelable: true
    }));
  }
  handleInputFocus() {
    this._isActive = true;
    this.dispatchEvent(new CustomEvent('inputfocused', {
      bubbles: true,
      cancelable: true
    }));
  }
  handleInputClick() {
    this.dispatchEvent(new CustomEvent('inputclick', {
      bubbles: true,
      cancelable: true
    }));
  }
  handleSearchButtonClick() {
    this.dispatchEvent(new CustomEvent('searchrequest', {
      bubbles: true,
      cancelable: true,
      detail: {
        searchTerm: this._inputValue
      }
    }));
  }
  handleSearchButtonKeyDown(event) {
    if (event.key === KEY.ENTER) {
      this.dispatchEvent(new CustomEvent('searchrequest', {
        bubbles: true,
        cancelable: true,
        detail: {
          searchTerm: this._inputValue
        }
      }));
    }
  }
  handleClearButtonKeyDown(event) {
    event.stopPropagation();
    if (event.key === KEY.ENTER) {
      this.clearInput();
    }
  }
  handleClearClick() {
    this.clearInput();
  }
  clearInput() {
    this._inputValue = '';
    this.focus();
    this.dispatchEvent(new CustomEvent('inputclear', {
      bubbles: true,
      cancelable: true
    }));
  }
  handleSearchButtonBlur() {
    this._isSearchButtonFocused = false;
  }
  handleSearchButtonFocus() {
    this._isSearchButtonFocused = true;
  }
  handleSearchButtonMouseEnter() {
    this._isSearchButtonHovering = true;
  }
  handleSearchButtonMouseLeave() {
    this._isSearchButtonHovering = false;
  }
  syncA11y() {
    if (this.listBoxId) {
      this.inputElement.setAttribute('aria-controls', this.listBoxId);
    } else {
      this.inputElement.removeAttribute('aria-controls');
    }
    if (this.activeOptionId) {
      this.inputElement.setAttribute('aria-activedescendant', this.activeOptionId);
    } else {
      this.inputElement.removeAttribute('aria-activedescendant');
    }
    this.inputElement.setAttribute('aria-expanded', this.listBoxExpanded.toString());
  }
  _initialRender = false;
  renderedCallback() {
    if (this._initialRender === false) {
      const inputEl = this.querySelector('input');
      const labelEl = this.querySelector('label');
      const id = generateRandomId();
      inputEl.setAttribute('id', id);
      labelEl.setAttribute('for', id);
      this._initialRender = true;
    }
  }
}