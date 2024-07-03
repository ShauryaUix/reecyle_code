import React from 'react'
import Rate from 'antd/lib/rate'
import Admin from './Admin'
import Field from './Field'

export default class FieldRating extends Field {
  static config = {
    ...Field.config,
    count: 5,
    allowHalf: true,
    allowClear: true,
    Component: Rate,
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    count: true,
    allowHalf: true,
    allowClear: true,
    character: true,
  }

  renderInput(...args) {
    return (
      <span
        style={
          this.props.disabled ? { pointerEvents: 'none', opacity: 0.3 } : {}
        }
      >
        {super.renderInput(...args)}
      </span>
    )
  }
}

Admin.addToLibrary('FieldRating', (config) => FieldRating.create(config))
