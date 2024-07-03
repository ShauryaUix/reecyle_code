/* global FileReader, fetch */

import isArray from 'lodash/isArray'

import React from 'react'

import Icon from 'antd/lib/icon'
import Upload from 'antd/lib/upload'
import Button from 'antd/lib/button'

import Admin from './Admin'
import Field from './Field'

import './FieldUpload.less'

export default class FieldUpload extends Field {
  static config = {
    ...Field.config,
    isUpload: true,
    listType: 'picture-card',
    maxCount: 1,
    showUploadList: true,
    accept: 'image/*',
    shouldRenderAddButton: ({ value = [], disabled, maxCount }) =>
      disabled
        ? false
        : (isArray(value) ? value : value ? [value] : []).filter(
              (file) => !!file
            ).length < maxCount
          ? true
          : false,
    fileListFromValue: ({ value, client }) =>
      !value
        ? []
        : (isArray(value) ? value : [value])
            .filter((file) => !!file)
            .map((file) => ({
              uid: file._id,
              url: client.prefix(`storage/${file.container}/${file.name}`),
              ...file,
            })),
    valueFromFileList: (fileList) => {
      const files = (fileList || []).filter((file) => !!file)
      return files.length ? files : [null]
    },
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    listType: true,
    showUploadList: true,
    accept: true,
  }

  fakeRequest = ({ file, onSuccess }) => {
    const timeout = setTimeout(() => onSuccess(file), 10)
    return { abort: () => clearTimeout(timeout) }
  }

  handleChange = ({ fileList }) =>
    Promise.all(
      fileList
        .filter((file) => !!file)
        .map((file) =>
          !file.url
            ? new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.addEventListener('load', () => resolve(reader.result))
                reader.addEventListener('error', reject)
                reader.readAsDataURL(file.originFileObj)
              }).then((dataUrl) => ({
                ...file,
                blob: file.originFileObj,
                url: dataUrl,
                status: 'done',
                percent: 1,
              }))
            : !file.blob
              ? fetch(file.url)
                  .then((res) => res.blob())
                  .then((blob) => {
                    file.blob = blob
                    return file
                  })
                  .catch(() => null)
              : file
        )
    ).then((files) =>
      this.props.onChange(this.props.valueFromFileList(files, this.props))
    )

  renderAddButton() {
    return this.props.listType === 'picture-card' ? (
      <Icon type="plus" />
    ) : (
      <Button>
        <Icon type="upload" /> Upload
      </Button>
    )
  }

  renderInput(props) {
    return (
      <span
        style={
          this.props.disabled ? { pointerEvents: 'none', opacity: 0.3 } : {}
        }
      >
        <Upload
          {...props}
          multiple={this.props.maxCount > 1}
          customRequest={this.fakeRequest}
          onChange={this.handleChange}
          fileList={this.props.fileListFromValue(this.props)}
        >
          {this.props.shouldRenderAddButton(this.props)
            ? this.renderAddButton()
            : null}
        </Upload>
      </span>
    )
  }
}

Admin.addToLibrary('FieldUpload', (config) => FieldUpload.create(config))
