import React from 'react'

import AntdForm from 'antd/lib/form'

import Admin from './Admin'
import Page from './Page'
import Form from './Form'

import './PageSmallForm.less'

export default class PageSmallForm extends Page {
  static config = {
    ...Page.config,
    ClassName: 'PageSmallForm',

    title: 'Page',

    fields: [],
    getFields: (props) => props.fields,
    actions: [],
    getActions: (props) => props.actions,

    renderBeforeForm: () => null,
    renderAfterForm: () => null,
  }

  static create(config = {}) {
    const staticConfig = super.create(config)
    const WrappedPage = AntdForm.create()(this)
    staticConfig.fields = Admin.compileFromLibrary(staticConfig.fields, true)
    staticConfig.actions = Admin.compileFromLibrary(staticConfig.actions, true)
    return {
      ...staticConfig,
      render: (props) => (
        <WrappedPage {...this.getProps(staticConfig, config, props)} />
      ),
    }
  }

  renderBeforeForm() {
    return this.props.renderBeforeForm(this.props)
  }

  renderForm() {
    return <Form key="form" {...this.getStatefullProps()} />
  }

  renderAfterForm() {
    return this.props.renderAfterForm(this.props)
  }

  renderActions() {
    return this.props.actions.map((action) =>
      action.render(this.getStatefullProps())
    )
  }

  renderFound() {
    return (
      <div className="small-form-wrapper">
        {this.renderBeforeForm()}
        {this.renderForm()}
        {this.renderAfterForm()}
        {this.renderActions()}
      </div>
    )
  }
}

Admin.addToLibrary('PageSmallForm', (config) => PageSmallForm.create(config))
