/* global window */

import isObject from 'lodash/isObject'

import React, { cloneElement } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import Form from 'antd/lib/form'
import AntdRow from 'antd/lib/row'
import AntdCol from 'antd/lib/col'
import Divider from 'antd/lib/divider'
import Button from 'antd/lib/button'
import Icon from 'antd/lib/icon'
import Collapse from 'antd/lib/collapse'

import Admin from '../Admin'
import Page from '../Page'
import Query from '../Query'
import { HeaderAction } from '../Header'

import InfiniteScrollQuery from './InfiniteScrollQuery'

import Filters from '../Filters'

import './index.less'

const CreateButton = styled(Button)`
  padding-left: 10px;
`

const FiltersCollapse = styled(Collapse)`
  background-color: transparent !important;
  margin-bottom: 20px;
  .ant-collapse-header {
    padding: 0px !important;
    > i {
      display: none !important;
    }
    > .ant-btn {
      text-align: left;
      padding: 0px 10px;
    }
  }
  .ant-collapse-item {
    border-bottom: 0px;
    &.ant-collapse-item-active {
      margin-bottom: -20px;
    }
  }
  .ant-collapse-content-box {
    padding: 0px !important;
    padding-top: 24px !important;
  }
  .ant-row-flex .ant-form-item {
    padding-bottom: 0px;
  }
  .ant-collapse-content-box > .ant-row-flex {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0px;
  }
  /* & + .ant-divider {
    opacity: 0;
  } */
`

export default class PageArchive extends Page {
  static config = {
    ...Page.config,
    ClassName: 'PageArchive',
    loadMethod: 'get',
    loadRequestConfig: {},
    filters: [],
    getArchiveFilters: (props, filters) => filters,
    getUseFiltersExtra: (props) => !props.isSizeLG,

    archiveQueryMode: 'paginated',
    getArchiveQueryMode: (props) =>
      props.isMobile || props.isTablet
        ? 'infinite-scroll'
        : props.archiveQueryMode,
    renderArchiveQueryModePaginated: (
      props,
      filterProps,
      queryProps,
      children
    ) => (
      <Query
        key={`query-paginated-${props.path}`}
        url={filterProps.queryUrl}
        client={queryProps.client}
        method={queryProps.method}
        config={queryProps.config}
        extractData={queryProps.extractData}
      >
        {children}
      </Query>
    ),
    renderArchiveQueryModeInfiniteScroll: (
      props,
      filterProps,
      queryProps,
      children
    ) => (
      <InfiniteScrollQuery
        key={`query-infinite-scroll-${props.path}`}
        url={queryProps.url}
        client={queryProps.client}
        method={queryProps.method}
        extractData={queryProps.extractData}
        builder={filterProps.builder}
        queryUrl={filterProps.queryUrl}
        shouldReload={(oldProps, newProps) =>
          oldProps.queryUrl !== newProps.queryUrl
        }
        getUrl={({ url, limit, builder }, page) =>
          `${url}?query=${encodeURIComponent(
            JSON.stringify({
              ...builder.build(),
              skip: page * limit,
              limit,
            })
          )}`
        }
      >
        {children}
      </InfiniteScrollQuery>
    ),
    renderArchiveQuery: (props, filterProps, queryProps, children) => {
      const mode = props.getArchiveQueryMode(props, filterProps, queryProps)
      return mode === 'paginated'
        ? props.renderArchiveQueryModePaginated(
            props,
            filterProps,
            queryProps,
            children
          )
        : mode === 'infinite-scroll'
          ? props.renderArchiveQueryModeInfiniteScroll(
              props,
              filterProps,
              queryProps,
              children
            )
          : null
    },

    createButtonSupported: true,
    getCreateButtonSupported: (props) => props.createButtonSupported,
    createButtonPath: null,
    getCreateButtonPath: (props) =>
      props.createButtonPath ||
      `${props.location.pathname.replace(/\/$/, '')}/create`,
    createButtonLabel: 'Create New',
    getCreateButtonLabel: (props) => props.createButtonLabel,
  }

  static create(config) {
    const staticConfig = super.create(config)
    const {
      loadUrl,
      loadMethod,
      loadRequestConfig,
      loadExtractData,
      filters,
      getArchiveFilters,
      ...restConfig
    } = staticConfig
    const compiledFilters = Admin.compileFromLibrary(filters, true)
    const PageClass = this
    return {
      ...restConfig,
      render: (props) => (
        <Filters
          browserPath={props.pathname}
          browserSearch={props.search}
          queryUrl={loadUrl}
          filters={getArchiveFilters(
            props,
            compiledFilters.filter(
              (filter) => !filter.getSkip || !filter.getSkip(props, filter)
            )
          )}
          onChange={(pathname) => props.history.replace(pathname)}
          pageProps={props}
        >
          {(filterProps) =>
            props.renderArchiveQuery(
              props,
              filterProps,
              {
                client: props.client,
                url: loadUrl,
                method: loadMethod,
                config: loadRequestConfig,
                extractData: loadExtractData,
              },
              (queryProps) => (
                <PageClass
                  {...this.getProps(restConfig, config, props, queryProps)}
                  renderFilter={filterProps.renderFilter}
                  renderFilters={filterProps.renderFilters}
                  getFilterParams={filterProps.getParams}
                  getFilters={filterProps.getFilters}
                  queryBuilder={filterProps.builder}
                />
              )
            )
          }
        </Filters>
      ),
    }
  }

  isLoading() {
    return false
  }

  renderCreateButton(path, label, mode = 'default') {
    if (mode === 'small') {
      return <HeaderAction to={path} />
    }
    return (
      <Link to={path}>
        <CreateButton type="primary" size="default">
          <Icon type="plus" size="default" />
          {label}
        </CreateButton>
      </Link>
    )
  }

  renderAdminHeaderContent() {
    const { props } = this
    const adminHeaderContent = super.renderAdminHeaderContent()
    if (props.getCreateButtonSupported(props) && this.props.isTablet) {
      const createButtonPath = props.getCreateButtonPath(props)
      if (createButtonPath) {
        return cloneElement(adminHeaderContent, {
          rightTo: createButtonPath,
        })
      }
    }
    return adminHeaderContent
  }

  renderHeaderRight() {
    const { props } = this
    if (props.getCreateButtonSupported(props) && !props.isTablet) {
      const createButtonPath = props.getCreateButtonPath(props)
      return (
        <>
          {createButtonPath
            ? this.renderCreateButton(
                createButtonPath,
                props.getCreateButtonLabel(props)
              )
            : null}
          {props.renderHeaderRight(props)}
        </>
      )
    }
    return null
  }

  renderFiltersRow(filters, params) {
    return (
      <AntdRow gutter={20} type="flex">
        {filters.map((filter) => {
          const columnProps = isObject(filter.col)
            ? filter.col
            : { span: filter.col }
          return (
            <AntdCol key={filter.id} {...columnProps}>
              {this.props.renderFilter(filter, params, this.props)}
            </AntdCol>
          )
        })}
      </AntdRow>
    )
  }

  renderFilters(params, section) {
    const { filters, filtersExtra } = this.props.getFilters(section).reduce(
      (agr, filter) => {
        if (!filter.isHidden) {
          if (filter.isExtra) {
            agr.filtersExtra.push(filter)
          } else {
            agr.filters.push(filter)
          }
        }
        return agr
      },
      { filters: [], filtersExtra: [] }
    )
    const useFiltersExtra = this.props.getUseFiltersExtra(this.props)
    if (!useFiltersExtra) {
      filters.push(...filtersExtra)
    }
    if (!filters.length) {
      return null
    }
    return (
      <Form
        key={`filters-${section}`}
        section={section}
        layout="vertical"
        className={`page-archive-filters page-archive-filters-${section}`}
      >
        {section === 'bottom' ? <Divider /> : null}
        {section === 'bottom' && this.props.renderAboveBottomFilters
          ? this.props.renderAboveBottomFilters(this.props)
          : null}
        {this.renderFiltersRow(filters, params)}
        {useFiltersExtra && filtersExtra.length ? (
          <FiltersCollapse bordered={false} expandIcon={null}>
            <Collapse.Panel
              key="top"
              header={
                <Button icon="down" type="default" block>
                  Show All Filters
                </Button>
              }
            >
              {this.renderFiltersRow(filtersExtra, params)}
            </Collapse.Panel>
          </FiltersCollapse>
        ) : null}
        {section === 'top' && this.props.renderBelowTopFilters
          ? this.props.renderBelowTopFilters(this.props)
          : null}
        {section === 'top' ? <Divider style={{ marginTop: '4px' }} /> : null}
      </Form>
    )
  }

  renderArchiveContent() {
    return (
      <pre>
        <code>{JSON.stringify(this.props.response)}</code>
      </pre>
    )
  }

  renderFound() {
    const params = this.props.getFilterParams()
    return (
      <>
        {this.renderHeader(this.props)}
        {this.renderFilters(params, 'top')}
        {this.renderArchiveContent()}
        {this.renderFilters(params, 'bottom')}
      </>
    )
  }

  render() {
    window.HIVE_ADMIN_LAST_ARCHIVE_URL = [
      this.props.location.pathname.replace(/\/$/, '') || '/',
      this.props.location.search,
    ]
    return super.render()
  }
}

Admin.addToLibrary('PageArchive', (config) => PageArchive.create(config))
