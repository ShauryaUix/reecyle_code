import React from 'react'
import isObject from 'lodash/isObject'
import isUndefined from 'lodash/isUndefined'

import Select from './Input/Select'

import Admin from './Admin'
import Field from './Field'

import './FieldSelect.less'

const NOVALUEKEY = '#__NO__VALUE__KEY__#'

export default class FieldSelect extends Field {
  static config = {
    ...Field.config,
    Component: Select,
    choices: [],
    getChoiceValue: (choice) => (isObject(choice) ? choice.value : choice),
    getChoiceLabel: (choice) => (isObject(choice) ? choice.label : `${choice}`),
    renderChoices: (field, props) =>
      props.choices.map((choice) => props.renderChoice(choice, field, props)),
    choiceClass: Select.Option,
    renderChoice: (choice, field, props) => {
      const value = props.getChoiceValue(choice, field, props)
      const label = props.getChoiceLabel(choice, field, props)
      return (
        <props.choiceClass
          key={isUndefined(value) ? NOVALUEKEY : value}
          value={value}
        >
          {label}
        </props.choiceClass>
      )
    },
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    mode: true,
    allowClear: true,
    showSearch: true,
    showArrow: true,
    optionFilterProp: true,
    optionLabelProp: true,
    prefix: true,
    suffix: true,
  }

  handleChange = (value) => {
    const { props } = this
    if (value !== props.value && props.getFieldsToResetOnChange) {
      const fields = props.getFieldsToResetOnChange(props, value)
      if (fields && fields.length) {
        props.form.resetFields(fields)
      }
    }
    if (props.handleChange) {
      props.handleChange(value, props)
    }
    props.onChange(value)
  }

  renderInput(props) {
    return (
      <this.props.Component
        key={props.name}
        {...props}
        onChange={this.handleChange}
      >
        {this.props.renderChoices(this, this.getStatefullProps())}
      </this.props.Component>
    )
  }
}

Admin.addToLibrary('FieldSelect', (config) => FieldSelect.create(config))
