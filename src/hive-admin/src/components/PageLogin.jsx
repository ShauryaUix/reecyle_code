/* globals document */

import React from 'react'

import AntdIcon from 'antd/lib/icon'
import { Link } from 'react-router-dom'

import triggerEvent from '../modules/trigger-event'

import Admin from './Admin'
import PageSmallForm from './PageSmallForm'

import './PageLogin.less'

export default class PageLogin extends PageSmallForm {
  static config = {
    ...PageSmallForm.config,
    ClassName: 'PageLogin',

    hideSidebar: true,
    hideHeader: true,

    title: 'Login',
    path: '/login',
    exact: true,
    hidden: true,

    actions: [['ActionLogin']],
    fields: [
      [
        'FieldText',
        {
          name: 'email',
          label: null,
          type: 'email',
          placeholder: 'Email',
          size: 'large',
          prefix: <AntdIcon type="user" style={{ fontSize: 13 }} />,
          autoComplete: 'on',
          rules: [['validation.isRequired']],
        },
      ],
      [
        'FieldText',
        {
          name: 'password',
          label: null,
          placeholder: 'Password',
          type: 'password',
          size: 'large',
          prefix: <AntdIcon type="lock" style={{ fontSize: 13 }} />,
          autoComplete: 'on',
          rules: [['validation.isRequired']],
          onPressEnter: () => {
            const element = document.querySelector('[data-action="login"]')
            if (element) {
              triggerEvent(element, 'click')
            }
          },
        },
      ],
    ],
    renderAfterForm: (props) => (
      <p className="after-form">
        Lost your password? Click <Link to={props.passwordResetPath}>here</Link>{' '}
        to set a new one.
      </p>
    ),
  }
}

Admin.addToLibrary('PageLogin', (config) => PageLogin.create(config))
