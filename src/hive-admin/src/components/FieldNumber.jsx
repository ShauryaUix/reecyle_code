import InputNumber from 'antd/lib/input-number'
import isString from 'lodash/isString'

import Admin from './Admin'
import Field from './Field'

export default class FieldNumber extends Field {
  static config = {
    ...Field.config,
    Component: InputNumber,
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    type: true,
    autoFocus: true,
    formatter: true,
    max: true,
    min: true,
    parser: true,
    precision: true,
    step: true,
    addonBefore: true,
  }

  static create(config = {}) {
    config = this.getConfig(config)
    if (isString(config.format)) {
      config.formatter = (value) => config.format.replace('%s', value)
      config.parser = (value) =>
        value === config.format
          ? config.initialValue || 0
          : value.replace(/[^\d.]/g, '')
    }
    return super.create(config)
  }
}

Admin.addToLibrary('FieldNumber', (config) => FieldNumber.create(config))
