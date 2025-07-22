import { LightningElement, api } from 'lwc';
export default class SearchInputUi extends LightningElement {
  static renderMode = 'light';
  @api
  borderRadius;
  @api
  textColor;
  @api
  backgroundColor;
  @api
  iconColor;
  @api
  borderColor;
  @api
  placeholderText;
  @api
  placeholderTextColor;
  @api
  buttonBackgroundColor;
  @api
  buttonBackgroundHoverColor;
  @api
  showSearchButton = false;
  @api
  showSearchSuggestionsSetup = false;
  @api
  suggestionsTextColor;
  @api
  suggestionsTextHoverColor;
  @api
  suggestionsBackgroundColor;
  @api
  suggestionsBackgroundHoverColor;
  @api
  suggestionsDividerColor;
  @api
  searchTerm;
  @api
  searchSuggestionItems = [];
  @api
  showAdvancedSearch = false;
  get customStyles() {
    return {
      'search-container-border-radius': `${this.borderRadius}px`,
      'search-input-color': this.textColor,
      'search-input-background-color': this.backgroundColor,
      'search-input-icon-color': this.iconColor,
      'search-container-border-color': this.borderColor,
      'search-input-text-placeholder-color': this.placeholderTextColor,
      'search-button-background-color': this.buttonBackgroundColor,
      'search-button-background-hover-color': this.buttonBackgroundHoverColor,
      ...(this.showSearchSuggestionsSetup ? {
        'suggestions-listbox-text-color': this.suggestionsTextColor,
        'suggestions-listbox-text-hover-color': this.suggestionsTextHoverColor,
        'suggestions-listbox-background-color': this.suggestionsBackgroundColor,
        'suggestions-listbox-background-hover-color': this.suggestionsBackgroundHoverColor,
        'suggestions-listbox-divider-color': this.suggestionsDividerColor
      } : {})
    };
  }
  handleSearch(event) {
    event.stopPropagation();
    const {
      searchTerm
    } = event.detail;
    this.dispatchEvent(new CustomEvent('searchrequest', {
      bubbles: true,
      composed: true,
      detail: {
        searchTerm
      }
    }));
  }
  handleOptionSelection(event) {
    event.stopPropagation();
    const {
      value,
      position,
      category
    } = event.detail;
    this.dispatchEvent(new CustomEvent('searchoptionselection', {
      bubbles: true,
      composed: true,
      detail: {
        value,
        position,
        category
      }
    }));
  }
  handleTermChange(event) {
    if (event.detail.searchTerm !== undefined) {
      this.handleSearchTermChange(event, event.detail.searchTerm);
    }
  }
  handleClearSearchInput(event) {
    this.handleSearchTermChange(event, null);
  }
  handleSearchTermChange(event, term) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('searchtermchange', {
      bubbles: true,
      composed: true,
      detail: {
        searchTerm: term
      }
    }));
  }
}