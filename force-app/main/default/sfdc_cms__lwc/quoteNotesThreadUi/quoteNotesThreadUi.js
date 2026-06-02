import { LightningElement, api } from 'lwc';
import { title, emptyState } from './labels';
export default class QuoteNotesThreadUi extends LightningElement {
  static renderMode = 'light';
  @api
  cardTitle;
  @api
  notes = [];
  get computedTitle() {
    return this.cardTitle ?? title;
  }
  get emptyStateText() {
    return emptyState;
  }
  get hasNotes() {
    return Array.isArray(this.notes) && this.notes.length > 0;
  }
  get computedNotes() {
    return this.notes.map((n, index) => ({
      id: this.generateId(n, index),
      authorName: n.createdBy,
      authorInitials: this.deriveInitials(n.createdBy),
      timestamp: this.formatTimestamp(n.contentModifiedDate),
      body: n.content
    }));
  }
  generateId(n, index) {
    return `${n.title ?? 'note'}-${n.contentModifiedDate}-${index}`;
  }
  deriveInitials(name) {
    if (!name) {
      return '';
    }
    const parts = name.split(/\s+/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    const word = parts[0] ?? '';
    return word.slice(0, 2).toUpperCase();
  }
  formatTimestamp(raw) {
    if (!raw) {
      return '';
    }
    const date = new Date(raw);
    if (isNaN(date.getTime())) {
      return raw;
    }
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}