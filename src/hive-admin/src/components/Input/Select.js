import React, { forwardRef } from 'react'
import styled, { css } from 'styled-components'

import AntdSelect from 'antd/lib/select'

import InputWithPrefixAndSuffix, {
  createStyledInput,
} from './InputWithPrefixAndSuffix'

const InputHTML = ({ prefix, prefixWidth, suffix, suffixWidth, ...props }) => (
  <AntdSelect {...props} />
)

const Input = createStyledInput(
  InputHTML,
  ({ prefixWidth, suffixWidth }) => {
    const hasPrefix = !(prefixWidth === -1 || prefixWidth === null)
    const hasSuffix = !(suffixWidth === -1 || suffixWidth === null)
    return css`
      .ant-select-selection__rendered {
        display: flex;
        margin-left: 13px;
        ${!hasPrefix
          ? null
          : css`
              .ant-select-selection__placeholder,
              .ant-select-search__field__placeholder {
                padding-left: ${prefixWidth}px;
              }
              .ant-select-search.ant-select-search--inline {
                &:not(li) {
                  padding-left: ${prefixWidth}px;
                }
              }
              &:before {
                content: '|';
                display: flex;
                flex-shrink: 0;
                width: ${prefixWidth}px;
                opacity: 0;
                pointer-events: none;
              }
            `}
        ${!hasSuffix
          ? null
          : css`
              .ant-select-selection__placeholder,
              .ant-select-search__field__placeholder {
                padding-right: ${suffixWidth}px;
              }
              .ant-select-search.ant-select-search--inline {
                margin-top: -9px;
                &:not(li) {
                  padding-right: ${suffixWidth}px;
                }
              }
              &:after {
                content: '|';
                display: flex;
                flex-shrink: 0;
                width: ${suffixWidth}px;
                opacity: 0;
                pointer-events: none;
              }
            `}
        ${!hasPrefix && !hasSuffix
          ? null
          : css`
              > ul {
                margin-bottom: 3px;
              }
            `}
      }
    `
  },
  ({ disabled }) => css`
    .ant-select-selection--multiple .ant-select-selection__rendered {
      margin-left: 10px;
      margin-bottom: 0px;
      &:after {
        display: none;
      }
      > ul {
        overflow: hidden;
      }
    }
    .ant-select-selection__rendered {
      .ant-select-selection-selected-value {
        margin-top: 1px;
      }
      .ant-select-selection__placeholder,
      .ant-select-search__field__placeholder {
        margin-top: -9px;
      }
      .ant-select-selection__placeholder {
        margin-left: 0px;
      }
    }
    ${disabled &&
    css`
      &.ant-select-disabled {
        .ant-select-selection {
          background: initial;
          .ant-select-selection-selected-value {
            user-select: text;
          }
        }
      }
    `}
  `
)

const PrefixWrapper = styled.span`
  position: absolute;
  top: 0px;
  left: 11px;
  pointer-events: none;
`

const SuffixWrapper = styled.span`
  position: absolute;
  top: 0px;
  right: 11px;
  pointer-events: none;
`

export class InputComponent extends InputWithPrefixAndSuffix {
  getPrefixOrSuffixExtraWidth() {
    return 8
  }

  render() {
    const {
      innerRef,
      suffix: suffixInput,
      prefix: prefixInput,
      ...props
    } = this.props
    const prefix = this.getPrefixOrSuffixWrapper('prefix', PrefixWrapper)
    const suffix = this.getPrefixOrSuffixWrapper('suffix', SuffixWrapper)
    const { prefixWidth, suffixWidth } = this.state
    return (
      <>
        <Input
          ref={innerRef}
          {...props}
          key={props.name}
          {...props}
          prefix={prefixInput}
          prefixWidth={prefix ? prefixWidth : null}
          suffix={suffixInput}
          suffixWidth={suffix ? suffixWidth : null}
        />
        {prefix || null}
        {suffix || null}
      </>
    )
  }
}

export default Object.assign(
  forwardRef((props, ref) => <InputComponent {...props} innerRef={ref} />),
  AntdSelect,
  InputComponent
)
