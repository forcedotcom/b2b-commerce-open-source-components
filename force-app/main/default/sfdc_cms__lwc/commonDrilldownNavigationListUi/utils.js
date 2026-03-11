export function* walkForest(forest, getChildren) {
  const queue = [...forest];
  for (const m of queue) {
    yield m;
    const children = getChildren(m);
    if (children) {
      queue.push(...children);
    }
  }
}
export const getChildren = m => m.subMenu;
export class LookupTable {
  iterator;
  lookupById;
  constructor(data) {
    this.iterator = walkForest(data, getChildren);
    this.lookupById = {};
  }
  findItemById(id) {
    if (this.lookupById[id]) {
      return this.lookupById[id];
    }
    let menuItemId;
    while (menuItemId !== id) {
      const next = this.iterator.next();
      if (next.done) {
        return undefined;
      }
      const menuItem = next.value;
      menuItemId = menuItem.id;
      this.lookupById[menuItem.id] = menuItem;
    }
    return this.lookupById[menuItemId];
  }
}