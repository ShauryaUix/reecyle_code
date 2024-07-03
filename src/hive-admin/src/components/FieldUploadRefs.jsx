/* global fetch, FormData, File */

import isArray from 'lodash/isArray'
import pick from 'lodash/pick'
import getKey from 'lodash/get'

import React, { Fragment } from 'react'

import Icon from 'antd/lib/icon'
import Upload from 'antd/lib/upload'
import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
import Input from 'antd/lib/input'

import Admin from './Admin'
import Field from './Field'
import InfiniteScrollQuery from './InfiniteScrollQuery'

import './FieldUploadRefs.less'

export default class FieldUploadRefs extends Field {
  static config = {
    ...Field.config,
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
    fileListFromValue: ({ value, maxCount }) =>
      (!value ? [] : isArray(value) ? value : [value])
        .filter((file) => !!file)
        .slice(0, maxCount || 1)
        .map((file) =>
          Object.assign(
            {
              uid: file._id,
              url: file.src,
              ...file,
            },
            file.meta && file.meta.filename
              ? {
                  name: file.meta.filename,
                  filename: file.name,
                }
              : {}
          )
        ),
    valueFromFileList: (fileList, props) => {
      const value = (fileList || [])
        .filter((file) => !!file)
        .map((file) => {
          const source = file.response || file
          const newFile = {
            percent: file.percent || 100,
            status: file.status || 'done',
            ...pick(
              source || {},
              '_id',
              'src',
              'url',
              'name',
              'filename',
              'container',
              'storage',
              'meta'
            ),
          }
          if (newFile.filename) {
            newFile.name = newFile.filename
            delete newFile.filename
          }
          newFile.url = newFile.src = source.src || source.url
          newFile.uid = file.uid || source._id
          return newFile
        })
      if (props.maxCount === 1) {
        return value[0] || null
      }
      return value || null
    },
    transformations: [],
    getTransformations: (props) => props.transformations,
    uploadUrl: '/files',
    getUploadArguments: (props) => ({
      transformations: props.getTransformations(props),
    }),
    getUploadUrl: (props) =>
      `${props.uploadUrl}?query=${encodeURIComponent(
        JSON.stringify(props.getUploadArguments(props))
      )}`,
    uploadLabel: 'Upload',
    getUploadLabel: (props) => props.uploadLabel,
    libraryLabel: 'Upload',
    getLibraryLabel: (props) => props.libraryLabel,
    library: false,
    LibraryClass: Modal,
    libraryTitle: 'Library',
    libraryQuerySearchProps: ['tags'],
    libraryQueryUrl: 'library',
    libraryQueryMethod: 'GET',
    getLibraryQueryData: (response) =>
      !response
        ? []
        : !response.data
          ? []
          : !response.data.data
            ? []
            : response.data.data,
    getLibraryWhereConditions: (search, props) =>
      props.libraryQuerySearchProps.length
        ? {
            OR: props.libraryQuerySearchProps.map((path) => ({
              AND: search.split(/\s+/g).map((word) => ({
                [path]: {
                  REGEX: word,
                  OPTIONS: 'i',
                },
              })),
            })),
          }
        : {},
    libraryItemDownloadSrcPath: 'file.src',
    getLibraryItemDownloadSrc: (item, props) =>
      getKey(item, props.libraryItemSrcPath),
    libraryItemPreviewSrcPath: 'file.src',
    getLibraryItemPreviewSrc: (item, props) =>
      getKey(item, props.libraryItemPreviewSrcPath),
    libraryItemTagsPath: 'tags',
    getLibraryItemTags: (item, props) =>
      getKey(item, props.libraryItemTagsPath),
    libraryItemNamePath: 'file.name',
    getLibraryItemName: (item, props) =>
      getKey(item, props.libraryItemNamePath),
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    listType: true,
    showUploadList: true,
    accept: true,
  }

  constructor(props) {
    super(props)
    this.state = this.state || {}
    this.state.libraryOpen = false
    this.state.librarySearch = ''
    this.uploadRef = React.createRef()
  }

  handleFileUpload = ({ file, onSuccess, onProgress, onError }) => {
    const form = new FormData()
    form.append('file', file)
    const source = this.props.client.axios.CancelToken.source()
    const uploadPromise = this.props.client
      .request({
        url: this.props.getUploadUrl(this.props) || '/files',
        method: this.props.uploadMethod || 'POST',
        data: form,
        cancelToken: source.token,
        onUploadProgress: ({ total, loaded }) =>
          onProgress({
            percent: (loaded / total) * 100,
          }),
      })
      .then((response) => onSuccess(response.data))
      .catch((error) => {
        if (!this.props.client.axios.isCancel(error)) {
          onError(error)
        }
      })
    file.abortUpload = source.cancel
    return { upload: uploadPromise, abort: source.cancel }
  }

  handleChange = ({ fileList }) => {
    const nonRemovedFiles = fileList.filter(
      (file) => file && file.status !== 'removed'
    )
    const filesWithinMaxCount = nonRemovedFiles.slice(
      0,
      this.props.maxCount || 1
    )
    const filesOutsideMaxCount = nonRemovedFiles.slice(this.props.maxCount || 1)
    filesOutsideMaxCount.forEach((file) => {
      try {
        if (file.status === 'uploading' && file.abortUpload) {
          file.abortUpload()
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('error aborting max count upload', error)
      }
    })
    this.props.onChange(
      this.props.valueFromFileList(filesWithinMaxCount, this.props)
    )
  }

  handleAddButtonWrapperEvent = (event) => {
    const action = event.target.getAttribute('data-action')
    const className = event.target.getAttribute('class')
    if (className === 'ant-upload' || action === 'select') {
      if (
        event.type === 'click' ||
        event.key === 'Enter' ||
        event.code === 'Event' ||
        event.keyCode == 13 // eslint-disable-line eqeqeq
      ) {
        event.stopPropagation()
        event.preventDefault()
        if (action === 'select') {
          this.toggleLibrary()
        }
        if (event.type === 'click') {
          event.target.blur && event.target.blur()
        }
      }
    }
  }

  handleAddButtonWrapperRef = (ref) => {
    if (ref) {
      ;[ref, ref.parentNode].forEach((node) =>
        ['click', 'keypress', 'keydown', 'beforeinput'].forEach((event) =>
          node.addEventListener(event, this.handleAddButtonWrapperEvent)
        )
      )
    }
  }

  toggleLibrary = (open) => {
    const libraryOpen =
      open === true ? true : open === false ? false : !this.state.libraryOpen
    this.setState({ libraryOpen })
  }

  handleLibraryGetWhereConditions = (propsFromQuery) =>
    this.props.getLibraryWhereConditions(propsFromQuery.search, this.props)

  handleLibraryShouldReload = (oldProps, newProps) =>
    oldProps.search !== newProps.search

  handleLibrarySearch = (event) => {
    this.setState({ librarySearch: event.target.value })
  }

  handleLibraryItemSelect = (item) => {
    const name =
      this.props.getLibraryItemName(item, this.props) || 'library-upload'
    const src = this.props.getLibraryItemDownloadSrc(item, this.props)
    if (src) {
      fetch(src)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], name, { type: blob.type })
          file.uid = item._id
          this.uploadRef.current.upload.uploader.post(file)
          this.toggleLibrary(false)
        })
    }
  }

  renderLibraryHeader() {
    return (
      <div className="header">
        <span>{this.props.libraryTitle}</span>
        <Input
          onChange={this.handleLibrarySearch}
          placeholder="Type to search"
          autoFocus
        />
      </div>
    )
  }

  renderLibraryItem = (item) => {
    const src = this.props.getLibraryItemPreviewSrc(item, this.props)
    const tags = this.props.getLibraryItemTags(item, this.props)
    return !src ? null : (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div key={item._id} className="grid-item-spacer">
        {
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            className="grid-item"
            onClick={() => this.handleLibraryItemSelect(item)}
          >
            <div className="grid-item-header">
              <div
                className="grid-item-header-image"
                style={{ backgroundImage: `url(${src})` }}
              />
            </div>
            <div className="grid-item-content">
              <div className="tags">
                {tags.map((tag, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={`${tag}${i}`} className="tag">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      </div>
    )
  }

  renderLibrary() {
    const { LibraryClass } = this.props
    return (
      <LibraryClass
        key="library"
        className="file-upload-refs-library"
        visible={this.state.libraryOpen}
        title={this.renderLibraryHeader()}
        onCancel={() => this.toggleLibrary(false)}
        closable={false}
        footer={null}
        width="70%"
        destroyOnClose
        centered
      >
        <div className="scroller">
          <InfiniteScrollQuery
            url={this.props.libraryQueryUrl}
            method={this.props.libraryMethod || 'GET'}
            client={this.props.client}
            className="grid-items"
            getWhereConditions={this.handleLibraryGetWhereConditions}
            shouldReload={this.handleLibraryShouldReload}
            renderItem={this.renderLibraryItem}
            search={this.state.librarySearch}
            limit={40}
          />
        </div>
      </LibraryClass>
    )
  }

  renderAddButton() {
    return this.props.listType === 'picture-card' ? (
      <div
        className="file-upload-refs-add-wrapper"
        ref={this.handleAddButtonWrapperRef}
      >
        <Button className="file-upload-refs-add-button" data-action="upload">
          <Icon type="upload" />
          &nbsp;
          {this.props.getUploadLabel(this.props)}
        </Button>
        {this.props.library ? (
          <Fragment>
            <div className="file-upload-refs-add-separator" />
            <Button
              className="file-upload-refs-add-button"
              data-action="select"
            >
              <Icon type="picture" />
              &nbsp;
              {this.props.getLibraryLabel(this.props)}
            </Button>
          </Fragment>
        ) : null}
      </div>
    ) : (
      <div ref={this.handleAddButtonWrapperRef}>
        <Button.Group>
          <Button data-action="upload">
            <Icon type="upload" />
            &nbsp;
            {this.props.getUploadLabel(this.props)}
          </Button>
          {this.props.library ? (
            <Button data-action="select">
              <Icon type="picture" />
              &nbsp;
              {this.props.getLibraryLabel(this.props)}
            </Button>
          ) : null}
        </Button.Group>
      </div>
    )
  }

  renderInput(props) {
    return (
      <span
        style={
          this.props.disabled ? { pointerEvents: 'none', opacity: 0.3 } : {}
        }
      >
        {this.props.library ? this.renderLibrary() : null}
        <Upload
          {...props}
          ref={this.uploadRef}
          multiple={this.props.maxCount > 1}
          customRequest={this.handleFileUpload}
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

Admin.addToLibrary('FieldUploadRefs', (config) =>
  FieldUploadRefs.create(config)
)
