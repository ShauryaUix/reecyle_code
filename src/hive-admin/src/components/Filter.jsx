import React, { PureComponent } from 'react'
import isFunction from 'lodash/isFunction'
import Form from 'antd/lib/form'

import Admin from './Admin'
import mix from '../modules/mix'
import Configurable from './Mixins/Configurable'

export default class Filter extends mix(PureComponent, Configurable) {
  static config = {
    propsFromPage: () => ({}),
    isFilter: true,
    label: '',

    skip: [],
    getSkip: (props, filter) =>
      Admin.test(filter.skip || [], props, true, true),
  }

  static create({
    buildQuery = this.buildQuery,
    FilterClass = this,
    ...config
  }) {
    const { skip, getSkip, ...staticConfig } = this.getConfig(config)
    return {
      ...staticConfig,
      ...config,
      skip: Admin.compileFromLibrary(skip, true),
      getSkip,
      buildQuery,
      render: (props) => (
        <FilterClass key={config.id} {...staticConfig} {...props} />
      ),
    }
  }

  onChange = (event) =>
    this.props.onChange(
      this.props.id,
      isFunction(this.props.transform)
        ? this.props.transform(event.target.value)
        : event.target.value
    )

  renderContent() {
    return (
      <pre>
        <code>{`Filter: ${JSON.stringify(this.props.value)}`}</code>
      </pre>
    )
  }

  renderWrapper() {
    return (
      <Form.Item key={this.props.id} label={this.props.label}>
        {this.renderContent()}
      </Form.Item>
    )
  }

  render() {
    return this.renderWrapper()
  }
}

Admin.addToLibrary('Filter', (config) => Filter.create(config))
