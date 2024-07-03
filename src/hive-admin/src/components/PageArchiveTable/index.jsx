import getKey from 'lodash/get'
import isObject from 'lodash/isObject'
import isFunction from 'lodash/isFunction'
import isUndefined from 'lodash/isUndefined'

import React from 'react'
import { Link } from 'react-router-dom'

import Admin from '../Admin'

import PageArchive from '../PageArchive'
import ArchiveTableRows from './ArchiveTableRows'
import ArchiveTableCards from './ArchiveTableCards'

import './index.less'

export default class PageArchiveTable extends PageArchive {
  static config = {
    ...PageArchive.config,
    ClassName: 'PageArchiveTable',
  }

  static defaultProps = {
    ...PageArchive.config,

    archiveTableMode: 'rows',
    getArchiveTableMode: (props) =>
      props.isMobile || props.isTablet ? 'cards' : props.archiveTableMode,

    rowKey: '_id',

    columns: [{ title: 'ID', path: '_id' }],
    getColumns: (props, columns) =>
      (columns || props.columns || []).map((column) => {
        const parsed = {
          ...(isObject(column) ? column : {}),
          path: !isObject(column) ? column : column.path,
          title: !isObject(column)
            ? Admin.prettify(column)
            : isUndefined(column.title)
              ? Admin.prettify(column.path)
              : column.title,
          key: !isObject(column)
            ? column
            : isUndefined(column.key)
              ? column.path
              : column.key,
        }
        parsed.render =
          !isObject(column) || !isFunction(column.render)
            ? (text, record) => props.renderValue(record, parsed, props)
            : (text, record) => column.render(record, column, props)
        return parsed
      }),

    tableProps: {},
    tablePropsRows: {},
    tablePropsCards: {},
    titleColumnPath: 'name',
    getTableProps: (props, mode) =>
      mode === 'rows'
        ? {
            scroll: { x: 'max-content' },
            ...props.tableProps,
            ...props.tablePropsRows,
          }
        : mode === 'cards'
          ? {
              titleColumnPath: props.titleColumnPath,
              subtitleColumnPath: props.subtitleColumnPath,
              ...props.tableProps,
              ...props.tablePropsCards,
            }
          : { ...props.tableProps },

    transformValue: (text) => text,
    renderValue: (record, column, props) => {
      const text = (column.transformValue || props.transformValue)(
        getKey(record, column.path),
        record,
        column,
        props
      )
      if (column.link) {
        const to = column.link.replace(/:([^/]+)/g, (all, path) =>
          getKey(record, path)
        )
        return <Link to={to}>{text}</Link>
      }
      return text
    },
  }

  renderArchiveContentRows() {
    return (
      <ArchiveTableRows
        columns={this.props.getColumns(this.props)}
        dataSource={this.props.data ? this.props.data.data : []}
        size="middle"
        pagination={false}
        rowKey={this.props.rowKey}
        bordered
        style={
          this.props.loading
            ? { pointerEvents: 'none', opacity: 0.4 }
            : undefined
        }
        {...this.props.getTableProps(this.props, 'rows')}
      />
    )
  }

  renderArchiveContentCards() {
    return (
      <ArchiveTableCards
        columns={this.props.getColumns(this.props)}
        dataSource={this.props.data ? this.props.data.data : []}
        rowKey={this.props.rowKey}
        pagination={false}
        style={
          this.props.loading
            ? { pointerEvents: 'none', opacity: 0.4 }
            : undefined
        }
        {...this.props.getTableProps(this.props, 'cards')}
      />
    )
  }

  renderArchiveContent() {
    const mode = this.props.getArchiveTableMode(this.props)
    return mode === 'rows'
      ? this.renderArchiveContentRows(mode)
      : mode === 'cards'
        ? this.renderArchiveContentCards(mode)
        : null
  }
}

Admin.addToLibrary('PageArchiveTable', (config) =>
  PageArchiveTable.create(config)
)
