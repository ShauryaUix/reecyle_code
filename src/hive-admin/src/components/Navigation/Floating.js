import React from 'react'
import styled from 'styled-components'

import AntButton from 'antd/lib/button'
import AntMenu from 'antd/lib/menu'
import AntDropdown from 'antd/lib/dropdown'

import Navigation from './Navigation'

const DropdownButton = styled(AntButton)`
  position: fixed;
  width: 70px;
  height: 70px;
  font-size: 20px;
  z-index: 10;
  right: 30px;
  bottom: 30px;
  [data-is-tablet='true'] & {
    right: 25px;
    bottom: 25px;
  }
  [data-is-mobile='true'] & {
    right: 15px;
    bottom: 15px;
  }
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  transition:
    opacity 300ms linear,
    transform 300ms cubic-bezier(0.23, 1, 0.32, 1);
  #admin[data-hide-floating='true'] & {
    transform: scale(0.6);
    opacity: 0;
    pointer-events: none !important;
  }
`

export default class Floating extends Navigation {
  handleFloatingVisibleChange = (visible) => {
    this.props.toggleFloatingOpen(!!visible)
  }

  render() {
    return (
      <AntDropdown
        key="floating"
        trigger={['click']}
        align={{ offset: [0, 20] }}
        visible={this.props.openFloating}
        onVisibleChange={this.handleFloatingVisibleChange}
        forceRender
        overlay={
          <AntMenu
            key={
              this.props.openFloating
                ? 'floating-menu-open'
                : 'floating-menu-closed'
            }
            style={{ minWidth: '200px' }}
            onClick={() => this.handleFloatingVisibleChange(false)}
            selectedKeys={[
              ...this.getNavigationMenuSelectedKeys('floating'),
              ...this.getViewerMenuSelectedKeys('floating'),
            ]}
          >
            {this.renderNavigationMenu('floating')}
            <AntMenu.Divider key="menu-divider" />
            {this.renderViewerMenu('floating')}
          </AntMenu>
        }
      >
        <DropdownButton type="primary" shape="circle" icon="menu" />
      </AntDropdown>
    )
  }
}
