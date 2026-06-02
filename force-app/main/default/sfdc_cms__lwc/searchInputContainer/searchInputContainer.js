import { api, LightningElement, wire } from 'lwc';
import { CurrentPageReference, navigate, NavigationContext } from 'lightning/navigation';
import BasePath from '@salesforce/community/basePath';
import { generateStyleProperties } from 'experience/styling';
import { trackViewSearchSuggestion } from 'commerce/activitiesApi';
import { createSearchDataEvent, createSearchSuggestionDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';
import { ProductSearchSuggestionAdapter } from 'commerce/productApi';
import { Labels } from './labels';
import { debounce } from './utils';
import sanitizeValue from 'site/commonRichtextsanitizerUtils';
const SUGGESTIONS_DEBOUNCE_TIME = 300;
export default class SearchInputContainer extends LightningElement {
  static renderMode = 'light';
  clearButtonLabel = Labels.clearButtonLabel;
  ariaClearButtonLabel = Labels.ariaClearButtonLabel;
  ariaSearchIconLabel = Labels.ariaSearchIconLabel;
  ariaSearchInputLabel = Labels.ariaSearchInputLabel;
  alternativeSearchInputSpinnerText = Labels.alternativeSearchInputSpinnerText;
  recentSearchDefaultText = Labels.recentSearchDefaultText;
  bestSellerDefaultText = Labels.bestSellerDefaultText;
  productSuggestionsDefaultText = Labels.productSuggestionsDefaultText;
  _term = null;
  _searchSuggestions = [];
  _productSuggestions = [];
  searchSuggestionsWiredTermInternal = null;
  inputSearchTerm = '';
  isLoadingSearchSuggestions = false;
  @api
  placeholderText;
  @api
  textColor;
  @api
  placeholderTextColor;
  @api
  backgroundColor;
  @api
  borderRadius;
  @api
  borderColor;
  @api
  iconBoxColor;
  @api
  enableSearchSuggestions = false;
  @api
  suggestedSearchesHeaderText;
  @api
  suggestedProductsHeaderText;
  @api
  bestSellerCategory;
  @api
  bestSellerCategory2;
  get bestsellerId() {
    return this.bestSellerCategory2?.id ?? this.bestSellerCategory;
  }
  @api
  enableProductSuggestions;
  @api
  bestSellerHeaderText;
  @api
  recentSearchHeaderText;
  searchSuggestionsTerm = null;
  setDebouncedSearchSuggestionsTerm = debounce(term => this.searchSuggestionsTerm = term, SUGGESTIONS_DEBOUNCE_TIME);
  get searchInput() {
    return this.refs?.searchInput;
  }
  get areSearchSuggestionsEnabled() {
    return Boolean(this.enableSearchSuggestions);
  }
  get areProductSuggestionsEnabled() {
    return Boolean(this.enableProductSuggestions);
  }
  handleSearchIconClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('searchiconclick', {
      bubbles: true
    }));
  }
  handleInputClick() {
    this.dispatchEvent(new CustomEvent('searchinputclick', {
      bubbles: true
    }));
  }
  @wire(ProductSearchSuggestionAdapter, {
    searchTerm: '$searchSuggestionsWiredTerm',
    includeSuggestedProducts: '$areProductSuggestionsEnabled',
    includeSuggestedTerms: '$areSearchSuggestionsEnabled',
    popularCategory: '$bestsellerId'
  })
  wireProductSearchSuggestions({
    loading,
    data,
    error
  }) {
    this.isLoadingSearchSuggestions = Boolean(loading);
    if (data) {
      this._searchSuggestions = this.toSearchSuggestionItems(data.recentSearchSuggestions);
      this._productSuggestions = [];
      if (this._searchSuggestions.length > 0) {
        this._productSuggestions = this._searchSuggestions[0]?.suggestedProducts ?? [];
        this.searchSuggestionsWiredTermInternal = this.searchSuggestionsWiredTerm;
      }
      if (this._searchSuggestions.length) {
        trackViewSearchSuggestion(this.searchSuggestionsWiredTerm, this.getTrackedSuggestions(this._searchSuggestions));
      }
    } else if (error) {
      this._searchSuggestions = [];
    }
  }
  @wire(NavigationContext)
  navContext;
  @wire(CurrentPageReference)
  routeHandler(pageRef) {
    this.setTerm(pageRef.state?.term ?? null, {
      notify: false
    });
  }
  get seeAllResultsLabelParts() {
    const [prefix, suffix] = Labels.seeAllResultsLabel.split('{0}').map(text => ({
      text
    }));
    return this._term ? [{
      text: `${prefix?.text}\``
    }, {
      text: this._term,
      classes: ['term-highlight']
    }, {
      text: `\`${suffix?.text}`
    }] : [];
  }
  get searchSuggestionsWiredTerm() {
    const shouldEmitSearchTerm = this._term !== null;
    return (this.enableProductSuggestions || this.areSearchSuggestionsEnabled) && shouldEmitSearchTerm ? this.searchSuggestionsTerm : null;
  }
  get normalizedSearchSuggestionsHeader() {
    return this.searchSuggestionsWiredTermInternal === '' ? this.recentSearchHeaderText ?? this.recentSearchDefaultText : this.suggestedSearchesHeaderText ?? '';
  }
  get normalizedProductSuggestionsHeader() {
    const hasBestSellerCategory = Boolean(this.bestsellerId);
    const isEmptySearchTerm = this.searchSuggestionsWiredTermInternal === '';
    if (isEmptySearchTerm && hasBestSellerCategory) {
      return this.bestSellerHeaderText ?? this.bestSellerDefaultText;
    }
    return this.suggestedProductsHeaderText ?? this.productSuggestionsDefaultText;
  }
  get isSearchSuggestionsVisible() {
    return this.areSearchSuggestionsEnabled && Boolean(this._searchSuggestions.length) || Boolean(this._productSuggestions.length);
  }
  get searchSuggestionsComponent() {
    return this.refs?.searchSuggestions ?? null;
  }
  get searchSuggestionsData() {
    return [{
      id: 'suggestions',
      title: this.normalizedSearchSuggestionsHeader,
      isSuggestedSearch: true,
      items: this._searchSuggestions
    }];
  }
  get productSuggestionsData() {
    return this._productSuggestions;
  }
  get isActive() {
    return Boolean(this._term);
  }
  handleSuggestionSelect(event) {
    const item = event.detail.item;
    if (item.value) {
      dispatchDataEvent(this, createSearchSuggestionDataEvent(this._term, 'term', item.value));
      this.navigateToSearch(item.value);
    }
  }
  handleSuggestionsFocusOut(event) {
    if (!event.relatedTarget || !this.refs?.searchSuggestions?.contains(event.relatedTarget)) {
      this.setTerm(this._term, {
        setSuggestionsValue: false,
        setValue: false
      });
    }
  }
  handleSuggestionFocus(event) {
    const term = sanitizeValue(event.detail.item.text, []);
    this.setTerm(term, {
      setSuggestionsValue: false,
      setValue: false
    });
  }
  handleFocus() {
    if (this._term === null) {
      this.setTerm('', {
        debounceSuggestions: false
      });
    }
  }
  handleResultItemEndClick(event) {
    event.stopPropagation();
    this.selectFromItemEndElement(event.currentTarget);
  }
  handleResultItemEndKeyUp(event) {
    if (event.key === 'Enter') {
      event.stopPropagation();
      this.selectFromItemEndElement(event.currentTarget);
    }
  }
  handleSuggestionsFocusOutEnd() {
    this.refs?.suggestionsSeeAllResults?.focus();
  }
  handleSuggestionsFocusOutStart() {
    this.searchInput?.focus();
    this.setTerm(this._term, {
      setSuggestionsValue: false,
      setValue: false
    });
  }
  handleResultItemEndFocus(event) {
    const value = event.currentTarget.dataset.value ?? '';
    const newTerm = sanitizeValue(value, []);
    this.setTerm(newTerm, {
      setSuggestionsValue: false,
      setValue: false
    });
  }
  handleCategoryEndFocus() {
    this.setTerm(this._term, {
      setSuggestionsValue: false,
      setValue: false
    });
  }
  handleCategoryEndKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
        {
          event.preventDefault();
          this.searchInput?.focus();
          break;
        }
      case 'ArrowUp':
        {
          event.preventDefault();
          this.searchSuggestionsComponent?.focusLastItem();
          break;
        }
      default:
        break;
    }
  }
  handleSuggestedAllResultsClick() {
    this.navigateToSearch(this._term);
  }
  selectFromItemEndElement(element) {
    const value = element.dataset.value;
    if (value) {
      const newTerm = sanitizeValue(value, []);
      this.setTerm(newTerm);
      this.refs?.searchInput?.focus();
    }
  }
  setTerm(term, {
    debounceSuggestions = false,
    setValue = true,
    setInputValue = true,
    setSuggestionsValue = true,
    notify = true
  } = {}) {
    if (setValue) {
      this._term = term;
    }
    if (setInputValue) {
      this.inputSearchTerm = term ?? '';
    }
    if (setSuggestionsValue) {
      if (debounceSuggestions) {
        this.setDebouncedSearchSuggestionsTerm(term);
      } else {
        this.searchSuggestionsTerm = term ?? '';
      }
    }
    if (notify) {
      this.dispatchEvent(new CustomEvent('termchange', {
        detail: {
          term: this._term
        },
        bubbles: true,
        composed: true
      }));
    }
  }
  handleChangeTerm(event) {
    event.stopPropagation();
    const newTerm = event.target.value;
    this.setTerm(newTerm, {
      debounceSuggestions: true
    });
  }
  handleClear(event) {
    event.stopPropagation();
    this.setTerm('');
    this.searchInput?.focus?.();
  }
  handleKeyDown(event) {
    switch (event.key) {
      case 'Escape':
        {
          event.preventDefault();
          if (this._term) {
            this.setTerm('');
          } else {
            this.dispatchEvent(new CustomEvent('searchinputescape', {
              bubbles: true
            }));
          }
          break;
        }
      case 'ArrowDown':
        {
          if (this.searchSuggestionsComponent) {
            event.preventDefault();
            this.searchSuggestionsComponent.focusItem(0);
          }
          break;
        }
      default:
        break;
    }
  }
  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.handleEnter();
    }
  }
  handleEnter() {
    if (this._term) {
      this.navigateToSearch(this._term);
    }
  }
  navigateToSearch(term) {
    const newTerm = sanitizeValue(term, []);
    dispatchDataEvent(this, createSearchDataEvent(newTerm, undefined, {
      searchType: ['product']
    }));
    navigate(this.navContext, {
      type: 'standard__search',
      state: {
        term: newTerm
      }
    });
    this.dispatchEvent(new CustomEvent('searchnavigate', {
      bubbles: true
    }));
  }
  get searchIconPath() {
    return `${BasePath}/assets/icons/search.svg#search`;
  }
  get suggestionsEndIconPath() {
    return `${BasePath}/assets/icons/utility-sprite/svg/symbols.svg#forward_up`;
  }
  getTrackedSuggestions(suggestions) {
    return suggestions.reduce((acc, item) => {
      if (item.text !== undefined) {
        acc.push({
          value: item.text
        });
      }
      return acc;
    }, []);
  }
  toSearchSuggestionItems(suggestions) {
    return suggestions.map(item => ({
      ...item,
      text: item.value,
      id: item.value
    }));
  }
  get customStyles() {
    return generateStyleProperties([{
      name: '--com-c-search-input-text-color',
      value: this.textColor
    }, {
      name: '--com-c-search-input-background-color',
      value: this.backgroundColor
    }, {
      name: '--com-c-search-input-border-color',
      value: this.borderColor
    }, {
      name: '--com-c-search-input-icon-box-color',
      value: this.iconBoxColor
    }, {
      name: '--com-c-search-input-border-radius',
      value: this.borderRadius,
      suffix: 'px'
    }, {
      name: '--com-c-search-input-placeholder-text-color',
      value: this.placeholderTextColor
    }]);
  }
}