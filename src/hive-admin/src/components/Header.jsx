import React, { PureComponent, useEffect } from 'react'
import styled, { css } from 'styled-components'

import { Link } from 'react-router-dom'

import AntdIcon from 'antd/lib/icon'
import AntdButton from 'antd/lib/button'

import './Header.less'

export default class Header extends PureComponent {
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      content: null,
    }
  }

  setContent(content = null) {
    this.setState({ content })
  }

  render() {
    return (
      <div key="header" id="header">
        {this.state.content}
      </div>
    )
  }
}

export function HeaderPart({ name, children }) {
  return (
    <div className={`header-part header-part-${name}`}>{children || null}</div>
  )
}

export const HeaderThreeBarIconComponent = styled(AntdIcon)`
  transition:
    margin-left 300ms cubic-bezier(0.23, 1, 0.32, 1),
    opacity 300ms linear,
    color 200ms linear !important;
  margin-left: 0px;
  #admin[data-hide-sidebar='true'] & {
    margin-left: -60px;
    opacity: 0;
    pointer-events: none;
  }
`

export function HeaderThreeBarIcon({ onClick }) {
  return (
    <HeaderThreeBarIconComponent
      type="menu"
      className="header-three-bar-icon"
      onClick={onClick}
    />
  )
}

export function HeaderTitle({ children }) {
  return <div className="header-title">{children}</div>
}

function HeaderActionHTML({ to, tilted, ...props }) {
  return (
    <Link to={to}>
      <AntdButton icon="plus" type="primary" size="default" {...props} />
    </Link>
  )
}

export const HeaderAction = styled(HeaderActionHTML)`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  padding-right: 8px;
  padding-left: 8px;
  padding-bottom: 8px;
  padding-top: 8px;
  width: auto;
  height: auto;
  pointer-events: none;
  > i {
    line-height: 0 !important;
    transition: transform 200ms cubic-bezier(0.25, 1, 0.5, 1) !important;
    ${({ tilted }) =>
      tilted &&
      css`
        transform: rotate(45deg);
      `}
  }
`

export function HeaderContent({
  title,
  toggleSidebarOpen,
  headerRef,
  right = null,
  rightTo,
  rightIcon = 'plus',
  rightTilted = false,
  rightProps,
}) {
  const content = (
    <>
      <HeaderPart name="left">
        <HeaderThreeBarIcon onClick={toggleSidebarOpen} />
        <HeaderTitle>{title}</HeaderTitle>
      </HeaderPart>
      <HeaderPart name="right">
        {right ? (
          right
        ) : rightTo || rightProps ? (
          <HeaderAction
            to={rightTo}
            icon={rightIcon}
            tilted={rightTilted}
            {...(rightProps || {})}
          />
        ) : null}
      </HeaderPart>
    </>
  )
  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.setContent(content)
    }
  })
  return null
}
