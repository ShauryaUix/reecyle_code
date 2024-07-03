import React from 'react'

import AntdForm from 'antd/lib/form'
import AntdModal from 'antd/lib/modal'

import Admin from './Admin'
import Action from './Action'
import Form from './Form'

export default class ActionWithFormModal extends Action {
  static config = {
    ...Action.config,

    fields: [],
    excludeFields: [],
    getFields: (props) =>
      props.fields.filter(
        (field) => props.excludeFields.indexOf(field.name) === -1
      ),

    actions: [],
    modalProps: {
      centered: true,
      closable: true,
    },

    title: 'Modal',
    getModalTitle: (props) => props.title,
    getModalProps: (props) => props.modalProps || {},
  }

  static create(config = {}) {
    config = super.create(config)
    config.fields = Admin.compileFromLibrary(config.fields, true)
    config.actions = Admin.compileFromLibrary(config.actions, true)
    const { render, ...restConfig } = config
    const WrappedAction = AntdForm.create()(this)
    return {
      ...restConfig,
      render: (props) => {
        const { form, ...restProps } = props
        return (
          <WrappedAction
            {...restProps}
            {...restConfig}
            key={config.name}
            disabled={config.isDisabled({
              ...restConfig,
              ...props,
            })}
            parentForm={form}
          />
        )
      },
    }
  }

  constructor(props) {
    super(props)
    this.state = this.state || {}
    this.state.visible = false
  }

  renderForm() {
    return <Form key="form" {...this.props} />
  }

  renderActions() {
    return this.props.actions.map((action) =>
      action.render({
        ...this.props,
        modalAction: this,
      })
    )
  }

  renderModal() {
    return (
      <AntdModal
        title={this.props.getModalTitle(this.props)}
        footer={this.renderActions()}
        visible={this.state.visible}
        onCancel={this.handleCancel}
        {...this.props.getModalProps(this.props)}
      >
        {this.renderBeforeForm()}
        {this.renderForm()}
        {this.renderAfterForm()}
      </AntdModal>
    )
  }

  handleClick = () => {
    if (!this.props.shouldOpenModal || this.props.shouldOpenModal(this.props)) {
      this.setState((state) => ({ visible: !state.visible }))
    }
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  renderBeforeForm() {
    return this.props.renderBeforeForm
      ? this.props.renderBeforeForm(this.props)
      : null
  }

  renderAfterForm() {
    return this.props.renderAfterForm
      ? this.props.renderAfterForm(this.props)
      : null
  }

  render() {
    return (
      <>
        {super.render()}
        {this.renderModal()}
      </>
    )
  }
}

Admin.addToLibrary('ActionWithFormModal', (config) =>
  ActionWithFormModal.create(config)
)
