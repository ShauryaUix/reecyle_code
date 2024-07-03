/* global window */

export const localStorage = window.localStorage || {
  _data: {},
  setItem(key, value) {
    this._data[key] = String(value)
  },
  getItem(key) {
    return this._data[key]
  },
  removeItem(key) {
    delete this._data[key]
  },
  clear() {
    this._data = {}
  },
}

export function parseValue(value) {
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

export function stringifyValue(value) {
  try {
    return JSON.stringify(value)
  } catch (error) {
    return value
  }
}

export class Storage {
  constructor({
    engine = localStorage,
    parse = parseValue,
    stringify = stringifyValue,
  } = {}) {
    this.engine = engine
    this.parse = parse
    this.stringify = stringify
  }

  setItem(key, value) {
    this.engine.setItem(key, this.stringify(value))
  }

  getItem(key) {
    return this.parse(this.engine.getItem(key))
  }

  removeItem(key) {
    this.engine.removeItem(key)
  }

  clear() {
    this.engine.clear()
  }
}

export function create({ transform, ...config } = {}) {
  const storage = new Storage(config)
  if (transform) {
    return transform(storage)
  }
  return storage
}

export default create
