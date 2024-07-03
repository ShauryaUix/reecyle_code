import React, { Component } from 'react'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import isFunction from 'lodash/isFunction'
import omit from 'lodash/omit'

// eslint-disable-next-line import/no-extraneous-dependencies
import classNames from 'classnames'

import AntdForm from 'antd/lib/form'
import AntdColumn from 'antd/lib/col'
import AntdRow from 'antd/lib/row'
import Popover from 'antd/lib/popover'
import Icon from 'antd/lib/icon'

import Admin from './Admin'

import mix from '../modules/mix'
import SuperProps from './Mixins/SuperProps'

import './Form.less'

export class DivForm extends AntdForm {
  renderForm = ({ getPrefixCls }) => {
    const {
      prefixCls: customizePrefixCls,
      hideRequiredMark,
      className = '',
      layout,
    } = this.props
    const prefixCls = getPrefixCls('form', customizePrefixCls)
    const formClassName = classNames(
      prefixCls,
      {
        [`${prefixCls}-horizontal`]: layout === 'horizontal',
        [`${prefixCls}-vertical`]: layout === 'vertical',
        [`${prefixCls}-inline`]: layout === 'inline',
        [`${prefixCls}-hide-required-mark`]: hideRequiredMark,
      },
      className
    )

    const formProps = omit(this.props, [
      'prefixCls',
      'className',
      'layout',
      'form',
      'hideRequiredMark',
      'wrapperCol',
      'labelAlign',
      'labelCol',
      'colon',
    ])

    return <div {...formProps} className={formClassName} />
  }
}

export default class Form extends mix(Component, SuperProps) {
  constructor(props) {
    super(props)
    this.state = {}
    this.props.form.initialized = false
    if (!this.props.form.__getFieldValue) {
      const __getFieldValue = this.props.form.getFieldValue
      this.props.form.getFieldValue = (name) => {
        if (this.props.form.initialized) {
          return __getFieldValue.call(this.props.form, name)
        }
        const field = this.props.fields.find((test) => test.name === name)
        if (field) {
          return field.getInitialValue(field, this.props)
        }
        return undefined
      }
    }
    this.state.props = {
      fields: this.props.getFields(this.props).map((field) =>
        field.isField
          ? {
              ...field,
              rules: !field.rules
                ? []
                : field.rules
                    .map((rule) => {
                      if (isArray(rule)) {
                        let newRule = Admin.compileFromLibrary(rule, false)
                        if (isFunction(newRule)) {
                          newRule = newRule(this.props)
                        }
                        if (!isObject(newRule)) {
                          return null
                        }
                        return newRule
                      }
                      return rule
                    })
                    .filter((rule) => !!rule),
            }
          : field
      ),
    }
  }

  handleSubmit = (event) => {
    event.preventDefault()
  }

  renderField(field) {
    const { getFieldDecorator } = this.props.form
    const output = field.isField ? (
      <AntdForm.Item
        key={field.key || field.name}
        label={
          field.help ? (
            <span>
              {`${field.label}`}
              <Popover
                content={<div style={{ maxWidth: '200px' }}>{field.help}</div>}
              >
                <Icon
                  type="question-circle-o"
                  style={{ marginLeft: '5px', color: '#bbb' }}
                />
              </Popover>
            </span>
          ) : isFunction(field.label) ? (
            field.label(this.props, field)
          ) : (
            field.label
          )
        }
        extra={field.description}
        {...field.getFormItemConfig(field, this.props)}
      >
        {getFieldDecorator(field.name, {
          rules: field.rules,
          initialValue: field.getInitialValue(field, this.props),
          ...field.getFieldDecoratorConfig(field, this.props),
        })(field.render(this.props))}
      </AntdForm.Item>
    ) : field.isDivider ? (
      field.render(this.props)
    ) : (
      <div key={field.name} className="ant-row ant-form-item">
        {field.render(this.props)}
      </div>
    )
    const columnProps = isObject(field.col)
      ? field.col
      : { span: field.col || 24 }
    const hidden = field.getHidden
      ? field.getHidden({ ...this.props, ...field })
      : false
    return (
      <AntdColumn
        key={field.key || field.name}
        data-input-column-hidden={hidden}
        data-input-name={field.name}
        {...columnProps}
      >
        {output}
      </AntdColumn>
    )
  }

  renderFields(fields) {
    if (this.props.renderFields) {
      return this.props.renderFields(fields, this)
    }
    return fields.map((field) => this.renderField(field))
  }

  render() {
    const fields = this.state.props.fields.filter((field) =>
      field.getSkip ? !field.getSkip({ ...this.props, ...field }) : true
    )
    const { FormWrapperComponent = DivForm } = this.props
    const render = (
      <FormWrapperComponent
        layout={this.props.formLayout}
        onSubmit={this.handleSubmit}
      >
        <AntdRow gutter={this.props.formRowGutter || 20}>
          {this.renderFields(fields)}
        </AntdRow>
      </FormWrapperComponent>
    )
    this.props.form.initialized = true
    return render
  }
}
