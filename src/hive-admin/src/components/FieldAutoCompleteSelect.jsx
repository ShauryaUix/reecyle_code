import React from 'react'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'

import { stringify as stringifyQuery } from 'query-string'

import Select from 'antd/lib/select'

import Admin from './Admin'
import Query from './Query'
import Field from './Field'

export default class FieldAutoCompleteSelect extends Field {
  static config = {
    ...Field.config,
    url: '/',
    method: 'get',
    requestConfig: {},
    extractData: (response) =>
      response && isArray(response.data) ? response.data : [],
    getChoiceValue: (choice) => (isObject(choice) ? choice.value : choice),
    getChoiceLabel: (choice) => (isObject(choice) ? choice.label : `${choice}`),
    renderChoices: (field, props, choices) =>
      choices.map((choice) => props.renderChoice(choice, field, props)),
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
    dataSource: true,
    reload: true,
    mode: true,
  }

  constructor(props) {
    super(props)
    this.state = { search: '' }
  }

  renderInput(props) {
    const { type, addonBefore, addonAfter, dataSource, reload, ...restProps } =
      props
    return (
      <Select
        key={props.name}
        {...restProps}
        onSearch={(search) => this.setState({ search })}
        onFocus={() => reload()}
        value={props.value}
      >
        {this.props.renderChoices(this, this.getStatefullProps(), dataSource)}
      </Select>
    )
  }

  render() {
    return (
      <Query
        key={this.props.key || this.props.name}
        url={`${this.props.autocompleteUrl}?${stringifyQuery({
          key: this.props.searchKey || this.props.name,
          value: `${this.state.search || ''}`,
        })}`}
        client={this.props.client}
        extractData={this.props.extractData}
        method={this.props.method}
        config={this.props.requestConfig}
        autoload={false}
        autoreload
      >
        {(queryProps) =>
          super.render({
            dataSource: queryProps.data,
            reload: queryProps.reload,
          })
        }
      </Query>
    )
  }
}

Admin.addToLibrary('FieldAutoCompleteSelect', (config) =>
  FieldAutoCompleteSelect.create(config)
)
