import { isUsingMemoryStore } from '../config/db.js';
import { memoryStore } from './memoryStore.js';

export function createDualModel(mongooseModel, memoryCollectionKey) {
  return new Proxy(mongooseModel, {
    get(target, prop, receiver) {
      if (isUsingMemoryStore()) {
        const memCollection = memoryStore[memoryCollectionKey];
        if (memCollection && typeof memCollection[prop] === 'function') {
          return memCollection[prop].bind(memCollection);
        }
        if (memCollection && prop in memCollection) {
          return memCollection[prop];
        }
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
