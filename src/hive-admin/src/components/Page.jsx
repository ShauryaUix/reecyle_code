/* global navigator */

import React, { Component, createRef, useEffect } from 'react'
import styled, { useTheme } from 'styled-components'
import {
  motion,
  transform as motionTransform,
  // useElementScroll,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'

import DocumentTitle from 'react-document-title'
import isArray from 'lodash/isArray'
import getKey from 'lodash/get'

import AntIcon from 'antd/lib/icon'

import Admin from './Admin'
import { HeaderContent } from './Header'

import mix from '../modules/mix'
import Configurable from './Mixins/Configurable'
import SuperProps from './Mixins/SuperProps'

import './Page.less'

export const PullToRefreshWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: calc(15px + env(safe-area-inset-top));
  left: 50%;
  margin-left: -25px;
  width: 50px;
  height: 50px;
  pointer-events: none;
  background: white;
  box-shadow: 0 0 30px rgb(0, 0, 0, 0.1);
  border-radius: 25px;
  z-index: 999999999999;
`

export const PullToRefreshIcon = styled(AntIcon)`
  font-size: 24px;
`

export function PullToRefresh({ threshold, onThreshold, scrollRef }) {
  const theme = useTheme()
  const drag = useMotionValue(0)
  const scroll = useSpring(drag, { mass: 0.2 })
  const touchingFlag = useMotionValue(0)
  const touchingSpring = useSpring(touchingFlag, { mass: 0.3 })
  const thresholdFlag = useTransform([drag], ([value]) =>
    value > threshold ? 1 : 0
  )
  const thresholdSpring = useSpring(thresholdFlag, { mass: 0.2 })
  const scale = useTransform([touchingSpring], ([valueTouching]) =>
    motionTransform(valueTouching, [0, 1], [0.2, 1])
  )
  const rotate = useTransform(
    [scroll, thresholdSpring],
    ([valueScroll, valueThresholdReached]) =>
      motionTransform(valueScroll, [0, threshold], [0, 180], {
        clamp: false,
      }) +
      valueThresholdReached * 90
  )
  const opacity = useTransform(
    [scroll, touchingSpring],
    ([valueScroll, valueTouching]) =>
      Math.max(
        0,
        motionTransform(valueScroll, [0, threshold], [0, 1]) -
          (1 - valueTouching)
      )
  )
  const color = useTransform([thresholdSpring], ([valueThreshold]) =>
    motionTransform(
      valueThreshold,
      [0, 1],
      [theme.less.textColor, theme.less.primaryColor]
    )
  )
  useEffect(
    () => {
      let yStart = null
      let yDelta = null
      const { current } = scrollRef
      if (current) {
        const cbStart = (event) => {
          if (current.scrollTop === 0) {
            touchingFlag.set(1)
            thresholdFlag.set(0)
            yStart = event.touches[0].screenY
          }
        }
        const cbMove = (event) => {
          if (yStart !== null) {
            const yDeltaNew = Math.max(
              0,
              (yStart - event.touches[0].screenY) * -1
            )
            drag.set(yDeltaNew)
            if (yDeltaNew >= threshold && yDelta < threshold) {
              try {
                navigator.vibrate([1])
              } catch (error) {
                // alert(error.message);
              }
            }
            yDelta = yDeltaNew
          }
        }
        const cbEnd = () => {
          touchingFlag.set(0)
          if (yDelta >= threshold) {
            onThreshold()
          }
          yDelta = null
          drag.set(0)
        }
        current.addEventListener('touchstart', cbStart)
        current.addEventListener('touchmove', cbMove)
        current.addEventListener('touchend', cbEnd)
        return () => {
          current.removeEventListener('touchstart', cbStart)
          current.removeEventListener('touchmove', cbMove)
          current.removeEventListener('touchend', cbEnd)
        }
      }
      return undefined
    },
    // eslint-disable-next-line
    [threshold, scrollRef, onThreshold]
  )
  return (
    <PullToRefreshWrapper style={{ rotate, scale, opacity, color }}>
      <PullToRefreshIcon type="reload" />
    </PullToRefreshWrapper>
  )
}

PullToRefresh.defaultProps = {
  threshold: 200,
  onThreshold: () => {},
}

export default class Page extends mix(Component, Configurable, SuperProps) {
  static config = {
    ClassName: 'Page',
    isNotFound: () => false,
    renderNotFound: (props) => <h1>{props.notFoundMessage}</h1>,
    notFoundMessage: 'Content Not Found',
    headerTitleKey: 'name',
    LayoutComponent: 'main',
    PullToRefreshComponent: PullToRefresh,
    redirect: [],
    pullToRefreshThreshold: 250,
    pullToRefreshCallback: (props) => props.reload && props.reload(),
    getRedirect: (props) => {
      for (let i = 0; i < props.redirect.length; i++) {
        const redirect = props.redirect[i](props)
        if (redirect) {
          return redirect
        }
      }
      return undefined
    },
    skip: [],
    getSkip: (props) => Admin.test(props.skip || [], props, true, true),
    getHidden: (props) =>
      props.hidden === true ||
      Admin.test(props.hidden || [], props, true, true),
    hideSidebar: false,
    getHideSidebar: (props) =>
      props.hideSidebar === true ||
      Admin.test(props.hideSidebar || [], props, true, true),
    hideHeader: false,
    getHideHeader: (props) =>
      props.hideHeader === true ||
      Admin.test(props.hideHeader || [], props, true, true),
    hideFloating: true,
    getHideFloating: (props) =>
      props.hideFloating === true ||
      Admin.test(props.hideFloating || [], props, true, true),
    renderHeaderTitle: (props) => {
      if (props.form) {
        const formValue = props.form.getFieldValue(props.headerTitleKey)
        if (formValue) {
          return `${formValue}`
        }
      }
      if (props.data) {
        const dataValue = getKey(props.data, props.headerTitleKey)
        if (dataValue) {
          return `${dataValue}`
        }
      }
      return props.headerTitle || props.title
    },
    renderHeaderDescription: (props) => props.headerDescription || null,
    renderHeaderRight: () => null,
    style: {},
  }

  static create(config, keys = []) {
    const staticConfig = this.getConfig(config, keys)
    staticConfig.redirect = Admin.compileFromLibrary(
      staticConfig.redirect,
      true
    )
    staticConfig.skip = Admin.compileFromLibrary(staticConfig.skip, true)
    staticConfig.hidden = isArray(staticConfig.hidden)
      ? Admin.compileFromLibrary(staticConfig.hidden, true)
      : staticConfig.hidden
    staticConfig.hideSidebar = isArray(staticConfig.hideSidebar)
      ? Admin.compileFromLibrary(staticConfig.hideSidebar, true)
      : !!staticConfig.hideSidebar
    staticConfig.hideHeader = isArray(staticConfig.hideHeader)
      ? Admin.compileFromLibrary(staticConfig.hideHeader, true)
      : !!staticConfig.hideHeader
    staticConfig.hideFloating = isArray(staticConfig.hideFloating)
      ? Admin.compileFromLibrary(staticConfig.hideFloating, true)
      : !!staticConfig.hideFloating
    staticConfig.render = (props) => {
      const PageComponent = this
      return (
        <PageComponent
          // eslint-disable-next-line react/no-this-in-sfc
          {...this.getProps(staticConfig, config, props)}
        />
      )
    }
    return staticConfig
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.state.loading = false
    this.layoutRef = createRef()
    this.contentRenderRef = createRef()
    this.contentRenderCountRef = createRef(0)
  }

  componentDidMount() {
    this.mounted = true
    this.unmounted = false
    if (this.props.adminPageRef) {
      this.props.adminPageRef.current = this
    }
  }

  componentWillUnmount() {
    this.mounted = false
    this.unmounted = true
    if (this.props.adminPageRef && this.props.adminPageRef.current === this) {
      this.props.adminPageRef.current = undefined
    }
  }

  getStatefullProps(...args) {
    return {
      ...super.getStatefullProps(...args),
      pageRef: this,
    }
  }

  getPageTitle() {
    return `${this.state.title || this.props.title}`
  }

  getDocumentTitle() {
    return `${this.props.titlePrefix}${this.getPageTitle()}`
  }

  isLoading() {
    return this.state.loading || this.props.loading
  }

  setLoading(loading = false) {
    this.setState({ loading })
  }

  renderHeaderTitle() {
    return (
      <h1 key="page-header-title" className="page-header-title">
        {this.props.renderHeaderTitle(this.props)}
      </h1>
    )
  }

  renderHeaderDescription() {
    const description = this.props.renderHeaderDescription(this.props)
    if (!description) {
      return null
    }
    return (
      <p key="page-header-description" className="page-header-description">
        {this.props.renderHeaderDescription(this.props)}
      </p>
    )
  }

  renderHeaderRight() {
    return this.props.renderHeaderRight(this.props)
  }

  renderHeader() {
    return (
      <div key="page-header" className="page-header">
        <div className="page-header-left">
          {this.renderHeaderTitle()}
          {this.renderHeaderDescription()}
        </div>
        <div className="page-header-right">{this.renderHeaderRight()}</div>
      </div>
    )
  }

  renderLoader() {
    // eslint-disable-line class-methods-use-this
    return null
  }

  renderFound() {
    // eslint-disable-line class-methods-use-this
    return <h1>Content</h1>
  }

  renderDocumentTitle() {
    return (
      <DocumentTitle key="document-title" title={this.getDocumentTitle()} />
    )
  }

  renderPullToRefresh() {
    const { PullToRefreshComponent } = this.props
    return (
      <PullToRefreshComponent
        scrollRef={this.props.adminMainRef}
        threshold={this.props.pullToRefreshThreshold}
        onThreshold={() => this.props.pullToRefreshCallback(this.props)}
      />
    )
  }

  renderContent() {
    return (
      <div
        data-component={this.props.ClassName}
        // data-page-path={this.props.path}
        style={this.props.style}
      >
        {this.renderPullToRefresh()}
        {this.props.data
          ? this.renderFound()
          : this.isLoading()
            ? this.renderLoader()
            : this.props.isNotFound(this.props)
              ? this.props.renderNotFound(this.props)
              : this.renderFound()}
      </div>
    )
  }

  renderAdminHeaderContent() {
    return (
      <HeaderContent
        headerRef={this.props.adminHeaderRef}
        toggleSidebarOpen={this.props.toggleSidebarOpen}
        title={this.getPageTitle()}
      />
    )
  }

  renderWrapper() {
    const { LayoutComponent } = this.props
    const content = this.renderContent()
    const loading = this.isLoading()
    if (!loading) {
      this.contentRenderRef.current = content
    } else {
      this.contentRenderCountRef.current += 1
    }

    return (
      <>
        {this.renderAdminHeaderContent()}
        <LayoutComponent
          key="content"
          ref={this.contentRef}
          id="content"
          className="ant-layout-content"
          data-loading={!!loading}
        >
          {this.renderDocumentTitle()}
          {this.renderContent()}
        </LayoutComponent>
      </>
    )
  }

  render() {
    return this.renderWrapper()
  }
}

Admin.addToLibrary('Page', (config) => Page.create(config))
