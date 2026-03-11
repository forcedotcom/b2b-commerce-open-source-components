import { LightningElement, api } from 'lwc';
export default class CommonPrimitiveFocusTrapManager extends LightningElement {
  static renderMode = 'light';
  focusTriggerElement = null;
  _focusTrapActive = false;
  boundKeyDownHandler = this.handleKeyDown.bind(this);
  @api
  set focusTrapActive(active) {
    if (active) {
      this.activateFocusTrap(undefined, undefined, {
        deferFocus: true
      });
    } else if (active === false) {
      this.deactivateFocusTrap({
        deferFocus: true
      });
    }
  }
  get focusTrapActive() {
    return this._focusTrapActive;
  }
  @api
  focusId;
  @api
  noFocusNextOnDisable = false;
  connectedCallback() {
    if (!this.focusId) {
      console.error('The focus trap requires an id');
    }
  }
  disconnectedCallback() {
    this.deactivateFocusTrap();
  }
  @api
  activateFocusTrap(triggerElement, focusElement, {
    deferFocus = false
  } = {}) {
    if (!import.meta.env.SSR) {
      this.focusTriggerElement = triggerElement ?? null;
      if (deferFocus) {
        Promise.resolve().then(() => this.focusElement(focusElement));
      } else {
        this.focusElement(focusElement);
      }
      if (!this._focusTrapActive) {
        this.addEventListener('keydown', this.boundKeyDownHandler);
        this._focusTrapActive = true;
        this.dispatchEvent(new CustomEvent('focustrapactivated', {
          detail: {
            id: this.focusId
          }
        }));
      }
    }
  }
  @api
  deactivateFocusTrap({
    deferFocus = false
  } = {}) {
    if (!this._focusTrapActive) {
      return;
    }
    this.removeEventListener('keydown', this.boundKeyDownHandler);
    if (this.focusTriggerElement) {
      this.focusTriggerElement.focus();
    } else if (!this.noFocusNextOnDisable) {
      if (deferFocus) {
        Promise.resolve().then(() => this.focusNextElement());
      } else {
        this.focusNextElement();
      }
    }
    this._focusTrapActive = false;
    this.dispatchEvent(new CustomEvent('focustrapdeactivated', {
      detail: {
        id: this.focusId
      }
    }));
  }
  handleKeyDown(event) {
    const focusableElements = this.getFocusableElements();
    const totalFocusable = focusableElements.length;
    let currentActiveElement = document.activeElement;
    function findInnermostActiveElement(element) {
      while (element?.shadowRoot?.activeElement) {
        element = element.shadowRoot.activeElement;
      }
      return element;
    }
    currentActiveElement = findInnermostActiveElement(currentActiveElement);
    const currentIndex = focusableElements.indexOf(currentActiveElement);
    if (totalFocusable === 0) {
      console.warn('No focusable elements found.');
      return;
    }
    if (event.key === 'Tab') {
      if (event.shiftKey && currentIndex === 0) {
        focusableElements[totalFocusable - 1]?.focus();
        event.preventDefault();
      } else if (!event.shiftKey && currentIndex === totalFocusable - 1) {
        focusableElements[0]?.focus();
        event.preventDefault();
      }
    } else if (event.key === 'Escape') {
      this.deactivateFocusTrap();
      event.preventDefault();
    }
  }
  getFocusableElements() {
    function getAllFocusableElements(root) {
      const tags = ['a', 'button', 'input', 'textarea', 'select'];
      return Array.from(root.querySelectorAll('*')).reduce((results, node) => {
        if (tags.includes(node.tagName.toLowerCase()) || node.hasAttribute('tabindex')) {
          results.push(node);
        }
        if (node.shadowRoot) {
          results.push(...getAllFocusableElements(node.shadowRoot));
        }
        return results;
      }, []);
    }
    const elements = getAllFocusableElements(this);
    return [...new Set(elements.filter(el => !el.disabled && el.getAttribute('tabindex') !== '-1' && el.checkVisibility()))];
  }
  getNextFocusableElement() {
    const allFocusableElements = [...document.querySelectorAll('a, button, input, textarea, select, [tabindex]')].filter(el => !el.disabled && el.getAttribute('tabindex') !== '-1');
    const currentIndex = allFocusableElements.indexOf(document.activeElement);
    return allFocusableElements[currentIndex + 1] || allFocusableElements[0];
  }
  focusNextElement() {
    const nextFocusableElement = this.getNextFocusableElement();
    nextFocusableElement?.focus();
  }
  focusElement(focusElement) {
    if (focusElement) {
      focusElement.focus();
    } else {
      const focusableElements = this.getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }
}