/* globals document */

import React from 'react'

import { Link } from 'react-router-dom'

import AntdIcon from 'antd/lib/icon'

import triggerEvent from '../modules/trigger-event'

import Admin from './Admin'
import PageSmallForm from './PageSmallForm'

import './PagePasswordReset.less'

export default class PagePasswordReset extends PageSmallForm {
  static config = {
    ...PageSmallForm.config,
    ClassName: 'PagePasswordReset',

    hideSidebar: true,
    hideHeader: true,

    title: 'Password Reset',
    path: '/password-reset',
    exact: true,
    hidden: true,

    actions: [['ActionPasswordReset']],
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
          onPressEnter: () => {
            const element = document.querySelector(
              '[data-action="password-reset"]'
            )
            if (element) {
              triggerEvent(element, 'click')
            }
          },
        },
      ],
    ],
    renderAfterForm: (props) => (
      <p className="after-form">
        Enter your email address and click the button below to receive a
        password reset email.
        <br />
        <br />
        Know your password? Click <Link to={props.loginPath}>here</Link> to log
        in instead.
      </p>
    ),
  }
}

Admin.addToLibrary('PagePasswordReset', (config) =>
  PagePasswordReset.create(config)
)
