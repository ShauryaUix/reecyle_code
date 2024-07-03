import React, { Component } from 'react'

import AntdDivider from 'antd/lib/divider'

import Admin from './Admin'

import mix from '../modules/mix'
import Configurable from './Mixins/Configurable'
import SuperProps from './Mixins/SuperProps'

export default class Divider extends mix(Component, Configurable, SuperProps) {
  static config = {
    isDivider: true,
    type: 'horizontal',
    skip: [],
    ghost: false,
    getSkip: (props) => Admin.test(props.skip || [], props, true, true),
  }

  static propsMap = {
    type: true,
    text: true,
    dashed: true,
  }

  static create(config = {}) {
    config = this.getConfig(config)
    if (!config.name) {
      config.name = `${Math.random()}`
    }
    config.skip = Admin.compileFromLibrary(config.skip, true)
    const CurrentComponent = this
    return {
      ...config,
      render: (props) => (
        <CurrentComponent key={config.name} {...config} {...props} />
      ),
    }
  }

  render() {
    return this.props.ghost ? (
      <div style={{ width: '100%' }} />
    ) : this.props.text ? (
      <AntdDivider {...this.getMappedProps()}>{this.props.text}</AntdDivider>
    ) : (
      <AntdDivider {...this.getMappedProps()} />
    )
  }
}

Admin.addToLibrary('Divider', (config) => Divider.create(config))
