export class Deferred {
  promise;
  state;
  currentState;
  _resolve;
  _reject;
  constructor() {
    this.currentState = 'pending';
    this.state = 'unresolved';
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    const complete = () => this.currentState = 'completed';
    this.promise.then(complete, complete);
  }
  resolve(value) {
    if (this.isCompleted()) {
      return;
    }
    this.state = 'resolved';
    this._resolve(value);
  }
  reject(value) {
    if (this.isCompleted()) {
      return;
    }
    this.state = 'rejected';
    this._reject(value);
  }
  isResolved() {
    return this.state === 'resolved';
  }
  isRejected() {
    return this.state === 'rejected';
  }
  isPending() {
    return this.currentState === 'pending';
  }
  isCompleted() {
    return this.currentState === 'completed';
  }
}