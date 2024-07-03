import React from 'react'

import Admin from './Admin'
import Field from './Field'

let NAME_COUNTER = 0

export default class FieldReact extends Field {
  static config = {
    ...Field.config,
    cardTitle: '',
    content: '',
    renderContent: (props) => props.content,
    skip: [],
    // eslint-disable-next-line no-unused-vars
    create: (config) => ({}),
  }

  static propsMap = {}

  static create(inputConfig = {}) {
    const { create, ...config } = super.create(inputConfig)
    if (!config.name) {
      config.name = `random-field-name-${NAME_COUNTER++}`
    }
    config.label = inputConfig.label || null
    config.skip = Admin.compileFromLibrary(config.skip, true)
    if (!config.virtual) {
      config.virtual = [() => true]
    }
    Object.assign(config, create(config))
    const CurrentComponent = this
    return {
      ...config,
      render: (props) => (
        <CurrentComponent key={config.name} {...config} {...props} />
      ),
    }
  }

  render() {
    return this.props.renderContent(this.props, this)
  }
}

Admin.addToLibrary('FieldReact', (config) => FieldReact.create(config))
