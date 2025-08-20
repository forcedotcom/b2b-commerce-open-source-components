import { LightningElement, wire, api } from 'lwc';
import { navigate, NavigationContext, CurrentPageReference } from 'lightning/navigation';
import { ProductSearchSuggestionAdapter } from 'commerce/productApi';
import { dispatchDataEvent, createSearchSuggestionDataEvent } from 'commerce/dataEventApi';
export default class SearchInput extends LightningElement {
  static renderMode = 'light';
  _searchSuggestionTerm = null;
  _searchSuggestionItems = [];
  _showAdvancedSearch = false;
  _term = '';
  hasAdapterLoaded = false;
  @api
  borderRadius;
  get _borderRadius() {
    return this.borderRadius || 0;
  }
  @api
  textColor;
  get _textColor() {
    return this.textColor || '';
  }
  @api
  backgroundColor;
  get _backgroundColor() {
    return this.backgroundColor || '';
  }
  @api
  iconColor;
  get _iconColor() {
    return this.iconColor || '';
  }
  @api
  borderColor;
  get _borderColor() {
    return this.borderColor || '';
  }
  @api
  placeholderText;
  get _placeholderText() {
    return this.placeholderText || '';
  }
  @api
  placeholderTextColor;
  get _placeholderTextColor() {
    return this.placeholderTextColor || '';
  }
  @api
  buttonBackgroundColor;
  get _buttonBackgroundColor() {
    return this.buttonBackgroundColor || '';
  }
  @api
  buttonBackgroundHoverColor;
  get _buttonBackgroundHoverColor() {
    return this.buttonBackgroundHoverColor || '';
  }
  @api
  showSearchButton;
  get _showSearchButton() {
    return this.showSearchButton || false;
  }
  @api
  showSearchSuggestionsSetup;
  get _showSearchSuggestionsSetup() {
    return this.showSearchSuggestionsSetup || false;
  }
  @api
  suggestionsTextColor;
  get _suggestionsTextColor() {
    return this.suggestionsTextColor || '';
  }
  @api
  suggestionsTextHoverColor;
  get _suggestionsTextHoverColor() {
    return this.suggestionsTextHoverColor || '';
  }
  @api
  suggestionsBackgroundColor;
  get _suggestionsBackgroundColor() {
    return this.suggestionsBackgroundColor || '';
  }
  @api
  suggestionsBackgroundHoverColor;
  get _suggestionsBackgroundHoverColor() {
    return this.suggestionsBackgroundHoverColor || '';
  }
  @api
  suggestionsDividerColor;
  get _suggestionsDividerColor() {
    return this.suggestionsDividerColor || '';
  }
  @api
  get searchTerm() {
    return this._term;
  }
  set searchTerm(val) {
    this._term = val;
  }
  get normalizedSearchTerm() {
    return this.searchTerm || '';
  }
  @wire(NavigationContext)
  navContext;
  @wire(CurrentPageReference)
  routeSubHandler(pageRef) {
    this._term = pageRef.state?.term ?? null;
  }
  @wire(ProductSearchSuggestionAdapter, {
    searchTerm: '$searchSuggestionsWiredTerm'
  })
  wiredSearchSuggestion({
    data,
    loaded
  }) {
    const results = loaded ? data : undefined;
    this._searchSuggestionItems = (results?.recentSearchSuggestions || []).map(item => ({
      text: item.value,
      type: 'option-inline',
      category: 'query-suggestion'
    }));
    if (this._searchSuggestionItems.length > 0) {
      const itemValues = this._searchSuggestionItems.filter(item => item.text !== undefined).map(item => ({
        value: item.text
      }));
      this._showAdvancedSearch = true;
    }
  }
  get searchSuggestionsWiredTerm() {
    return this._showSearchSuggestionsSetup && this.hasAdapterLoaded ? this._searchSuggestionTerm : null;
  }
  resetCombobox() {
    this._searchSuggestionItems = [];
  }
  handleTermChange(event) {
    event.stopPropagation();
    if (event.detail?.searchTerm !== null) {
      this._term = event.detail?.searchTerm;
      const trimmedTerm = this._term.trim();
      if (this._showSearchSuggestionsSetup) {
        if (this._searchSuggestionTerm?.trim() !== trimmedTerm) {
          this._searchSuggestionTerm = trimmedTerm;
          this.hasAdapterLoaded = true;
        }
        this.resetCombobox();
      }
    } else {
      this.resetCombobox();
      this._searchSuggestionTerm = null;
    }
  }
  handleSearch(event) {
    event.stopPropagation();
    const {
      detail
    } = event;
    this._term = (detail.searchTerm || '').trim();
    this.runSearch();
  }
  handleOptionSelection(event) {
    event.stopPropagation();
    const {
      detail
    } = event;
    const originalSearchQuery = this._term;
    this._term = (detail.value || '').trim();
    dispatchDataEvent(this, createSearchSuggestionDataEvent(originalSearchQuery, 'term', this._term, detail.position));
    this.runSearch();
  }
  runSearch() {
    this._showAdvancedSearch = false;
    this.resetCombobox();
    if (this._term) {
      navigate(this.navContext, {
        type: 'standard__search',
        state: {
          term: this._term
        }
      });
    }
  }
}