/* global window */

import React, { cloneElement } from 'react'
import styled from 'styled-components'

import AntdForm from 'antd/lib/form'
import Divider from 'antd/lib/divider'
import Button from 'antd/lib/button'
import Icon from 'antd/lib/icon'

import { Link } from 'react-router-dom'

import Admin from './Admin'

import Form from './Form'
import Page from './Page'
import Query from './Query'

import './PageSingle.less'

import { Page404Wrapper, Page404Title, Page404Description } from './Page404'

const CloseButton = styled(Button)`
  padding-left: 10px;
  i {
    transform: rotate(45deg);
  }
`

function compileBackButtonPath(paths) {
  const archiveUrl = window.HIVE_ADMIN_LAST_ARCHIVE_URL
  return archiveUrl && paths.includes(archiveUrl[0])
    ? archiveUrl.join('')
    : paths[0]
}

export default class PageSingle extends Page {
  static config = {
    ...Page.config,
    ClassName: 'PageSingle',

    loadMethod: 'get',
    loadRequestConfig: {},
    loadExtractData: (response) => (response ? response.data : null),
    isNotFound: (props) => !props.loading && props.data === null,

    saveMethod: 'patch',
    saveRequestConfig: {},

    deleteMethod: 'delete',
    deleteRequestConfig: {},

    restoreMethod: 'post',
    restoreMethodConfig: {},

    fields: [],
    filters: [],
    excludeFields: [],
    getFields: (props) =>
      props.fields.filter(
        (field) => props.excludeFields.indexOf(field.name) === -1
      ),

    actions: [],
    getActions: (props) => props.actions,

    formLayout: 'vertical',
    getFormProps: (props) => props.formProps,
    formProps: {},

    createConfig: {
      exact: true,
      actions: [['ActionCreate']],
    },

    headerTitleKey: 'name',

    editConfig: {
      hidden: true,
      actions: [['ActionSave'], ['ActionDelete'], ['ActionRestore']],
    },

    style: {
      maxWidth: '800px',
      margin: '0 auto',
    },

    backButtonLabel: 'Close',
    backButtonPaths: false,
    getBackButtonPaths: (props) => props.backButtonPaths,
    renderNotFound: (props) => (
      <Page404Wrapper>
        <Page404Title>404</Page404Title>
        <Page404Description>{props.notFoundMessage}</Page404Description>
      </Page404Wrapper>
    ),
  }

  static create(config = {}) {
    const { activity } = config
    if (!activity) {
      throw new Error(`Expected an activity, got: "${activity}"`)
    }
    const staticConfig = super.create(
      config,
      activity === 'create'
        ? ['createConfig']
        : activity === 'edit'
          ? ['editConfig']
          : []
    )
    staticConfig.fields = Admin.compileFromLibrary(staticConfig.fields, true)
    staticConfig.actions = Admin.compileFromLibrary(staticConfig.actions, true)
    let WrappedPage = AntdForm.create()(this)
    let wrappedPageRender = null
    return {
      ...staticConfig,
      render: (props) => {
        const targetUrl = props.loadUrl || props.url
        return activity === 'create' ? (
          props.duplicateLoadUrl &&
          props.searchParams &&
          props.searchParams.duplicate ? (
            <Query
              key={`${props.key}-duplicate`}
              url={
                props.replaceUrlProps
                  ? props.replaceUrlProps(props.duplicateLoadUrl, props, {
                      duplicate: props.searchParams.duplicate,
                    })
                  : props.duplicateLoadUrl
              }
              method={props.duplicateMethod || props.loadMethod}
              // eslint-disable-next-line max-len
              config={props.duplicateRequestConfig || props.loadRequestConfig}
              client={props.client}
              extractData={props.loadExtractData}
            >
              {(queryProps) => {
                if (queryProps.loading) {
                  WrappedPage = AntdForm.create()(this)
                  if (wrappedPageRender) {
                    wrappedPageRender = cloneElement(wrappedPageRender, {
                      loading: queryProps.loading,
                    })
                  }
                } else {
                  wrappedPageRender = (
                    <WrappedPage
                      {...this.getProps(
                        staticConfig,
                        config,
                        props,
                        queryProps
                      )}
                    />
                  )
                }
                return wrappedPageRender
              }}
            </Query>
          ) : (
            <WrappedPage {...this.getProps(staticConfig, config, props)} />
          )
        ) : activity === 'edit' ? (
          <Query
            key={`${props.key}-edit`}
            url={
              props.replaceUrlProps
                ? props.replaceUrlProps(targetUrl, props)
                : targetUrl
            }
            method={props.loadMethod}
            config={props.loadRequestConfig}
            client={props.client}
            extractData={staticConfig.loadExtractData}
          >
            {(queryProps) => {
              if (queryProps.loading) {
                WrappedPage = AntdForm.create()(this)
                if (wrappedPageRender) {
                  wrappedPageRender = cloneElement(wrappedPageRender, {
                    loading: queryProps.loading,
                  })
                }
              } else {
                wrappedPageRender = (
                  <WrappedPage
                    {...this.getProps(staticConfig, config, props, queryProps)}
                  />
                )
              }
              return wrappedPageRender
            }}
          </Query>
        ) : null
      },
    }
  }

  renderForm() {
    return (
      <Form
        key={`form-${this.contentRenderCountRef.current}`}
        {...this.props.getFormProps(this.props)}
        {...this.getStatefullProps()}
      />
    )
  }

  renderTopActions() {
    const actions = this.props.actions.filter(
      (action) => action.section === 'top'
    )
    return actions.length ? (
      <div key="actions-top" className="actions actions-top">
        {actions.map((action) => action.render(this.getStatefullProps()))}
        <Divider />
      </div>
    ) : null
  }

  renderBottomActions() {
    const actions = this.props.actions.filter(
      (action) => action.section === 'bottom'
    )
    return actions.length ? (
      <div key="actions-bottom" className="actions actions-bottom">
        <Divider />
        {actions.map((action) => action.render(this.getStatefullProps()))}
        <Divider />
      </div>
    ) : null
  }

  renderHeaderRight() {
    if (!this.props.isTablet) {
      const backButtonPaths = this.props.getBackButtonPaths(this.props)
      if (backButtonPaths && backButtonPaths.length) {
        return (
          <Link to={compileBackButtonPath(backButtonPaths)}>
            <CloseButton size="default">
              <Icon type="plus" size="default" />
              {this.props.backButtonLabel}
            </CloseButton>
          </Link>
        )
      }
    }
    return super.renderHeaderRight()
  }

  renderAdminHeaderContent() {
    const { props } = this
    const adminHeaderContent = super.renderAdminHeaderContent()
    if (props.isTablet) {
      const backButtonPaths = props.getBackButtonPaths(props)
      if (backButtonPaths) {
        return cloneElement(adminHeaderContent, {
          rightTo: compileBackButtonPath(backButtonPaths),
          rightTilted: true,
          rightProps: { type: 'default' },
        })
      }
    }
    return adminHeaderContent
  }

  renderFound() {
    return [
      this.renderHeader(),
      this.renderTopActions(),
      this.renderForm(),
      this.renderBottomActions(),
    ]
  }
}

Admin.addToLibrary(
  'validation.isRequiredInSinglePageActivity',
  ({ activity, name = 'This field', ...restProps }) =>
    (props) => ({
      required: props.activity === activity,
      message: `${name} is required!`,
      ...restProps,
    })
)

Admin.addToLibrary('PageSingle', (config) => PageSingle.create(config))
