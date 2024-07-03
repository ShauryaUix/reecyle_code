import React, { Component } from 'react'
import getKey from 'lodash/get'
import isUndefined from 'lodash/isUndefined'

import Input from 'antd/lib/input'

import Admin from './Admin'
import mix from '../modules/mix'
import SuperProps from './Mixins/SuperProps'
import Configurable from './Mixins/Configurable'

import './Field.less'

export default class Field extends mix(Component, Configurable, SuperProps) {
  static config = {
    ...Component.config,
    rules: [],
    disabled: [['condition.isLoading']],
    disabledMode: 'any',
    virtual: false,
    virtualMode: 'any',
    initialValue: undefined,
    formItemConfig: {},
    getFormItemConfig: (fieldConfig) /* , formProps */ =>
      fieldConfig.formItemConfig,
    fieldDecoratorConfig: {},
    getFieldDecoratorConfig: (fieldConfig) /* , formProps */ =>
      fieldConfig.fieldDecoratorConfig,
    // eslint-disable-next-line no-unused-vars
    prepareValueForInput: (value, props) => value,
    // eslint-disable-next-line no-unused-vars
    prepareValueForForm: (value, props) => value,
    getInitialValue: (fieldConfig, formProps) => {
      if (formProps.data) {
        const value = getKey(formProps.data, fieldConfig.name)
        if (!isUndefined(value)) {
          return value
        }
      }
      return fieldConfig.initialValue
    },
    Component: Input,
    renderInput: (inputProps, extras, props, input) =>
      input.renderInput(inputProps, extras, props, input),
    inlineLabelAfter: null,
    inlineLabelBefore: null,

    isDisabled: (props) => Admin.testDisabled(props),
    isVirtual: (props) => Admin.testVirtual(props),
    isField: true,
    autoComplete: 'off',

    sendEmpty: true,

    skip: [],
    getSkip: (props) => Admin.test(props.skip || [], props, true, true),

    hidden: [],
    getHidden: (props) => Admin.test(props.hidden || [], props, true, true),
  }

  static inputPropsMap = {
    name: true,
    size: true,
    value: true,
    disabled: true,
    onChange: true,
    defaultValue: true,
    placeholder: true,
    autoComplete: true,
  }

  static create(config = {}) {
    const staticConfig = this.getConfig(config)
    staticConfig.disabled = Admin.compileFromLibrary(
      staticConfig.disabled,
      true
    )
    staticConfig.virtual = Admin.compileFromLibrary(staticConfig.virtual, true)
    staticConfig.skip = Admin.compileFromLibrary(staticConfig.skip, true)
    staticConfig.hidden = Admin.compileFromLibrary(staticConfig.hidden, true)
    return {
      ...staticConfig,
      label:
        staticConfig.label === null
          ? null
          : staticConfig.label
            ? staticConfig.label
            : `${staticConfig.name[0].toUpperCase()}${staticConfig.name.slice(1)}`,
      render: (props) => (
        <this
          {...this.getProps(staticConfig, config, props)}
          key={staticConfig.name}
          disabled={staticConfig.isDisabled({
            ...staticConfig,
            ...props,
          })}
        />
      ),
    }
  }

  handleChange = (value) => {
    this.props.onChange(this.props.prepareValueForForm(value, this.props))
  }

  renderInlineLabel(suffix) {
    const key = `inlineLabel${suffix[0].toUpperCase()}${suffix.slice(1)}`
    if (!this.props[key]) {
      return null
    }
    return (
      <span key={`inline-label-${suffix}`} className={`inline-label-${suffix}`}>
        {this.props[key]}
      </span>
    )
  }

  renderInput(inputProps) {
    const { Component: InputComponent } = this.props
    return <InputComponent key={inputProps.name} {...inputProps} />
  }

  render(extras = {}) {
    return this.props.renderInput(
      this.getMappedProps(
        'inputPropsMap',
        {
          value: this.props.prepareValueForInput(this.props.value, this.props),
          onChange: this.handleChange,
        },
        extras
      ),
      extras,
      this.props,
      this
    )
  }
}

Admin.addToLibrary('Field', (config) => Field.create(config))
