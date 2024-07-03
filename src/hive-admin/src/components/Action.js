import React, { Component } from 'react'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'

import Icon from 'antd/lib/icon'
import Button from 'antd/lib/button'
import Popconfirm from 'antd/lib/popconfirm'

import Admin from './Admin'

import mix from '../modules/mix'
import Configurable from './Mixins/Configurable'

export default class Action extends mix(Component, Configurable) {
  static config = {
    ...Component.config,
    name: 'action',
    icon: null,
    iconOnly: false,
    type: 'primary',
    shape: undefined,
    section: 'bottom',
    skip: [],
    getSkip: (props, action = {}) =>
      Admin.test(action.skip || props.skip || [], props, true, true),
    disabled: [],
    disabledMode: 'any',
    popconfirm: null,
    isDisabled: (props) => Admin.testDisabled(props),
    renderAction: (props, instance) => instance.renderAction(props),
    onClick: () => {},
    isAction: true,
  }

  static create(config) {
    config = this.getConfig(config)
    config.disabled = isArray(config.disabled)
      ? Admin.compileFromLibrary(config.disabled, true)
      : config.disabled
    config.skip = Admin.compileFromLibrary(config.skip, true)
    config.title =
      config.title === null
        ? null
        : config.title
          ? config.title
          : Admin.prettify(config.name)
    return {
      ...config,
      render: (props) => (
        <this
          {...props}
          {...config}
          key={config.name}
          disabled={config.isDisabled({ ...config, ...props })}
        />
      ),
    }
  }

  setLoading(loading = true) {
    this.props.pageRef.setLoading(loading)
  }

  handleClick = (...args) => {
    this.props.onClick(this.props, ...args)
  }

  renderAction(props) {
    const popconfirm = !props.popconfirm
      ? null
      : Object.assign(
          {
            title: 'Are you sure?',
            onConfirm: this.handleClick,
          },
          props.popconfirm === true
            ? {}
            : isFunction(props.popconfirm)
              ? props.popconfirm(props, this)
              : isString(props.popconfirm)
                ? { title: props.popconfirm }
                : props.popconfirm
        )
    const action = props.iconOnly ? (
      <Icon type={props.icon} onClick={this.handleClick} />
    ) : (
      <Button
        data-action={props.name}
        ghost={!!props.ghost}
        type={props.type}
        icon={props.icon}
        size={props.size}
        shape={props.shape}
        disabled={props.disabled}
        onClick={props.popconfirm ? () => {} : this.handleClick}
        style={props.style}
      >
        {props.title}
      </Button>
    )
    if (popconfirm) {
      return <Popconfirm {...popconfirm}>{action}</Popconfirm>
    }
    return action
  }

  render() {
    return isFunction(this.props.getSkip) && this.props.getSkip(this.props)
      ? null
      : this.props.renderAction(this.props, this)
  }
}

Admin.addToLibrary('Action', (config) => Action.create(config))
