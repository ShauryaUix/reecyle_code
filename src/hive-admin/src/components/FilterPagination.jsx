import React from 'react'

import Form from 'antd/lib/form'
import Pagination from 'antd/lib/pagination'

import Admin from './Admin'
import Filter from './Filter'

export default class FilterPagination extends Filter {
  static config = {
    ...Filter.config,
    propsFromPage: ({ loading, data }) => ({
      loading,
      total: data ? data.count : 0,
    }),
    paginationConfig: {},
    defaultPageSize: 20,
    defaultPage: 1,
    pageSizes: ['20', '50', '100'],
    separator: '-',
    skip: [(props) => props.isMobile || props.isTablet],
  }

  static buildQuery(value, builder, filter) {
    const { pageSize, page } = FilterPagination.parseValue(value, filter)
    builder.add('limit', pageSize)
    builder.add('skip', (page - 1) * pageSize)
  }

  static parseValue(value, props) {
    const [pageSize, page] = (
      value && value.length
        ? value
        : `${props.defaultPageSize}${props.separator}${props.defaultPage}`
    ).split(props.separator)
    return {
      pageSize: parseInt(pageSize, 10) || props.defaultPageSize,
      page: parseInt(page, 10) || props.defaultPage,
    }
  }

  onChange = (page, pageSize) =>
    this.props.onChange(
      this.props.id,
      `${pageSize}${this.props.separator}${page}`
    )

  render() {
    const { pageSize, page } = FilterPagination.parseValue(
      this.props.value,
      this.props
    )
    if (
      !this.props.loading &&
      page !== 1 &&
      this.props.total < pageSize * (page - 1)
    ) {
      const highestPage = Math.floor(this.props.total / pageSize) + 1
      setTimeout(() =>
        this.props.onChange(
          this.props.id,
          `${pageSize}${this.props.separator}${highestPage}`
        )
      )
    }
    return (
      <Form.Item>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={this.props.total}
          defaultPageSize={this.props.defaultPageSize}
          defaultPage={this.props.defaultPage}
          size={this.props.size}
          onChange={this.onChange}
          onShowSizeChange={this.onChange}
          pageSizeOptions={this.props.pageSizes}
          {...Object.assign(
            {
              showSizeChanger: true,
            },
            this.props.paginationConfig
          )}
        />
      </Form.Item>
    )
  }
}

Admin.addToLibrary('FilterPagination', (config) =>
  FilterPagination.create(config)
)
