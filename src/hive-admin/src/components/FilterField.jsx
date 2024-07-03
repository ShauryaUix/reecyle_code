import React from 'react'

import Form from 'antd/lib/form'

import Admin from './Admin'
import Filter from './Filter'

export default class FilterField extends Filter {
  static config = {
    ...Filter.config,
    field: ['FieldText', {}],
    formItemProps: {},
    getFormItemProps: (props) => props.formItemProps,
    getValueForField: (value) => value,
    getValueForQuery: (value) => value,
  }

  static create({ FilterClass = this, field: fieldConfig = [], ...config }) {
    const field = Admin.compileFromLibrary(fieldConfig)
    const FieldComponent = (props) => field.render(props)
    return {
      ...this.getConfig(config),
      ...config,
      field,
      FieldComponent,
      render: (props) => (
        <FilterClass
          key={config.id}
          {...this.getConfig(config)}
          FieldComponent={FieldComponent}
          {...props}
        />
      ),
    }
  }

  onChange = (event) =>
    this.props.onChange(
      this.props.id,
      this.props.getValueForQuery(
        event && event.target && event.target.value ? event.target.value : event
      )
    )

  renderWrapper() {
    return (
      <Form.Item
        key={this.props.id}
        label={this.props.label}
        {...this.props.getFormItemProps(this.props)}
      >
        {this.renderContent()}
      </Form.Item>
    )
  }

  renderContent() {
    const { FieldComponent } = this.props
    return (
      <FieldComponent
        {...this.props}
        value={this.props.getValueForField(this.props.value, this.props)}
        onChange={this.onChange}
      />
    )
  }
}

Admin.addToLibrary('FilterField', (config) => FilterField.create(config))
