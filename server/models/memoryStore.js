// High-fidelity in-memory database store for InfraSense
// Mirrors Mongoose collections, queries, queries with sort, filter, limit, and population

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.items = [];
  }

  find(filter = {}) {
    let result = this.items.filter(item => matchFilter(item, filter));
    return new QueryCursor(result);
  }

  async findOne(filter = {}) {
    const item = this.items.find(item => matchFilter(item, filter));
    return item ? clone(item) : null;
  }

  async findById(id) {
    const item = this.items.find(item => item._id === id || item.id === id);
    return item ? clone(item) : null;
  }

  async create(doc) {
    const newDoc = {
      _id: doc._id || 'id_' + Math.random().toString(36).substr(2, 9),
      ...doc,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date()
    };
    this.items.unshift(newDoc);
    return clone(newDoc);
  }

  async insertMany(docs) {
    const created = [];
    for (const doc of docs) {
      created.push(await this.create(doc));
    }
    return created;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const index = this.items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const current = this.items[index];
    const updated = {
      ...current,
      ...(update.$set || update),
      updatedAt: new Date()
    };
    this.items[index] = updated;
    return clone(updated);
  }

  async updateOne(filter, update) {
    const index = this.items.findIndex(item => matchFilter(item, filter));
    if (index === -1) return { matchedCount: 0, modifiedCount: 0 };
    const current = this.items[index];
    this.items[index] = {
      ...current,
      ...(update.$set || update),
      updatedAt: new Date()
    };
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async countDocuments(filter = {}) {
    return this.items.filter(item => matchFilter(item, filter)).length;
  }

  async deleteMany(filter = {}) {
    const initialLen = this.items.length;
    this.items = this.items.filter(item => !matchFilter(item, filter));
    return { deletedCount: initialLen - this.items.length };
  }
}

class QueryCursor {
  constructor(items) {
    this.items = [...items];
  }

  sort(sortCriteria) {
    if (!sortCriteria) return this;
    const entries = Object.entries(sortCriteria);
    this.items.sort((a, b) => {
      for (const [key, direction] of entries) {
        let valA = a[key];
        let valB = b[key];
        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();
        if (valA < valB) return direction === 1 || direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 1 || direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return this;
  }

  limit(n) {
    this.items = this.items.slice(0, n);
    return this;
  }

  skip(n) {
    this.items = this.items.slice(n);
    return this;
  }

  populate() {
    return this;
  }

  then(resolve, reject) {
    return Promise.resolve(this.items.map(clone)).then(resolve, reject);
  }
}

function matchFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or') {
      const matched = val.some(subFilter => matchFilter(item, subFilter));
      if (!matched) return false;
      continue;
    }
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      if ('$in' in val) {
        if (!val.$in.includes(item[key])) return false;
      } else if ('$regex' in val) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(String(item[key] || ''))) return false;
      } else if ('$gte' in val) {
        if (item[key] < val.$gte) return false;
      } else if ('$lte' in val) {
        if (item[key] > val.$lte) return false;
      }
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export const memoryStore = {
  users: new MemoryCollection('users'),
  reports: new MemoryCollection('reports'),
  infrastructures: new MemoryCollection('infrastructures'),
  maintenanceRecords: new MemoryCollection('maintenanceRecords'),
  publicComplaints: new MemoryCollection('publicComplaints'),
  sensorData: new MemoryCollection('sensorData'),
  climateData: new MemoryCollection('climateData'),
  riskAssessments: new MemoryCollection('riskAssessments'),
  notifications: new MemoryCollection('notifications'),
  feedbacks: new MemoryCollection('feedbacks'),
};
