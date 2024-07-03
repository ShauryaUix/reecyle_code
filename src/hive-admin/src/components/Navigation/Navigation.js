import isString from 'lodash/isString'

import React, { Component } from 'react'

import AntIcon from 'antd/lib/icon'
import AntMenu from 'antd/lib/menu'
import AntDivider from 'antd/lib/divider'

import { Link } from 'react-router-dom'

export function AntDividerHTML({ expandedSidebar }) {
  return (
    <div style={{ padding: `0px ${expandedSidebar ? 20 : 10}px` }}>
      <AntDivider
        style={{
          margin: expandedSidebar ? '10px 0px 10px' : '5px 0px 5px',
        }}
      />
    </div>
  )
}

export default class Navigation extends Component {
  static __ANT_LAYOUT_SIDER = true

  static defaultProps = {
    selected: null,
    onClick: () => {},
    navigation: [],
    expandedSidebar: true,
    renderLogo: (/* sidebarProps */) => <div className="logo" />,
  }

  renderMenuItem(item) {
    if (item.getHidden({ ...this.props, ...item })) {
      return null
    }
    const icon = isString(item.icon) ? (
      <AntIcon type={item.icon} />
    ) : item.icon ? (
      <item.icon />
    ) : null
    if (item.type === 'GROUP') {
      return item.renderNavigationMenuItem ? (
        item.renderNavigationMenuItem(item, this)
      ) : (
        <AntMenu.SubMenu
          key={item.id}
          title={
            <span>
              {icon}
              <span>{item.label || item.title}</span>
            </span>
          }
        >
          {this.renderMenuItems(item.pages)}
        </AntMenu.SubMenu>
      )
    }
    if (item.type === 'PAGE') {
      return item.renderNavigationMenuItem ? (
        item.renderNavigationMenuItem(item, this)
      ) : (
        <AntMenu.Item
          key={item.id}
          onMouseEnter={this.handleMenuItemMouseEnter}
        >
          <Link to={item.href || item.path}>
            {icon}
            <span>{item.label || item.title}</span>
          </Link>
        </AntMenu.Item>
      )
    }
    return null
  }

  renderMenuItems(items) {
    return items.map((item) => this.renderMenuItem(item))
  }

  getNavigationMenuSelectedKeys(/* target */) {
    const keys = this.props.selected
      ? [this.props.selected.alias || this.props.selected.id]
      : []
    return keys
  }

  renderNavigationMenu(target) {
    const extraProps = {}
    if (target === 'sidebar') {
      extraProps.onOpenChange = this.handleNavigationOpenChange
      if (this.props.expandedSidebar) {
        extraProps.openKeys = this.state.navigationOpenKeys
      }
    }
    return (
      <AntMenu
        key="menu-navigation"
        className="menu-navigation"
        theme="light"
        mode="inline"
        multiple={false}
        selectedKeys={this.getNavigationMenuSelectedKeys(target)}
        {...extraProps}
      >
        {this.renderMenuItems(this.props.navigation)}
      </AntMenu>
    )
  }

  getViewerMenuSelectedKeys(/* target */) {
    const keys =
      (this.props.viewer &&
        this.props.selected &&
        this.props.match &&
        this.props.match.params &&
        this.props.selected.id === '/users/:id' &&
        this.props.match.params.id === this.props.viewer._id) ||
      (this.props.selected && this.props.selected.id === '/users/me')
        ? ['viewer']
        : []
    return keys
  }

  renderViewerMenu(target) {
    if (!this.props.viewer) {
      return null
    }
    const extraProps = {}
    if (target === 'sidebar') {
      //
    }
    return (
      <AntMenu
        key="menu-viewer"
        className="menu-user"
        theme="light"
        mode="inline"
        selectedKeys={this.getViewerMenuSelectedKeys(target)}
        {...extraProps}
      >
        <AntMenu.Item key="viewer">
          <Link to={`/users/${this.props.viewer._id}`}>
            <AntIcon type="user" />
            <span>{this.props.viewer.name}</span>
          </Link>
        </AntMenu.Item>
        <AntMenu.Item
          key="logout"
          onClick={(event) => this.props.onViewerAction(event.key)}
        >
          <AntIcon type="poweroff" />
          <span>Logout</span>
        </AntMenu.Item>
        {target !== 'sidebar' || this.props.isTablet
          ? null
          : [
              <AntDividerHTML
                key="toggle-sidebar-divider-before"
                expandedSidebar={this.props.expandedSidebar}
              />,
              <AntMenu.Item
                key="toggle-sidebar-expanded"
                onClick={this.props.toggleSidebarExpanded}
              >
                <AntIcon type={this.props.expandedSidebar ? 'left' : 'right'} />
                <span>
                  {this.props.expandedSidebar ? 'Collapse' : 'Expand'}
                </span>
              </AntMenu.Item>,
              <div
                key="toggle-sidebar-space-after"
                style={{ height: this.expanded ? '10px' : '5px' }}
              />,
            ]}
      </AntMenu>
    )
  }

  render() {
    return null
  }
}
