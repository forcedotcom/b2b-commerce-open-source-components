import { api, LightningElement } from 'lwc';
import sanitizeValue from 'site/commonRichtextsanitizerUtils';
const MATCH_HIGHLIGHT_CLASS = 'match-highlight';
export default class SearchSuggestionsUi extends LightningElement {
  static renderMode = 'light';
  @api
  term;
  @api
  suggestions;
  @api
  suggestedProducts;
  @api
  productSuggestionsHeader;
  @api
  showStencils = false;
  @api
  matchType;
  @api
  highlightType;
  @api
  maxItems;
  get suggestedProductsHeader() {
    return this.productSuggestionsHeader ?? '';
  }
  get isProductSuggestionsVisible() {
    return Boolean(this.suggestedProducts?.length);
  }
  get resolvedMaxItems() {
    return this.maxItems != null ? this.maxItems : Number.MAX_SAFE_INTEGER;
  }
  get categories() {
    const result = [];
    let itemCount = 0;
    if (this.suggestions) {
      for (const category of this.suggestions) {
        if (itemCount >= this.resolvedMaxItems) {
          break;
        }
        const filteredItems = category.items.filter(item => item.id.trim() !== '');
        if (filteredItems.length > 0) {
          const parsedCategory = {
            ...category,
            items: filteredItems.slice(0, this.resolvedMaxItems - itemCount).map((item, index) => {
              const sanitizedText = sanitizeValue(item.text, []);
              return {
                ...item,
                attributeText: sanitizedText,
                index,
                parts: this.getMatchingParts(sanitizedText, item.matchType, item.highlightType)
              };
            })
          };
          result.push(parsedCategory);
          itemCount += parsedCategory.items.length;
        }
      }
    }
    return result;
  }
  get isSearchSuggestionsVisible() {
    return (this.suggestions ?? []).some(category => category.items.some(item => typeof item.text === 'string' && item.text.trim() !== ''));
  }
  @api
  focusItem(index) {
    this.focusByDelta(index, 0);
  }
  @api
  focusLastItem() {
    const {
      items
    } = this.getListElements();
    this.focusByDelta(items.length - 1, 0);
  }
  handleClick(event) {
    this.selectSuggestionFromElement(event.currentTarget);
  }
  handleItemKeyUp(event) {
    if (event.key === 'Enter') {
      this.selectSuggestionFromElement(event.currentTarget);
    }
  }
  handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowUp':
        {
          event.preventDefault();
          this.focusByDelta(-1);
          break;
        }
      case 'ArrowDown':
        {
          event.preventDefault();
          this.focusByDelta(1);
          break;
        }
      default:
        break;
    }
  }
  handleItemFocus(event) {
    this.dispatchSuggestionEvent('suggestionfocus', event.currentTarget);
  }
  selectSuggestionFromElement(element) {
    this.dispatchSuggestionEvent('suggestionselect', element);
  }
  dispatchSuggestionEvent(type, element) {
    const {
      category,
      item
    } = this.getItemFromElement(element) ?? {};
    if (category && item) {
      this.dispatchEvent(new CustomEvent(type, {
        bubbles: true,
        composed: true,
        detail: {
          category,
          item
        }
      }));
    }
  }
  getItemFromElement(element) {
    const category = this.suggestions?.find(item => item.id === element?.dataset.category);
    const index = parseInt(element?.dataset.index, 10);
    const item = category?.items[index];
    if (!item || !category) {
      return null;
    }
    return {
      category,
      item
    };
  }
  focusByDelta(delta, startingIndex) {
    const listData = this.getListElements();
    const items = listData.items;
    const focusedIndex = startingIndex == null ? listData.focusedIndex : startingIndex;
    if (focusedIndex === -1) {
      return;
    }
    const newIndex = focusedIndex + delta;
    if (newIndex >= 0 && items[newIndex]) {
      const newItem = items[newIndex];
      newItem.focus();
    } else if (newIndex >= items.length) {
      this.dispatchEvent(new CustomEvent('suggestionsfocusoutend'));
    } else if (newIndex < 0) {
      this.dispatchEvent(new CustomEvent('suggestionsfocusoutstart'));
    }
  }
  getListElements() {
    const items = Array.from(this.querySelectorAll('li.result-item'));
    return {
      items,
      focusedIndex: items.findIndex(item => document.activeElement === item || document.activeElement && item.contains(document.activeElement))
    };
  }
  getMatchingParts(text, matchType, highlightType) {
    const terms = this.getUniqueTerms();
    const resolvedMatchType = matchType ?? this.matchType ?? 'fuzzy';
    const resolvedHighlightType = highlightType ?? this.highlightType ?? 'matching';
    const results = [];
    const matcherPrefix = resolvedMatchType === 'prefix' ? '^' : '';
    const matchString = `${matcherPrefix}(${this.sanitizeTermsForMatcher(terms).join('|')})`;
    const matcher = new RegExp(matchString, 'gi');
    let index = 0;
    let match = matcher.exec(text);
    while (match && terms.length) {
      if (index !== match.index) {
        results.push({
          id: String(index),
          value: text.slice(index, match.index),
          classes: this.resolvePartClasses(resolvedHighlightType, false)
        });
      }
      results.push({
        id: String(match.index),
        value: match[0],
        classes: this.resolvePartClasses(resolvedHighlightType, true)
      });
      index = match.index + match[0].length;
      match = matcher.exec(text);
    }
    if (index < text.length) {
      results.push({
        id: String(index),
        value: text.slice(index),
        classes: this.resolvePartClasses(resolvedHighlightType, false)
      });
    }
    return results;
  }
  resolvePartClasses(highlightType, isMatch) {
    if (highlightType === 'matching' && isMatch || highlightType === 'nonmatching' && !isMatch) {
      return [MATCH_HIGHLIGHT_CLASS];
    }
    return undefined;
  }
  getUniqueTerms() {
    return [...new Set(this.term?.split(' ') ?? [])].filter(term => Boolean(term));
  }
  sanitizeTermsForMatcher(terms) {
    return terms.map(term => term.replace(/(\^|\*|\||\[|\])/g, '\\$1').replace(/(\?)/, '\\$1'));
  }
}