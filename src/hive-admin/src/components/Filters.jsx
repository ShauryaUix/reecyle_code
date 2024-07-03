import React, { PureComponent } from 'react'
import isUndefined from 'lodash/isUndefined'
import { parse as parseQuery, stringify as stringifyQuery } from 'query-string'

import Form from 'antd/lib/form'

export class QueryBuilder {
  constructor() {
    this.reset()
  }

  add(key, value) {
    switch (key) {
      case 'where':
        this.where.push(value)
        break
      case 'limit':
        if (value === null) {
          delete this.limit
        } else {
          this.limit = parseInt(value, 10)
        }
        break
      case 'skip':
        if (value === null) {
          delete this.skip
        } else {
          this.skip = parseInt(value, 10)
        }
        break
      case 'populate':
        this.populate.push(value)
        break
      case 'sort':
        Object.assign(this.sort, value)
        break
      case 'custom':
        Object.assign(this.custom, value)
        break
      default:
        throw new Error(`Current QueryBuilder does not support "${key}"`)
    }
  }

  reset() {
    this.where = []
    this.populate = []
    this.sort = {}
    this.custom = {}
    delete this.limit
    delete this.skip
  }

  build() {
    return Object.assign(
      { where: { AND: this.where } },
      { sort: this.sort },
      !isUndefined(this.limit) ? { limit: this.limit } : {},
      !isUndefined(this.skip) ? { skip: this.skip } : {},
      this.populate.length
        ? { populate: Object.assign({}, ...this.populate) }
        : {},
      this.custom
    )
  }

  compile() {
    return JSON.stringify(this.build())
  }
}

export default class Filters extends PureComponent {
  static defaultProps = {
    browserPath: '/',
    browserSearch: '?',
    queryUrl: '',
    filters: [],
    builder: new QueryBuilder(),
  }

  getQueryUrl() {
    const params = this.getBrowserUrlParams()
    this.props.builder.reset()
    this.props.filters.forEach((filter) => {
      if (filter.isFilter) {
        filter.buildQuery(
          params[filter.id],
          this.props.builder,
          filter,
          params,
          this.props
        )
      }
    })
    const url = `${this.props.queryUrl}?${stringifyQuery({
      query: this.props.builder.compile(),
    })}`
    return url
  }

  getBrowserUrlParams = () => parseQuery(this.props.browserSearch)

  onChange = (id, value) => {
    const params = this.getBrowserUrlParams()
    if (value && `${value}`.length) {
      params[id] = value
    } else {
      delete params[id]
    }
    const browserUrl = `${this.props.browserPath}?${stringifyQuery(params)}`
    if (browserUrl !== this.props.browserUrl) {
      this.props.onChange(browserUrl)
    }
  }

  getFilters = (section = false) =>
    this.props.filters.filter((filter) => section && filter.section === section)

  renderFilter = (filter, params, props) =>
    filter.isFilter ? (
      filter.render({
        value: isUndefined(params[filter.id]) ? '' : params[filter.id],
        onChange: this.onChange,
        ...(filter.propsFromPage(props) || {}),
      })
    ) : filter.isAction ? (
      <Form.Item key={filter.name} label={filter.label}>
        {filter.render(props)}
      </Form.Item>
    ) : (
      filter.render(props)
    )

  renderFilters = (props = {}, section = false) => {
    const params = this.getBrowserUrlParams()
    return this.getFilters(section).map((filter) =>
      this.renderFilter(filter, params, props)
    )
  }

  render() {
    return this.props.children({
      queryUrl: this.getQueryUrl(),
      getParams: this.getBrowserUrlParams,
      getFilters: this.getFilters,
      builder: this.props.builder,
      renderFilter: this.renderFilter,
      renderFilters: this.renderFilters,
    })
  }
}
