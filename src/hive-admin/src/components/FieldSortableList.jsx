import React, { Component } from 'react'
import styled, { keyframes } from 'styled-components'

import omit from 'lodash/omit'
import isArray from 'lodash/isArray'

import memoize from 'memoize-one'
import arrayMove from 'array-move'

import Button from 'antd/lib/button'
import Icon from 'antd/lib/icon'
import AntdForm from 'antd/lib/form'

import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc'

import Admin from './Admin'
import Field from './Field'

import Form from './Form'

const FadeInAnimation = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

let SORT_ID_COUNTER = 1

const InputWrapper = styled.span`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
  &[data-disabled='true'] {
    pointer-events: none;
    opacity: 0.3;
  }
`

const FieldSortableContainer = styled.div`
  width: 100%;
  &[data-condensed='true']:not(:empty) {
    margin-bottom: 20px;
  }
`

const FieldSortableListItemWrapper = styled.div`
  position: relative;
  display: flex;
  border: 1px solid #ddd;
  background-color: white;
  animation: ${FadeInAnimation} 600ms linear 0ms normal forwards;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.05);
  &[data-condensed='false'] {
    padding: 20px 20px 0px 20px;
    border-radius: ${({ theme }) => theme.less.borderRadius};
    margin-bottom: 20px;
  }
  &[data-condensed='true'] {
    padding: 5px 5px 0px 10px;
    border-radius: 0px;
    margin-bottom: -1px;
    &:first-child {
      border-top-left-radius: ${({ theme }) => theme.less.borderRadius};
      border-top-right-radius: ${({ theme }) => theme.less.borderRadius};
    }
    &:last-child {
      border-bottom-left-radius: ${({ theme }) => theme.less.borderRadius};
      border-bottom-right-radius: ${({ theme }) => theme.less.borderRadius};
      margin-bottom: 0px;
    }
  }
`

const FieldSortableListItemAction = styled(Icon)``

const FieldSortableListItemHandleLine = styled.div`
  display: flex;
  border-left: 1px solid #ddd;
  align-self: stretch;
`

const FieldSortableListItemHandle = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-around;
  width: 18px;
  min-height: 14px;
  cursor: grab;
`

const FieldSortableListItemHead = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  &[data-head='vertical'] {
    flex-direction: column;
    > .field-sortable-list-item-head-control:not(:first-child) {
      margin-top: 10px;
    }
  }
  &[data-head='horizontal'] {
    flex-direction: row;
    > .field-sortable-list-item-head-control:not(:first-child) {
      margin-left: 10px;
    }
    > .field-sortable-list-item-head-handle {
      align-self: stretch;
      padding: 5px 0px;
    }
  }
  &[data-condensed='false'] {
    padding-bottom: 20px;
  }
  &[data-condensed='true'] {
    padding-bottom: 5px;
    &[data-head='vertical'] {
      padding-top: 10px;
      padding-bottom: 15px;
    }
  }
`

const FieldSortableListItemBody = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  width: calc(100% - 20px);
  overflow: visible;
  > .ant-form {
    width: 100%;
    > .ant-row {
      &:last-child {
        margin-bottom: 0px;
      }
      > .ant-col {
        > .ant-row.ant-form-item {
          padding-bottom: 0px !important;
          margin-bottom: 20px;
        }
      }
    }
  }
  &[data-condensed='false'] {
    padding-left: 20px;
  }
  &[data-condensed='true'] {
    padding-left: 10px;
    > .ant-form > .ant-row {
      margin-left: -2.5px !important;
      margin-right: -2.5px !important;
      &:last-child {
        margin-bottom: 0px;
      }
      > .ant-col {
        padding-left: 2.5px !important;
        padding-right: 2.5px !important;
        > .ant-row.ant-form-item {
          margin-bottom: 5px;
        }
        &:last-child {
          > .ant-row.ant-form-item {
            margin-bottom: 5px !important;
          }
        }
      }
    }
  }
`

const FieldSortableListItemCollapseHeader = styled.div`
  font-size: 20px;
  &[data-condensed='false'] {
    padding-bottom: 20px;
  }
  &[data-condensed='true'] {
    padding-bottom: 10px;
  }
`

export class FieldSortableListItem extends Component {
  constructor(props) {
    super(props)
    this.Wrapped = AntdForm.create({
      onValuesChange: (_, changedFields, allFields) => {
        this.props.onChange(this.props.index, {
          ...this.props.value,
          ...allFields,
        })
      },
    })(props.Component)
  }

  render() {
    let { head } = this.props
    const {
      Component: _,
      form,
      name,
      value,
      onChange,
      index,
      onRemove,
      onDuplicate,
      renderHandle,
      wrapperStyle,
      condensed,
      className,
      collapseFieldName,
      collapseLabelFieldName,
      collapseLabelDefault,
      getCollapseLabel,
      ...props
    } = this.props
    const { Wrapped } = this
    const collapsed = collapseFieldName ? !!value[collapseFieldName] : false
    if (collapsed) {
      head = 'horizontal'
    }
    const headActions = (
      <>
        {collapseFieldName ? (
          <FieldSortableListItemAction
            type={collapsed ? 'down' : 'up'}
            onClick={() =>
              onChange(index, {
                ...value,
                [collapseFieldName]: !collapsed,
              })
            }
            // eslint-disable-next-line max-len
            className="field-sortable-list-item-head-control field-sortable-list-item-head-action"
          />
        ) : null}
        {onRemove ? (
          <FieldSortableListItemAction
            type="delete"
            onClick={() => onRemove(index)}
            // eslint-disable-next-line max-len
            className="field-sortable-list-item-head-control field-sortable-list-item-head-action"
          />
        ) : null}
        {onDuplicate ? (
          <FieldSortableListItemAction
            type="copy"
            onClick={() => onDuplicate(index)}
            // eslint-disable-next-line max-len
            className="field-sortable-list-item-head-control field-sortable-list-item-head-action"
          />
        ) : null}
      </>
    )
    const headHandle = renderHandle(value)
    return (
      <FieldSortableListItemWrapper
        style={wrapperStyle}
        className={`field-sortable-list-item-wrapper ${className}`}
        data-condensed={!!condensed}
      >
        <FieldSortableListItemHead
          className="field-sortable-list-item-head"
          data-condensed={!!condensed}
          data-head={head}
        >
          {head === 'horizontal' ? (
            <>
              {headActions}
              {headHandle}
            </>
          ) : (
            <>
              {headActions}
              {headHandle}
            </>
          )}
        </FieldSortableListItemHead>
        <FieldSortableListItemBody
          className="field-sortable-list-item-body"
          data-condensed={!!condensed}
        >
          {collapsed ? (
            <FieldSortableListItemCollapseHeader data-condensed={!!condensed}>
              {getCollapseLabel(this.props, value)}
            </FieldSortableListItemCollapseHeader>
          ) : (
            <Wrapped
              {...props}
              index={index}
              data={value}
              parentData={this.props.data}
            />
          )}
        </FieldSortableListItemBody>
      </FieldSortableListItemWrapper>
    )
  }
}

export default class FieldSortableList extends Field {
  static config = {
    ...Field.config,

    maxCount: Infinity,
    shouldRenderAddButton: ({ value = [], disabled, maxCount }) =>
      disabled
        ? false
        : (isArray(value) ? value : value ? [value] : []).filter(
              (item) => !!item
            ).length < maxCount
          ? true
          : false,

    useDragHandle: true,
    generateNewItem: (/* props, self */) => ({}),
    addButtonLabel: 'Add',
    renderAddButton: (props, self) => (
      <Button
        icon="plus"
        onClick={() => self.addItem(props.generateNewItem(props, self))}
      >
        {props.addButtonLabel}
      </Button>
    ),
    renderItemName: (item) => (item && item.name ? item.name : ''),

    fields: [],
    excludeFields: [],
    getFields: (props) =>
      props.fields.filter(
        (field) => props.excludeFields.indexOf(field.name) === -1
      ),

    head: 'vertical',

    supportRemove: true,
    supportDuplicate: false,

    collapseFieldName: null,
    collapseLabelFieldName: 'name',
    collapseLabelDefault: 'Item',
    getCollapseLabel: (props) =>
      props.value[props.collapseLabelFieldName] || props.collapseLabelDefault,

    FormComponent: Form,
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    pageform: true,
    forms: true,
    datas: true,
  }

  static create(config) {
    const staticConfig = super.create(config)
    const fields = Admin.compileFromLibrary(staticConfig.fields, true)
    return {
      ...staticConfig,
      fields,
      render: (props) => (
        <this
          {...this.getProps(staticConfig, config, props)}
          fields={fields}
          key={staticConfig.name}
          disabled={staticConfig.isDisabled({
            ...staticConfig,
            ...props,
          })}
        />
      ),
    }
  }

  constructor(props) {
    super(props)
    this.state = this.state || {}
    this.SortableItem = sortableElement(this.renderItem)
    this.SortableContainer = sortableContainer(this.renderContainer)
    this.SortableHandle = sortableHandle(this.renderHandle)
    this.getMemoizedHead = memoize((head, xs, sm, md, lg, xl, xxl) => {
      if (head === 'vertical' || head === 'horizontal') {
        return head
      }
      head = { xs: 'vertical', ...head }
      const test = { xs, sm, md, lg, xl, xxl }
      const list = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']
      const index = list.findIndex((size) => test[size] === true && head[size])
      const size = list[index]
      if (!head[size]) {
        return 'vertical'
      }
      return head[size]
    })
  }

  addItem = (item = {}) => {
    this.props.onChange([
      ...(isArray(this.props.value) ? this.props.value : []),
      item,
    ])
  }

  handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      this.props.onChange(
        isArray(this.props.value)
          ? arrayMove(this.props.value, oldIndex, newIndex)
          : []
      )
    }
  }

  renderHandle = ({ value: item }) =>
    this.props.renderHandle ? (
      this.props.renderHandle(item, this.props, this)
    ) : (
      <FieldSortableListItemHandle
        // eslint-disable-next-line max-len
        className="field-sortable-list-item-head-control field-sortable-list-item-head-handle"
      >
        <FieldSortableListItemHandleLine />
        <FieldSortableListItemHandleLine />
        <FieldSortableListItemHandleLine />
      </FieldSortableListItemHandle>
    )

  renderSortableHandle = (item) => {
    const { SortableHandle } = this
    return <SortableHandle value={item} />
  }

  renderAddButton() {
    return this.props.renderAddButton(this.props, this)
  }

  renderItem = ({ value, itemIndex: index, head, forms, datas, ...rest }) =>
    this.props.renderItem ? (
      this.props.renderItem(value, index, { ...this.props, ...rest }, this)
    ) : (
      <FieldSortableListItem
        {...rest}
        {...this.props}
        value={value}
        name={this.props.name}
        index={index}
        condensed={this.props.condensed}
        head={head}
        forms={forms}
        datas={datas}
        Component={this.props.FormComponent}
        onChange={this.handleChange}
        onRemove={this.props.supportRemove ? this.removeItem : null}
        onDuplicate={this.props.supportDuplicate ? this.duplicateItem : null}
        renderHandle={this.renderSortableHandle}
        wrapperStyle={this.props.sortableListItemWrapperStyle}
        className={this.props.sortableListItemWrapperClassName}
        collapseFieldName={this.props.collapseFieldName}
        collapseLabelFieldName={this.props.collapseLabelFieldName}
        collapseLabelDefault={this.props.collapseLabelDefault}
        getCollapseLabel={this.props.getCollapseLabel}
      />
    )

  renderSortableItem = (item, index, props) => {
    const { SortableItem } = this
    if (!item.__SORT_ID) {
      item.__SORT_ID = SORT_ID_COUNTER++
    }
    return (
      <SortableItem
        key={item.__SORT_ID}
        {...props}
        index={index}
        itemIndex={index}
        value={item}
      />
    )
  }

  renderContainer = ({ children }) =>
    this.props.renderContainer ? (
      this.props.renderContainer(children, this.props, this)
    ) : (
      <FieldSortableContainer
        style={this.props.sortableContainerStyle || {}}
        data-condensed={!!this.props.condensed}
        className="field-sortable-container"
      >
        {children}
      </FieldSortableContainer>
    )

  removeItem = (index) => {
    this.props.onChange(
      this.props.prepareValueForForm(
        isArray(this.props.value)
          ? this.props.value.filter(
              (testItem, testIndex) => testIndex !== index
            )
          : []
      )
    )
  }

  duplicateItem = (index) => {
    this.props.onChange(
      this.props.prepareValueForForm(
        isArray(this.props.value)
          ? this.props.value.reduce((agr, item, itemIndex) => {
              agr.push(item)
              if (itemIndex === index) {
                agr.push({
                  ...this.props.generateNewItem(this.props, this),
                  ...omit(item, '_id', 'sku', '__SORT_ID'),
                })
              }
              return agr
            }, [])
          : []
      )
    )
  }

  handleChange = (index, value) => {
    this.props.onChange(
      this.props.prepareValueForForm(
        isArray(this.props.value)
          ? this.props.value.map((item, itemIndex) =>
              itemIndex === index ? { ...item, ...value } : item
            )
          : [value],
        this.props
      )
    )
  }

  renderInput(props) {
    const { SortableContainer } = this
    const head = this.getMemoizedHead(
      this.props.head,
      this.props.isSizeXS,
      this.props.isSizeSM,
      this.props.isSizeMD,
      this.props.isSizeLG,
      this.props.isSizeXL,
      this.props.isSizeXXL
    )
    return (
      <InputWrapper
        data-input-id={this.props.inputId || undefined}
        data-condensed={!!this.props.condensed}
        data-disabled={!!this.props.disabled}
      >
        <SortableContainer
          {...props}
          onSortEnd={this.handleSortEnd}
          useDragHandle={this.props.useDragHandle}
          lockAxis={this.props.lockAxis || 'y'}
        >
          {isArray(this.props.value)
            ? this.props.value.map((item, index) =>
                this.renderSortableItem(item, index, {
                  ...props,
                  pageform: this.props.form,
                  forms: [this.props.form, ...(this.props.forms || [])],
                  datas: [this.props.data, ...(this.props.datas || [])],
                  head,
                })
              )
            : null}
        </SortableContainer>
        {this.props.shouldRenderAddButton(this.props)
          ? this.renderAddButton()
          : null}
      </InputWrapper>
    )
  }
}

Admin.addToLibrary('FieldSortableList', (config) =>
  FieldSortableList.create(config || {})
)
