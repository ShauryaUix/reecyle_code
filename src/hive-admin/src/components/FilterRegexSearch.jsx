import React from 'react'

import Input from 'antd/lib/input'

import Admin from './Admin'
import Filter from './Filter'

export default class FilterRegexSearch extends Filter {
  static config = {
    ...Filter.config,
    label: null,
    placeholder: 'Search',
  }

  static buildQuery(value, builder, filter) {
    const paths = filter.paths || ['name']
    const extra = filter.caseInsensitive ? { OPTIONS: 'i' } : {}
    if (value && value.length) {
      builder.add('where', {
        OR: paths.map((path) => ({
          [path]: Object.assign({ REGEX: value }, extra),
        })),
      })
    }
  }

  renderContent() {
    return (
      <Input
        onChange={this.onChange}
        value={this.props.value}
        placeholder={this.props.placeholder}
      />
    )
  }
}

Admin.addToLibrary('FilterRegexSearch', (config) =>
  FilterRegexSearch.create(config)
)
