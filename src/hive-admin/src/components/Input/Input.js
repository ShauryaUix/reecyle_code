import React, { forwardRef } from 'react'
import styled, { css } from 'styled-components'

import AntdInput from 'antd/lib/input'

import InputWithPrefixAndSuffix, {
  isValueNotEmpty,
  createStyledInput,
} from './InputWithPrefixAndSuffix'

const InputHTML = ({ prefixWidth, suffixWidth, align, ...props }) => (
  <AntdInput {...props} />
)

const Input = createStyledInput(
  InputHTML,
  ({ value, prefixWidth, suffixWidth, disabled, theme }) => css`
    ${prefixWidth === -1 || prefixWidth === null
      ? null
      : css`
          .ant-input-prefix {
            pointer-events: none;
            ${(disabled || isValueNotEmpty(value)) &&
            css`
              color: ${theme.less.disabledColor};
            `}
          }
          .ant-input {
            padding-left: ${prefixWidth}px !important;
          }
        `}
    ${suffixWidth === -1 || suffixWidth === null
      ? null
      : css`
          .ant-input-suffix {
            pointer-events: none;
            ${disabled &&
            css`
              color: ${theme.less.disabledColor};
            `}
          }
          .ant-input {
            padding-right: ${suffixWidth}px !important;
          }
        `}
  `,
  ({ align }) => css`
    ${align &&
    css`
      text-align: ${align};
    `}
    .ant-input {
      &[disabled],
      &.ant-input-disabled {
        background-color: initial;
      }
    }
  `
)

export class InputComponent extends InputWithPrefixAndSuffix {
  getPrefixOrSuffixExtraWidth() {
    return 22
  }

  render() {
    const { innerRef, ...props } = this.props
    const prefix = this.getPrefixOrSuffixWrapper('prefix')
    const suffix = this.getPrefixOrSuffixWrapper('suffix')
    const { prefixWidth, suffixWidth } = this.state
    return (
      <Input
        {...props}
        ref={innerRef}
        prefix={prefix}
        prefixWidth={prefix ? prefixWidth : null}
        suffix={suffix}
        suffixWidth={suffix ? suffixWidth : null}
      />
    )
  }
}

InputComponent.TextArea = styled(AntdInput.TextArea)`
  ${({ autoSize }) =>
    autoSize &&
    css`
      resize: none;
    `}
`

export default Object.assign(
  forwardRef((props, ref) => <InputComponent {...props} innerRef={ref} />),
  AntdInput,
  InputComponent
)
