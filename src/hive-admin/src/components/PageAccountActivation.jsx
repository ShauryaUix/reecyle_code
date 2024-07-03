/* globals document */

import React from 'react'

import AntdIcon from 'antd/lib/icon'

import triggerEvent from '../modules/trigger-event'

import Admin from './Admin'
import PageSmallForm from './PageSmallForm'

import './PageAccountActivation.less'

export default class PageAccountActivation extends PageSmallForm {
  static config = {
    ...PageSmallForm.config,
    ClassName: 'PageAccountActivation',

    hideSidebar: true,
    hideHeader: true,

    title: 'Account Activation',
    path: '/activate',
    exact: true,
    hidden: true,

    actions: [['ActionAccountActivation']],
    fields: [
      // ['FieldText', {
      //   name: 'name',
      //   label: null,
      //   placeholder: 'Name',
      //   size: 'large',
      //   prefix: <AntdIcon type="user" style={{ fontSize: 13 }} />,
      //   autoComplete: 'on',
      //   rules: [['validation.isRequired']],
      // }],
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
              '[data-action="activate-account"]'
            )
            if (element) {
              triggerEvent(element, 'click')
            }
          },
          virtual: true,
        },
      ],
    ],
    renderAfterForm: (props) => (
      <p className="after-form">
        Set you account password. Make sure it&apos;s strong and memorable.
      </p>
    ),
  }
}

Admin.addToLibrary('PageAccountActivation', (config) =>
  PageAccountActivation.create(config)
)
