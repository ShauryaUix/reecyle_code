import isString from 'lodash/isString'

import React from 'react'
import styled from 'styled-components'
import Icon from 'antd/lib/icon'

import Admin from './Admin'
import Field from './Field'

const Title = styled.h1`
  margin: 0px;
  padding: 0px;
  margin-bottom: -10px;
  text-align: left;
  font-size: 26px;
  font-weight: 600;
  line-height: 100%;
  > .field-title-text {
    color: ${({ theme }) => theme.less.textColor};
    opacity: 0.85;
    padding-left: 0px;
  }
`

Admin.addToLibrary(
  'FieldTitle',
  ({
    title = null,
    icon = null,
    style = undefined,
    textStyle = undefined,
    ...config
  } = {}) =>
    Field.create({
      name: title || `${Math.floor(Math.random() * 1000000)}`,
      label: null,
      virtual: true,
      Component: () => (
        <Title style={style}>
          {isString(icon) ? <Icon type={icon} /> : icon}
          {title ? (
            <>
              {' '}
              <span style={textStyle} className="field-title-text">
                {title}
              </span>
            </>
          ) : null}
        </Title>
      ),
      ...config,
    })
)
