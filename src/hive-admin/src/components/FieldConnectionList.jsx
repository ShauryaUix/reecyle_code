import React from 'react'
import isArray from 'lodash/isArray'
import setKey from 'lodash/set'

import List from 'antd/lib/list'
import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
import AntdForm from 'antd/lib/form'

import { stringify as stringifyQuery } from 'query-string'

import Admin from './Admin'
import Field from './Field'
import Query from './Query'
import Form from './Form'

export default class FieldConnectionList extends Field {
  static config = {
    ...Field.config,
    url: '/',
    method: 'get',
    fields: [],
    createMethod: 'post',
    deleteMethod: 'delete',
    modalTitle: 'Add new item',
    modalActions: [
      [
        'ActionCreate',
        {
          label: 'Add',
        },
      ],
    ],
    itemActions: [
      [
        'ActionDelete',
        {
          icon: 'delete',
          shape: 'circle',
          title: null,
          handleSuccess: (data, props) => props.reload(),
          getRequestConfig: (props) => ({
            method: props.deleteMethod,
            url: props.replaceUrlProps(props.deleteUrl, props, props.item),
          }),
        },
      ],
    ],
    getFields: (props) =>
      props.fields.filter(
        (field) => props.excludeFields.indexOf(field.name) === -1
      ),
    requestConfig: {},
    extractData: (response) =>
      response && response.data && isArray(response.data.data)
        ? response.data.data
        : [],
    extractItems: (data) => data,
  }

  // static inputPropsMap = {
  //   name: true,
  //   size: true,
  //   value: true,
  //   disabled: true,
  //   onChange: true,
  //   defaultValue: true,
  // }

  static create(config) {
    config = this.getConfig(config)
    config.disabled = Admin.compileFromLibrary(config.disabled, true)
    config.skip = Admin.compileFromLibrary(config.skip, true)
    config.fields = Admin.compileFromLibrary(config.fields, true)
    config.modalActions = Admin.compileFromLibrary(config.modalActions, true)
    config.itemActions = Admin.compileFromLibrary(config.itemActions, true)
    const Wrapped = AntdForm.create()(this)
    return {
      ...config,
      label: config.label
        ? config.label
        : `${config.name[0].toUpperCase()}${config.name.slice(1)}`,
      render: (props) => (
        <Query
          key={config.key || config.name}
          url={`${config.url}?${stringifyQuery(
            config.getQuery({ ...props, ...config })
          )}`}
          client={props.client}
          extractData={config.extractData}
          method={config.method}
          config={config.requestConfig}
          autoload
          autoreload
        >
          {(queryProps) => (
            <Wrapped
              {...props}
              {...queryProps}
              {...config}
              key={config.name}
              disabled={config.isDisabled({
                ...config,
                ...props,
              })}
            />
          )}
        </Query>
      ),
    }
  }

  constructor(props) {
    super(props)
    this.state = { createModalOpen: false }
  }

  toggleCreatePopup = () => {
    const nextOpen = !this.state.createModalOpen
    if (!nextOpen) {
      this.props.form.setFieldsValue(
        this.props.fields.reduce((agr, field) => {
          setKey(agr, field.name, undefined)
          return agr
        }, {})
      )
    }
    this.setState({ createModalOpen: !this.state.createModalOpen })
  }

  renderAddButton() {
    return (
      <div
        key="add"
        style={{
          marginTop: 12,
          height: 32,
          lineHeight: '32px',
        }}
      >
        <Button onClick={() => this.toggleCreatePopup()}>Add New</Button>
      </div>
    )
  }

  renderCreateModal() {
    return (
      <Modal
        key="popup"
        title={this.props.modalTitle}
        visible={this.state.createModalOpen}
        wrapClassName="vertical-center-modal"
        footer={this.renderCreateModalFooter()}
        afterClose={() => this.props.reload()}
        onCancel={this.toggleCreatePopup}
      >
        <Form {...this.props} />
      </Modal>
    )
  }

  renderCreateModalFooter() {
    return this.props.modalActions.map((action) =>
      action.render({
        ...this.props,
        toggleCreatePopup: this.toggleCreatePopup,
      })
    )
  }

  renderListItem(item) {
    return (
      <List.Item
        actions={this.props.itemActions.map((action) =>
          action.render({ ...this.props, item })
        )}
      >
        <List.Item.Meta
          title={item.title}
          description={item.description}
          avatar={
            <div
              style={{
                width: '50px',
                height: '50px',
                backgroundImage: `url(${item.avatar})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
          }
        />
      </List.Item>
    )
  }

  renderList() {
    return (
      <List
        key="list"
        size="large"
        // grid={{ gutter: 16, column: 4 }}
        loading={this.props.loading}
        itemLayout="horizontal"
        dataSource={this.props.extractItems(this.props.data, this.props)}
        renderItem={(item) => this.renderListItem(item)}
      />
    )
  }

  render(/* extras = {} */) {
    return [
      this.props.data && this.props.data.length ? this.renderList() : null,
      this.renderCreateModal(),
      this.renderAddButton(),
    ]
  }
}

Admin.addToLibrary('FieldConnectionList', (config) =>
  FieldConnectionList.create(config)
)
