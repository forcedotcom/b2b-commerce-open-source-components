import { api, LightningElement } from 'lwc';
import labels from './labels';
export const HIDDEN_CLASS = 'slds-hide';
export const DEFAULT_SECTION_ID = 'panel-section';
const FILTER_SECTION_UPDATE_EVT = 'filtersectionupdate';
const SECTION_STYLE = 'section-style';
export default class SearchFiltersPanelSection extends LightningElement {
  static renderMode = 'light';
  _expanded = true;
  _sectionId;
  _defaultExpanded = false;
  _filterPanelState = {};
  _sectionsExpandedState = new Map();
  _currentPageReference;
  @api
  set filterPanelState(state) {
    this._filterPanelState = state;
    const savedState = state?.[this.sectionId] ?? null;
    if (savedState) {
      this._sectionsExpandedState.set(this.sectionId, JSON.parse(savedState));
      this.updateExpandedState();
    }
  }
  get filterPanelState() {
    return this._filterPanelState;
  }
  @api
  set sectionId(id) {
    this._sectionId = id;
  }
  get sectionId() {
    return this._sectionId ?? DEFAULT_SECTION_ID;
  }
  @api
  get defaultExpanded() {
    return this._defaultExpanded;
  }
  set defaultExpanded(value) {
    this._defaultExpanded = value;
  }
  @api
  get sectionsExpandedState() {
    return this._sectionsExpandedState;
  }
  initializeExpandedState() {
    if (!this._sectionsExpandedState.has(this.sectionId)) {
      this._sectionsExpandedState.set(this.sectionId, this.defaultExpanded);
      this.updateExpandedState();
    }
  }
  updateExpandedState() {
    this._expanded = this._sectionsExpandedState.get(this.sectionId);
  }
  connectedCallback() {
    this.initializeExpandedState();
  }
  get iconName() {
    return this._expanded ? 'utility:chevronup' : 'utility:chevrondown';
  }
  get sectionClasses() {
    return !this._expanded ? HIDDEN_CLASS : undefined;
  }
  get facetToggleLabel() {
    return this._expanded ? labels.toggleFilterExpandedAssistiveText : labels.toggleFilterCollapsedAssistiveText;
  }
  get displayClass() {
    return [this.sectionId, SECTION_STYLE];
  }
  handleFacetHeaderToggle() {
    const currentExpandedState = this._sectionsExpandedState.get(this.sectionId);
    this._sectionsExpandedState.set(this.sectionId, !currentExpandedState);
    const state = {
      [this.sectionId]: JSON.stringify(!currentExpandedState)
    };
    this.dispatchEvent(new CustomEvent(FILTER_SECTION_UPDATE_EVT, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: state
    }));
    this.updateExpandedState();
  }
  handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleFacetHeaderToggle();
    }
  }
}