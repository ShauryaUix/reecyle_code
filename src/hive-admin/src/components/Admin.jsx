import React, { Component, createRef } from 'react'
import ReactGA from 'react-ga'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isArray from 'lodash/isArray'
import isUndefined from 'lodash/isUndefined'
import isFunction from 'lodash/isFunction'
import getKey from 'lodash/get'
import {
  BrowserRouter,
  Redirect,
  withRouter,
  matchPath,
} from 'react-router-dom'

import { parse as parseQuery } from 'query-string'

import { withMedia } from 'react-with-media'

import AntLayout from 'antd/lib/layout'
import message from 'antd/lib/message'

import './Admin.less'

import mix from '../modules/mix'
import Configurable from './Mixins/Configurable'

import { create as createStorage } from '../modules/storage'
import { create as createLoader } from '../modules/loader'
import { create as createClient } from '../modules/client'

import Viewer from './Viewer'
import Header from './Header'
import { Sidebar, Floating } from './Navigation'

if (process.env.ENV_GA_TRACKING_CODE_ADMIN) {
  ReactGA.initialize(process.env.ENV_GA_TRACKING_CODE_ADMIN)
  ReactGA.INITIALIZED = true
}

export const ADMIN_CONFIG_KEY = '__ADMIN_CONFIG__'

export default class Admin extends mix(Component, Configurable) {
  static library = {}

  static addToLibrary(name, item) {
    if (!isString(name)) {
      throw new Error(
        `Expected a string for a library item name, got "${name}"`
      )
    } else if (this.library[name]) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(`Library item overriden: "${name}"`)
      }
    }
    this.library[name] = item
    return this
  }

  static getFromLibrary(name) {
    return this.library[name]
  }

  static createFromLibrary(name, ...args) {
    if (!this.library[name]) {
      throw new Error(`Library item "${name}" not found`)
    }
    return this.library[name](...args)
  }

  static compileFromLibrary(subject, many = false) {
    if (isArray(subject)) {
      if (many) {
        return subject.map((item) => this.compileFromLibrary(item, false))
      }
      if (isFunction(subject[0])) {
        return subject[0](...subject.slice(1))
      }
      return this.createFromLibrary(subject[0], ...subject.slice(1))
    }
    return subject
  }

  static test(
    tests = [],
    props = {},
    any = true,
    positive = true,
    defaultResult
  ) {
    return !tests.length && !isUndefined(defaultResult)
      ? defaultResult
      : any
        ? tests.findIndex((test) =>
            positive ? !!test(props) : !test(props)
          ) !== -1
        : tests.filter((test) => (positive ? !!test(props) : !test(props)))
            .length === tests.length
  }

  static testDisabled(props) {
    return isArray(props.disabled)
      ? this.test(
          props.disabled || [],
          props,
          props.disabledMode === 'any',
          true
        )
      : !!props.disabled
  }

  static testVirtual(props) {
    return isArray(props.virtual)
      ? this.test(props.virtual || [], props, props.virtualMode === 'any', true)
      : !!props.virtual
  }

  static parseStructure(navigation = [], props = {}, pages = [], root = []) {
    return navigation.reduce((items, item, i) => {
      if (!item.getSkip || !item.getSkip({ ...props, ...item })) {
        item = { ...item }
        item.id = item.path || `group${i}`
        item.root = root
        if (item.path) {
          item.type = 'PAGE'
          pages.push(item)
          items.push(item)
        }
        if (item.pages) {
          item.type = 'GROUP'
          item.pages = this.parseStructure(item.pages, props, pages, [
            ...root,
            item.id,
          ])
          if (item.pages.length) {
            items.push(item)
          }
        }
      }
      return items
    }, [])
  }

  static prettify(string) {
    return `${string}`
      .replace(/([A-Z])|\.([a-z])/g, ' $1')
      .replace(/[_-]/g, '')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/Id/g, 'ID')
  }

  static config = {
    base: '/admin',
    titlePrefix: 'Admin | ',
    viewerUrl: '/users/me',
    viewerEditUrl: '/users/me',
    loginPath: '/login',
    passwordSetUrl: '/users/actions/password-set',
    passwordResetUrl: '/users/actions/password-reset',
    passwordResetPath: '/password-reset',
    accountActivationUrl: '/users/actions/activate',
    accountActivationPath: '/activate',
    authorizeUrl: '/access-tokens',
    validateViewer: (viewer) => Promise.resolve(viewer),
    replaceUrlProps: (url, props, data) =>
      `${url}`.replace(/:([^/]+)/g, (all, path) =>
        data ? getKey(data, path) : getKey(props, `match.params.${path}`)
      ),
    structure: [],
    pages: [],
    navigation: [],
    sidebarProps: {},
    headerProps: {},
  }

  static create(config) {
    config = this.getConfig(config)
    const {
      structure = [],
      storage: customStorage,
      storageConfig = {},
      client: customClient,
      clientConfig = {},
      loader: customLoader,
      loaderConfig = {},
      ...restConfig
    } = config
    const storage =
      customStorage ||
      createStorage({
        ...storageConfig,
      })
    const loader =
      customLoader ||
      createLoader({
        ...loaderConfig,
      })
    const client =
      customClient ||
      createClient({
        baseURL: config.restBase,
        loader,
        storage,
        ...clientConfig,
      })
    restConfig.storage = storage
    restConfig.loader = loader
    restConfig.client = client
    const compiledStructure = this.compileFromLibrary(structure, true)
    const AdminWithMediaQuery = [
      ['(max-width: 768px)', 'isTablet'],
      ['(max-width: 425px)', 'isMobile'],
      ['(hover: none) and (pointer: coarse)', 'isTouch'],
      ['(min-width: 0px)', 'isSizeXS'],
      ['(min-width: 576px)', 'isSizeSM'],
      ['(min-width: 768px)', 'isSizeMD'],
      ['(min-width: 992px)', 'isSizeLG'],
      ['(min-width: 1200px)', 'isSizeXL'],
      ['(min-width: 1600px)', 'isSizeXXL'],
    ].reduce((agr, [query, name]) => withMedia(query, { name })(agr), this)
    const AdminWithRouter = withRouter((props) => {
      let match = null
      const page = props.pages.find((testPage) => {
        match = matchPath(props.location.pathname, {
          path: testPage.path || '*',
          exact: !!testPage.exact,
          strict: !!testPage.strict,
        })
        return !!match
      })
      return (
        <AdminWithMediaQuery
          key="admin"
          {...props}
          pathname={props.location.pathname}
          search={props.location.search}
          searchParams={parseQuery(props.location.search)}
          page={page}
          match={match}
        />
      )
    })
    const ViewerClass = config.Viewer || Viewer
    return (
      <BrowserRouter basename={config.base}>
        <ViewerClass
          client={client}
          viewerUrl={config.viewerUrl}
          viewerEditUrl={config.viewerEditUrl}
          authorizeUrl={config.authorizeUrl}
          validateViewer={config.validateViewer}
        >
          {(viewerProps) => {
            const pages = []
            const navigation = this.parseStructure(
              compiledStructure,
              { ...viewerProps, ...config },
              pages
            )
            return (
              <AdminWithRouter
                {...restConfig}
                pages={pages}
                navigation={navigation}
                {...viewerProps}
              />
            )
          }}
        </ViewerClass>
      </BrowserRouter>
    )
  }

  static showMessage = (text, type = 'success', duration = 2) =>
    message[type](text, duration)

  static dismissMessages = () => {
    message.destroy()
    return this
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.state.sidebarExpanded = true
    try {
      const state = this.props.storage.getItem(ADMIN_CONFIG_KEY)
      if (state) {
        Object.assign(this.state, state)
      }
    } catch (error) {
      //
    }
    this.state.sidebarOpen = false
    this.state.floatingOpen = false
    this.pageRef = createRef()
    this.headerRef = createRef()
    this.sidebarRef = createRef()
    this.floatingRef = createRef()
    this.mainRef = createRef()
  }

  componentDidUpdate(/* props */) {
    // if (this.state.floatingOpen || this.state.sidebarOpen) {
    //   const newPageId = getKey(this.props, 'page.id');
    //   const oldPageId = getKey(props, 'page.id');
    //   if (newPageId !== oldPageId) {
    //     this.setState({
    //       floatingOpen: false,
    //       sidebarOpen: false,
    //     });
    //     return this.props.storage.setItem(ADMIN_CONFIG_KEY, {
    //       ...this.state,
    //       floatingOpen: false,
    //       sidebarOpen: false,
    //     });
    //   }
    // }
    return this.props.storage.setItem(ADMIN_CONFIG_KEY, { ...this.state })
  }

  toggleSidebarExpanded = (value) =>
    this.setState((state) => ({
      sidebarExpanded:
        value === true
          ? true
          : value === false
            ? false
            : !state.sidebarExpanded,
    }))

  toggleSidebarOpen = (value) =>
    this.setState((state) => ({
      sidebarOpen:
        value === true ? true : value === false ? false : !state.sidebarOpen,
    }))

  toggleFloatingOpen = (value) =>
    this.setState((state) => ({
      floatingOpen:
        value === true ? true : value === false ? false : !state.floatingOpen,
    }))

  goToPage = (id) => {
    const page = this.props.pages.find((test) => test.id === id)
    if (page) {
      this.props.history.push(page.href || page.path)
    }
  }

  goToUrl = (url) => {
    this.props.history.push(url)
  }

  handleViewerAction = (action) => {
    switch (action) {
      case 'logout':
        this.props.unauthorize()
        break
      default:
    }
  }

  renderHeader(headerProps = {}) {
    const HeaderClass = this.props.Header || Header
    return (
      <HeaderClass
        key="header"
        ref={this.headerRef}
        viewer={this.props.viewer}
        onToggleSidebarExpanded={this.toggleSidebarExpanded}
        onToggleSidebarOpen={this.toggleSidebarOpen}
        onToggleFloatingOpen={this.toggleFloatingOpen}
        onViewerAction={this.handleViewerAction}
        {...(this.props.headerProps || {})}
        {...headerProps}
      />
    )
  }

  renderSidebar(sidebarProps = {}) {
    const SidebarClass = this.props.Sidebar || Sidebar
    return (
      <SidebarClass
        {...this.props}
        key="sidebar"
        ref={this.sidebarRef}
        selected={this.props.page}
        navigation={this.props.navigation}
        viewer={this.props.viewer}
        match={this.props.match}
        {...(this.props.sidebarProps || {})}
        {...sidebarProps}
      />
    )
  }

  renderFloating(floatingProps = {}) {
    const FloatingClass = this.props.Floating || Floating
    return (
      <FloatingClass
        {...this.props}
        key="floating"
        ref={this.floatingRef}
        selected={this.props.page}
        navigation={this.props.navigation}
        viewer={this.props.viewer}
        match={this.props.match}
        {...(this.props.floatingProps || {})}
        {...floatingProps}
      />
    )
  }

  renderContent(extraProps = {}) {
    const { page } = this.props
    if (!page) {
      return null
    }
    const destination = page.getRedirect({ ...this.props, ...page })
    const state = { from: this.props.location }
    if (isObject(destination)) {
      return (
        <Redirect
          key="content"
          to={Object.assign(destination, {
            state: Object.assign(state, destination.state || {}),
          })}
        />
      )
    }
    if (isString(destination)) {
      return <Redirect key="content" to={{ pathname: destination, state }} />
    }
    const { render, type, getSkip, skip, ...restConfig } = page
    return page.render({
      ...this.props,
      key: page.path,
      ...restConfig,
      ...extraProps,
    })
  }

  renderBody(extraProps = {}) {
    return (
      <section id="main" className="ant-layout" ref={this.mainRef}>
        {this.props.isInitializing ? null : this.renderContent(extraProps)}
      </section>
    )
  }

  render() {
    const { viewer, page, isTablet, isMobile, isTouch } = this.props
    const { sidebarExpanded, sidebarOpen, floatingOpen } = this.state
    const pageWithProps = { ...this.props, ...page }
    const hideSidebar =
      !viewer || !page ? true : !!page.getHideSidebar(pageWithProps)
    const hideHeader =
      !viewer || !page ? true : !!page.getHideHeader(pageWithProps)
    const hideFloating =
      !viewer || !page ? true : !!page.getHideFloating(pageWithProps)
    const expandedSidebar = isTablet ? true : !!sidebarExpanded
    const openSidebar = hideSidebar || !isTablet ? false : !!sidebarOpen
    const openFloating = hideFloating ? false : !!floatingOpen
    if (ReactGA.INITIALIZED) {
      const newPathname = `${this.props.location.pathname}${
        this.props.location.search
      }`
      if (viewer) {
        ReactGA.set({ userId: viewer._id })
      }
      if (this.currentPathname !== newPathname) {
        ReactGA.pageview(newPathname)
        this.currentPathname = newPathname
      }
    }
    const extraProps = {
      isMobile,
      isTablet,
      isTouch,
      hideHeader,
      hideSidebar,
      hideFloating,
      expandedSidebar,
      openSidebar,
      openFloating,
      onViewerAction: this.handleViewerAction,
      toggleSidebarExpanded: this.toggleSidebarExpanded,
      toggleSidebarOpen: this.toggleSidebarOpen,
      toggleFloatingOpen: this.toggleFloatingOpen,
      adminPageRef: this.pageRef,
      adminHeaderRef: this.headerRef,
      adminSidebarRef: this.sidebarRef,
      adminFloatingRef: this.floatingRef,
      adminMainRef: this.mainRef,
    }
    return (
      <>
        <AntLayout
          key="admin"
          id="admin"
          data-is-mobile={isMobile}
          data-is-tablet={isTablet}
          data-page-path={page.path}
          data-is-touch={isTouch}
          data-hide-header={hideHeader}
          data-hide-sidebar={hideSidebar}
          data-hide-floating={hideFloating}
          data-expanded-sidebar={expandedSidebar}
          data-open-sidebar={openSidebar}
          data-open-floating={openFloating}
        >
          {this.renderSidebar(extraProps)}
          {this.renderFloating(extraProps)}
          {this.renderBody(extraProps)}
          {this.renderHeader(extraProps)}
        </AntLayout>
        <div
          key="admin-line-loader"
          id="admin-line-loader"
          ref={this.props.loader.ref}
        />
      </>
    )
  }
}
