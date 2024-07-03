import React from 'react'
import isObject from 'lodash/isObject'
import isFunction from 'lodash/isFunction'

import Select from 'antd/lib/select'

import Admin from './Admin'
import Filter from './Filter'
import Field from './Field'

import mix from '../modules/mix'
import SuperProps from './Mixins/SuperProps'

export default class FilterSelect extends mix(Filter, SuperProps) {
  static config = {
    ...Filter.config,
    label: null,
    choices: [],
    mode: 'default',
    getChoiceValue: (choice) => (isObject(choice) ? choice.value : choice),
    getChoiceLabel: (choice) => (isObject(choice) ? choice.label : `${choice}`),
    renderChoices: (field, props) =>
      props.choices.map((choice) => props.renderChoice(choice, field, props)),
    choiceClass: Select.Option,
    renderChoice: (choice, field, props) => (
      <props.choiceClass
        key={props.getChoiceValue(choice, field, props)}
        value={props.getChoiceValue(choice, field, props)}
      >
        {props.getChoiceLabel(choice, field, props)}
      </props.choiceClass>
    ),
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    mode: true,
    size: true,
  }

  static buildQuery(value, builder, filter) {
    if (value) {
      builder.add(filter.id, value.value || value)
    }
  }

  onChange = (value) =>
    this.props.onChange(
      this.props.id,
      isFunction(this.props.transform) ? this.props.transform(value) : value
    )

  renderContent() {
    return (
      <Select
        key={this.props.name}
        {...this.getMappedProps('inputPropsMap')}
        onChange={this.onChange}
        value={this.props.value || 'week'}
      >
        {this.props.renderChoices(this, this.getStatefullProps())}
      </Select>
    )
  }
}

Admin.addToLibrary('FilterSelect', (config) => FilterSelect.create(config))
