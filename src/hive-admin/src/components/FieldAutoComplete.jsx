import React from 'react'
import isArray from 'lodash/isArray'
import isNumber from 'lodash/isFinite'
import isUndefined from 'lodash/isUndefined'

import { stringify as stringifyQuery } from 'query-string'

import Input from 'antd/lib/input'
import AutoComplete from 'antd/lib/auto-complete'

import Admin from './Admin'
import Query from './Query'
import Field from './Field'

export default class FieldAutoComplete extends Field {
  static config = {
    ...Field.config,
    url: '/',
    method: 'get',
    requestConfig: {},
    extractData: (response) =>
      response && isArray(response.data) ? response.data : [],
    Component: AutoComplete,
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    addonBefore: true,
    addonAfter: true,
    dataSource: true,
  }

  renderInput(props) {
    const { type, addonBefore, addonAfter, ...restProps } = props
    return (
      <AutoComplete
        key={props.name}
        {...restProps}
        value={isUndefined(props.value) ? '' : `${props.value}`}
      >
        <Input
          type={type}
          value={isUndefined(props.value) ? '' : `${props.value}`}
          addonBefore={addonBefore}
          addonAfter={addonAfter}
        />
      </AutoComplete>
    )
  }

  render() {
    const extras = {}
    if (this.props.type === 'number') {
      if (this.props.onChange) {
        const originalOnChange = this.props.onChange
        extras.onChange = (event) => {
          const numberValue = /\.$/.test(event || '')
            ? NaN
            : parseFloat(event, 10)
          originalOnChange(
            isNumber(numberValue)
              ? numberValue
              : isUndefined(event) || event === ''
                ? undefined
                : event
          )
        }
      }
      const numberValue = /\.$/.test(this.props.value || '')
        ? NaN
        : parseFloat(this.props.value, 10)
      extras.value = isNumber(numberValue)
        ? numberValue
        : isUndefined(this.props.value)
          ? undefined
          : this.props.value
    }
    return (
      <Query
        key={this.props.key || this.props.name}
        url={`${this.props.autocompleteUrl}?${stringifyQuery({
          key: this.props.searchKey || this.props.name,
          value: `${this.props.value || ''}`,
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
            ...extras,
          })
        }
      </Query>
    )
  }
}

Admin.addToLibrary('FieldAutoComplete', (config) =>
  FieldAutoComplete.create(config)
)
