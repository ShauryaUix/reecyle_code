import React from 'react'
import styled from 'styled-components'

import Icon from 'antd/lib/icon'
import Admin from './Admin'
import ActionWithRequest from './ActionWithRequest'

const IconDelete = styled(Icon)`
  color: ${({ theme }) => theme.less.errorColor} !important;
  i {
    color: ${({ theme }) => theme.less.errorColor} !important;
  }
`
IconDelete.defaultProps = {
  icon: 'delete',
}

export default class ActionDelete extends ActionWithRequest {
  static config = {
    ...ActionWithRequest.config,
    name: 'delete',
    icon: 'delete',
    type: 'danger',
    ghost: true,
    messageWorking: 'Deleting...',
    messageSuccess: 'Deleted!',
    method: 'delete',
    popconfirm: {
      title: 'Permanently remove this item?',
      okButtonProps: { type: 'danger', icon: 'delete' },
      okText: 'Delete',
      cancelButtonProps: {},
      icon: <IconDelete />,
    },
    skip: [
      [
        'condition.check',
        {
          path1: 'data.removed',
          op: '===',
          value2: true,
        },
      ],
    ],
    handleSuccess: (data, props) => {
      if (data && props.deleteRedirectPath) {
        props.history.replace(
          props.replaceUrlProps(props.deleteRedirectPath, props, data)
        )
      }
    },
    getRequestConfig: (props) => ({
      url: props.replaceUrlProps(props.deleteUrl, props),
      method: props.deleteMethod || props.method,
    }),
  }
}

Admin.addToLibrary('ActionDelete', (config) => ActionDelete.create(config))
