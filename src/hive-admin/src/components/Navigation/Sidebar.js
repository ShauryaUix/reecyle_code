/* global window, document */

import React from 'react'

import AntLayout from 'antd/lib/layout'

import Navigation from './Navigation'

import './Sidebar.less'

export default class Sidebar extends Navigation {
  constructor(props) {
    super(props)
    this.state = this.state || {}
    this.state.navigationOpenKeys = this.props.selected
      ? this.props.selected.root
      : []
  }

  componentDidMount() {
    this.setupGlobalClick()
  }

  componentDidUpdate() {
    this.setupGlobalClick()
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    this.setState({
      navigationOpenKeys: nextProps.selected ? nextProps.selected.root : [],
    })
  }

  setupGlobalClick() {
    clearTimeout(this.setupGlobalClickTimeout)
    this.setupGlobalClickTimeout = setTimeout(
      (didSetupGlobalClick, openSidebar) => {
        if (!didSetupGlobalClick && openSidebar) {
          window.addEventListener('click', this.handleGlobalClick)
          this.didSetupGlobalClick = true
        } else if (didSetupGlobalClick && !openSidebar) {
          window.removeEventListener('click', this.handleGlobalClick)
          this.didSetupGlobalClick = false
        }
      },
      500,
      this.didSetupGlobalClick,
      this.props.openSidebar
    )
  }

  handleGlobalClick = (ev) => {
    const nodeSidebar = document.querySelector('#sidebar')
    let { target } = ev
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!target || target === document.body || target.tagName === 'A') {
        // Clicked sidebar menu item or outside the sidebar, close sidebar and stop
        this.props.toggleSidebarOpen(false)
        break
      } else if (
        target.classList.contains('header-three-bar-icon') ||
        target === nodeSidebar
      ) {
        // Noop click inside sidebar, stop
        break
      } else {
        // Go up the tree and repeat
        target = target.parentNode
      }
    }
  }

  handleMenuItemMouseEnter = () => {
    if (!this.props.expandedSidebar && this.props.isTouch) {
      throw new Error()
    }
  }

  handleNavigationOpenChange = (navigationOpenKeys) => {
    if (navigationOpenKeys.length === 0) {
      this.setState({ navigationOpenKeys: [] })
    } else if (navigationOpenKeys[0] !== 'toggle-sidebar') {
      const lastOpenKey = navigationOpenKeys.find(
        (key) => this.state.navigationOpenKeys.indexOf(key) === -1
      )
      this.setState({ navigationOpenKeys: [lastOpenKey] })
    }
  }

  handleUserClickEvent = (event) => {
    this.props.onViewerAction(event.key)
  }

  render() {
    return (
      <AntLayout.Sider
        id="sidebar"
        key="sidebar"
        trigger={null}
        collapsed={!this.props.expandedSidebar}
        collapsible
      >
        {this.props.renderLogo(this.props)}
        <div className="menus">
          {this.renderNavigationMenu('sidebar')}
          {this.renderViewerMenu('sidebar')}
        </div>
      </AntLayout.Sider>
    )
  }
}
