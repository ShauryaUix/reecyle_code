import React from 'react'

import isObject from 'lodash/isObject'
import isArray from 'lodash/isArray'
import isUndefined from 'lodash/isUndefined'
import getKey from 'lodash/get'

import memoize from 'memoize-one'

import { stringify as stringifyQuery } from 'query-string'

import Empty from 'antd/lib/empty'

import Admin from './Admin'
import Field from './Field'

import Query from './Query'
import Select from './Input/Select'

export const NOVALUEKEY = '#__NO__VALUE__KEY__#'

export default class FieldConnectionSelect extends Field {
  static config = {
    ...Field.config,
    Component: Select,
    url: '/',
    method: 'get',
    requestConfig: {},
    valueKey: '_id',
    labelKey: 'name',
    searchPaths: ['name'],
    searchExtra: { OPTIONS: 'i' },
    searchPreviewMatchesInLabel: true,
    searchMatchesStart: false,
    searchMatchesEnd: false,
    getSearchTerm: (search, props) =>
      `${props.searchMatchesStart ? '^' : ''}${(search || '')
        .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        .replace(/-/g, '\\x2d')}${props.searchMatchesEnd ? '$' : ''}`,
    extractData: (response, oldData, queryProps) =>
      response && response.data && isArray(response.data.data)
        ? response.data.data.map(queryProps.extractDataItem)
        : [],
    getExtraQueryConditions: (/* props */) => [],
    extraQueryProps: {},
    extraQuerySortProps: { name: 1 },
    getExtraQueryProps: (props) => ({
      sort: props.extraQuerySortProps,
      ...(props.extraQueryProps || {}),
    }),

    skipEmptyChoicesQuery: false,
    // eslint-disable-next-line no-unused-vars
    getSkipChoicesQuery: (search, props) =>
      !search && props.skipEmptyChoicesQuery,
    // eslint-disable-next-line no-unused-vars
    getSkipValueQuery: (value, props) =>
      isArray(value) && value.length ? false : !value,

    extractChoicesQuery: (search, props) => ({
      limit: props.choicesLimit || 10,
      where: {
        AND: [
          ...props.getExtraQueryConditions(props),
          {
            OR: props.searchPaths.map((path) => ({
              [path]: Object.assign(
                { REGEX: props.getSearchTerm(search, props) },
                props.searchExtra
              ),
            })),
          },
        ],
      },
      ...props.getExtraQueryProps(props),
    }),
    extractValueQuery: (value, props) => ({
      limit: props.valueLimit || 100,
      where: {
        AND: [
          ...props.getExtraQueryConditions(props),
          {
            [props.valueKey]: {
              IN: value,
            },
          },
        ],
      },
      ...props.getExtraQueryProps(props),
    }),

    getChoice: (item, field, props) => {
      const value = props.getChoiceValue(item, field, props)
      const label = props.getChoiceLabel(item, field, props)
      return {
        key: value,
        label,
        value,
        data: item.__data || item,
      }
    },
    getChoiceValue: (item, field, props) =>
      !isObject(item)
        ? `${item}`
        : isObject(item.data)
          ? getKey(item.data, props.valueKey, item.value)
          : getKey(item, props.valueKey, item.value),
    getChoiceLabel: (item, field, props) =>
      !isObject(item)
        ? `${item}`
        : isObject(item.data)
          ? getKey(item.data, props.labelKey, item.label)
          : getKey(item, props.labelKey, item.label),
    choiceClass: Select.Option,
    renderChoices: (field, props) =>
      props.choices.map((choice) => props.renderChoice(choice, field, props)),
    // eslint-disable-next-line no-unused-vars
    renderChoiceLabel: (choice, field, props) =>
      !field.state.search || !props.searchPreviewMatchesInLabel
        ? choice.label
        : choice.label
            .replace(
              new RegExp(
                `(${field.state.search
                  .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
                  .replace(/-/g, '\\x2d')})`,
                'gi'
              ),
              '<<<>>>$1<<<>>>'
            )
            .split('<<<>>>')
            .map((part, i) =>
              part.toLowerCase() === field.state.search.toLowerCase() ? (
                // eslint-disable-next-line react/no-array-index-key
                <strong key={`${i}-strong`}>{part}</strong>
              ) : (
                // eslint-disable-next-line react/no-array-index-key
                <span key={`${i}`}>{part}</span>
              )
            ),
    renderChoice: (choice, field, props) => (
      <props.choiceClass
        key={isUndefined(choice.value) ? NOVALUEKEY : choice.value}
        value={choice.value}
        title={choice.label}
      >
        {props.renderChoiceLabel(choice, field, props)}
      </props.choiceClass>
    ),
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    mode: true,
    allowClear: true,
    prefix: true,
    suffix: true,
  }

  constructor(props) {
    super(props)
    this.state = { search: '' }
    this.extractDataItem = (item) =>
      this.props.getChoice(
        {
          key: item._id,
          value: item._id,
          label: item.name || item._id,
          data: item,
          __data: item,
          ...item,
        },
        this,
        this.props
      )
    this.getMemoizedValueForInput = memoize(
      (value, items, mode) => {
        const itemsMap = items.reduce((agr, item) => {
          agr[item.value] = item
          return agr
        }, {})
        const valueArray = (
          isArray(value) ? value : value ? [value] : []
        ).reduce((agr, item) => {
          if (itemsMap[item]) {
            agr.push(itemsMap[item])
          }
          return agr
        }, [])
        const valueFinal =
          mode && mode !== 'default'
            ? valueArray.length
              ? valueArray
              : undefined
            : valueArray[0]
        return valueFinal
      },
      ([newValue, newItems, newMode], [oldValue, oldItems, oldMode]) => {
        if (
          newValue !== oldValue ||
          newItems.length !== oldItems.length ||
          newMode !== oldMode
        ) {
          this.getMemoizedValueForInput.itemsString = undefined
          return false
        }
        const itemsString = newItems.map((item) => item.value).join(',')
        if (itemsString !== this.getMemoizedValueForInput.itemsString) {
          this.getMemoizedValueForInput.itemsString = itemsString
          return false
        }
        this.getMemoizedValueForInput.itemsString = itemsString
        return true
      }
    )
    this.getMemoizedValueForForm = memoize((value) =>
      !value
        ? value
        : isArray(value)
          ? value.length
            ? value.map((item) => item.key || item)
            : undefined
          : value.key || value
    )
  }

  onSearch(value) {
    this.setState({ search: value })
  }

  handleChange = (value) => {
    const { props } = this
    value = this.getMemoizedValueForForm(value)
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

  renderInput(props, { choices, value }) {
    return (
      <this.props.Component
        key={props.name || props.id}
        showSearch
        labelInValue
        optionLabelProp="title"
        defaultActiveFirstOption={false}
        filterOption={() => true}
        onSearch={(search) => this.onSearch(search)}
        {...props}
        value={value}
        onChange={this.handleChange}
        onDropdownVisibleChange={(open) => !open && this.onSearch('')}
        notFoundContent={
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              this.state.search ? 'Nothing was found' : 'Type to search'
            }
          />
        }
      >
        {this.props.renderChoices(this, { ...this.props, choices })}
      </this.props.Component>
    )
  }

  render(extras = {}) {
    return (
      <Query
        key={`${this.props.name || this.props.id}-choices`}
        url={`${this.props.url}?${stringifyQuery({
          query: JSON.stringify(
            this.props.extractChoicesQuery(this.state.search, this.props)
          ),
        })}`}
        skip={this.props.getSkipChoicesQuery(this.state.search, this.props)}
        client={this.props.client}
        extractData={this.props.extractData}
        extractDataItem={this.extractDataItem}
        method={this.props.method}
        config={this.props.requestConfig}
        autoload
        autoreload
      >
        {(queryChoices) => (
          <Query
            key={`${this.props.name || this.props.id}-value`}
            url={`${this.props.url}?${stringifyQuery({
              query: JSON.stringify(
                this.props.extractValueQuery(this.props.value, this.props)
              ),
            })}`}
            skip={this.props.getSkipValueQuery(this.props.value, this.props)}
            client={this.props.client}
            extractData={this.props.extractData}
            extractDataItem={this.extractDataItem}
            method={this.props.method}
            config={this.props.requestConfig}
            autoload
            autoreload
          >
            {(queryValue) =>
              super.render({
                choices: [...queryChoices.data],
                value: this.getMemoizedValueForInput(
                  this.props.value,
                  queryValue.data,
                  this.props.mode
                ),
                ...extras,
              })
            }
          </Query>
        )}
      </Query>
    )
  }
}

Admin.addToLibrary('FieldConnectionSelect', (config) =>
  FieldConnectionSelect.create(config)
)
