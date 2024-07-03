import isString from 'lodash/isString'

import React from 'react'
import styled, { css } from 'styled-components'

import AntdPopover from 'antd/lib/popover'

export const Title = styled.div`
  font-size: 16px;
  line-height: 1;
  text-align: left;
`

export const Header = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`

interface ContentWrapperHTMLProps {
  width?: string
  minWidth?: string
  maxWidth?: string
  spaceout?: boolean
}

const ContentWrapperHTML: React.FC<
  ContentWrapperHTMLProps & React.HTMLAttributes<HTMLDivElement>
> = ({ width, minWidth, maxWidth, spaceout, ...props }) => <div {...props} />

export const ContentWrapper = styled(ContentWrapperHTML)`
  display: flex;
  flex-direction: column;
  ${({ width }) =>
    width &&
    css`
      width: ${width}px;
    `}
  ${({ minWidth }) =>
    minWidth &&
    css`
      min-width: ${minWidth}px;
    `}
  ${({ maxWidth }) =>
    maxWidth &&
    css`
      max-width: ${maxWidth}px;
    `}
  ${({ spaceout }) =>
    spaceout !== false &&
    css`
      > *:not(:first-child) {
        margin-top: 10px;
      }
    `}
`

interface ContentProps extends ContentWrapperHTMLProps {
  title?: string
  actions?: string
  className?: string
  children?: React.ReactNode
}

export function Content({
  width,
  minWidth,
  maxWidth,
  spaceout,
  title,
  actions,
  children,
  className,
}: ContentProps) {
  return (
    <ContentWrapper
      width={width}
      minWidth={minWidth}
      maxWidth={maxWidth}
      spaceout={spaceout}
      className={className}
    >
      <Header>
        {isString(title) ?? <Title>{title}</Title>}
        {actions}
      </Header>
      {children}
    </ContentWrapper>
  )
}

interface PopoverComponentProps
  extends React.ComponentProps<typeof AntdPopover> {
  className?: string
}

export function PopoverComponent({
  className,
  ...props
}: PopoverComponentProps) {
  return <AntdPopover overlayClassName={className} {...props} />
}

const Popover = styled(PopoverComponent)`
  .ant-popover-inner-content {
    padding: 14px 14px;
  }
`
interface TooltipProps {
  title: string
  content?: React.ReactNode
}

export function Tooltip({ title, content, ...props }: TooltipProps) {
  return (
    <Popover
      content={<Content title={title}>{content}</Content>}
      trigger="hover"
      {...props}
    />
  )
}

export default Popover
