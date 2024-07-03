/* globals document */

import React from 'react'

import AntdIcon from 'antd/lib/icon'

import triggerEvent from '../modules/trigger-event'

import Admin from './Admin'
import PageSmallForm from './PageSmallForm'

import './PagePasswordSet.less'

export default class PagePasswordSet extends PageSmallForm {
  static config = {
    ...PageSmallForm.config,
    ClassName: 'PagePasswordSet',

    hideSidebar: true,
    hideHeader: true,

    title: 'Set New Password',
    path: '/password',
    exact: true,
    hidden: true,

    actions: [['ActionPasswordSet']],
    fields: [
      [
        'FieldText',
        {
          name: 'password',
          label: null,
          placeholder: 'Password',
          type: 'password',
          size: 'large',
          prefix: <AntdIcon type="lock" style={{ fontSize: 13 }} />,
          autoComplete: 'new-password',
          rules: [['validation.isRequired'], ['validation.isPassword']],
        },
      ],
      [
        'FieldText',
        {
          name: 'confirmPassword',
          label: null,
          placeholder: 'Repeat Password',
          type: 'password',
          size: 'large',
          prefix: <AntdIcon type="lock" style={{ fontSize: 13 }} />,
          autoComplete: 'new-password',
          rules: [['validation.isRequired'], ['validation.isPasswordSame']],
          onPressEnter: () => {
            const element = document.querySelector(
              '[data-action="password-set"]'
            )
            if (element) {
              triggerEvent(element, 'click')
            }
          },
          virtual: true,
        },
      ],
    ],
    renderAfterForm: (/* props */) => (
      <p className="after-form">
        Set a new password. Make sure it&apos;s strong and memorable.
      </p>
    ),
  }
}

Admin.addToLibrary('PagePasswordSet', (config) =>
  PagePasswordSet.create(config)
)
