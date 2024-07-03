import React from 'react'
import styled from 'styled-components'

import Input from 'antd/lib/input'

import { DeleteOutlined } from '@ant-design/icons'

import Admin from '../../hive-admin/src/components/Admin'
import ActionSave from '../../hive-admin/src/components/ActionSave'
import GroupResource from '../../hive-admin/src/components/GroupResource'

import tests from '../../helpers/tests'

import { ADMIN as FILTERS_ADMIN, CUSTOMER as FILTERS_CUSTOMER } from './filters'

import { ADMIN as COLUMNS_ADMIN, CUSTOMER as COLUMNS_CUSTOMER } from './columns'

import { ADMIN_ALL as FIELDS_ADMIN_ALL } from './fields'

const { viewerIsNotAdmin, viewerIsNotCustomer, userIsNotCustomer } = tests

// eslint-disable-next-line import/prefer-default-export
const IconDelete = styled(DeleteOutlined)`
  color: ${({ theme }) => theme.less.errorColor} !important;
  i {
    color: ${({ theme }) => theme.less.errorColor} !important;
  }
`

const PopConfirmWrapper = styled.div`
  max-width: 250px;
  margin-left: -22px;
`

const PopConfirmInput = styled(Input)``

const PopConfirmTextArea = styled(Input.TextArea)`
  margin-top: 10px;
`

export default Admin.compileFromLibrary([
  'GroupResource',
  {
    title: 'Users',
    icon: 'usergroup-add',
    path: '/users',
    hidden: [viewerIsNotAdmin],
    redirect: [['redirect.unauthorized']],
    getHideSidebar: (props) =>
      !props.viewer || props.viewer.role === 'CUSTOMER',
    getHideHeader: (props) => !props.viewer || props.viewer.role === 'CUSTOMER',
    archiveConfig: {
      title: 'Users',
      label: 'Users',
      icon: 'usergroup-add',
      createButtonPath: '/users/create',
      subtitleColumnPath: 'email',
      filters: FILTERS_ADMIN,
      columns: COLUMNS_ADMIN,
      skip: [viewerIsNotAdmin],
      hidden: [viewerIsNotAdmin],
      redirect: [['redirect.unauthorized']],
    },
    afterArchivePages: [
      [
        'PageArchiveTable',
        {
          path: '/customers',
          alias: '/users',
          exact: true,
          title: 'Customers',
          label: 'Customers',
          icon: 'usergroup-add',
          loadUrl: '/users/customers',
          loadExtractData: GroupResource.config.archiveLoadExtractData,
          createButtonPath: '/users/create',
          subtitleColumnPath: 'email',
          filters: FILTERS_CUSTOMER,
          columns: COLUMNS_CUSTOMER,
          skip: [viewerIsNotAdmin],
          hidden: true,
          redirect: [['redirect.unauthorized']],
        },
      ],
    ],
    singleConfig: {
      hidden: true,
      alias: '/users',
      headerTitle: 'Create User',
      backButtonPaths: ['/users', '/customers'],
    },
    singleEditConfig: {
      getBackButtonPaths: (props) =>
        props.viewer && props.viewer.role === 'ADMIN'
          ? props.backButtonPaths
          : false,
      actions: [
        [
          'ActionSave',
          {
            handleSuccess: (data, actionProps) => {
              actionProps.reload()
              ActionSave.config.handleSuccess(data, actionProps)
            },
          },
        ],
        [
          'ActionDelete',
          {
            skip: [viewerIsNotAdmin],
          },
        ],
        [
          'ActionWithRequest',
          {
            name: 'activate',
            title: 'Activate',
            skip: [['condition.check', { path1: 'data.active', value2: true }]],
            getRequestConfig: (props) => ({
              url: `users/actions/activate?id=${props.data._id}`,
              method: 'POST',
            }),
            handleSuccess: (data, props) => props.reload(),
          },
        ],
        [
          'ActionWithRequest',
          {
            name: 'deactivate',
            title: 'Deactivate',
            ghost: true,
            skip: [
              ['condition.check', { path1: 'viewer._id', path2: 'data._id' }],
              viewerIsNotAdmin,
              ['condition.check', { path1: 'data.active', value2: false }],
            ],
            getRequestConfig: (props) => ({
              url: `users/actions/deactivate?id=${props.data._id}`,
              method: 'POST',
            }),
            handleSuccess: (data, props) => props.reload(),
          },
        ],
        [
          'ActionWithRequest',
          {
            name: 'send-activation-email',
            title: 'Send Activation Email',
            ghost: true,
            skip: [['condition.check', { path1: 'data.active', value2: true }]],
            getRequestConfig: (props) => ({
              url: `users/actions/activate?id=${props.data._id}&email=true`,
              method: 'POST',
            }),
          },
        ],
        [
          'ActionWithRequest',
          {
            name: 'tags-first-order',
            title: 'First Tags Ordered',
            ghost: true,
            skip: [viewerIsNotAdmin, userIsNotCustomer],
            renderAction: (actionProps, instance) => {
              const action = instance.renderAction({
                ...actionProps,
                title: actionProps.data.tagsFirstOrder
                  ? 'First Tags Not Ordered'
                  : 'First Tags Ordered',
              })
              return action
            },
            getRequestConfig: (props) => ({
              url: `users/tags-first-order?user=${props.data._id}`,
              method: 'POST',
              data: {
                tagsFirstOrder: !props.data.tagsFirstOrder,
              },
            }),
            handleSuccess: (data, props) => props.reload(),
          },
        ],
        [
          'ActionWithRequest',
          {
            name: 'onboarding',
            title: 'Show Onboarding',
            ghost: true,
            skip: [
              viewerIsNotAdmin,
              userIsNotCustomer,
              [
                'condition.check',
                {
                  path1: 'data.onboarded',
                  value2: false,
                },
              ],
            ],
            getRequestConfig: (props) => ({
              url: `users/onboarding?user=${props.data._id}`,
              method: 'POST',
              data: { onboarded: false },
            }),
            handleSuccess: (data, props) => props.reload(),
          },
        ],
        [
          'ActionWithRequest',
          {
            name: 'award',
            title: 'Award Points',
            ghost: true,
            skip: [viewerIsNotAdmin, userIsNotCustomer],
            popconfirm: {
              title: (
                <PopConfirmWrapper>
                  <PopConfirmInput
                    id="award-points"
                    placeholder="Points"
                    style={{ textAlign: 'right' }}
                  />
                </PopConfirmWrapper>
              ),
              icon: null,
              okText: 'Award!',
            },
            getRequestConfig: (props) => ({
              url: `users/award?user=${props.data._id}`,
              method: 'POST',
              data: {
                points: parseInt(
                  document.getElementById('award-points').value,
                  10
                ),
              },
            }),
            handleSuccess: (data, props) => props.reload(),
          },
        ],
        ...[
          ['Set Trial Expires In', 'trial'],
          ['Set Payment Expires In', 'payment'],
        ].map(([title, which]) => [
          'ActionWithRequest',
          {
            name: `tier-date-${which}`,
            title,
            ghost: true,
            skip: [viewerIsNotAdmin, userIsNotCustomer],
            popconfirm: {
              title: (
                <PopConfirmWrapper>
                  <PopConfirmInput
                    id={`tier-date-${which}`}
                    placeholder="Set to 0 to expire now"
                    addonAfter="days"
                    prefix="In:"
                    style={{ textAlign: 'right' }}
                  />
                </PopConfirmWrapper>
              ),
              icon: null,
              okText: 'Set!',
            },
            getRequestConfig: (props) => ({
              url: `users/${props.data._id}/tier/expires`,
              method: 'POST',
              data: {
                which,
                days: parseInt(
                  document.getElementById(`tier-date-${which}`).value,
                  10
                ),
              },
            }),
            handleSuccess: (data, props) => props.reload(),
          },
        ]),
        [
          'ActionWithRequest',
          {
            name: 'push',
            title: 'Notify',
            ghost: true,
            skip: [
              viewerIsNotAdmin,
              userIsNotCustomer,
              // () => true,
            ],
            popconfirm: {
              title: (
                <PopConfirmWrapper>
                  <PopConfirmInput id="push-title" placeholder="Title" />
                  <PopConfirmTextArea
                    id="push-body"
                    placeholder="Body"
                    autoSize={{ minRows: 2 }}
                  />
                </PopConfirmWrapper>
              ),
              icon: null,
              okText: 'Send',
            },
            getRequestConfig: (props) => ({
              url: `users/actions/push-send?query=${JSON.stringify({
                where: { _id: { EQ: props.data._id } },
              })}`,
              method: 'POST',
              data: {
                title: document.getElementById('push-title').value,
                body: document.getElementById('push-body').value,
              },
            }),
          },
        ],
        [
          'Action',
          {
            name: 'close',
            icon: 'close',
            title: 'Close',
            ghost: true,
            skip: [viewerIsNotCustomer],
            onClick: (props) => props.history.push('/reecycle'),
          },
        ],
        [
          'Action',
          {
            name: 'logout',
            icon: 'poweroff',
            title: 'Logout',
            ghost: true,
            skip: [viewerIsNotCustomer],
            onClick: (props) => props.unauthorize(),
          },
        ],
        [
          'ActionWithRequest',
          {
            name: 'close-account',
            title: 'Close Account',
            ghost: true,
            type: 'danger',
            skip: [
              viewerIsNotCustomer,
              [
                'condition.check',
                {
                  path1: 'viewer._id',
                  path2: 'data._id',
                  op: '!==',
                },
              ],
              ['condition.check', { path1: 'data.active', value2: false }],
            ],
            getRequestConfig: (props) => ({
              url: `users/actions/deactivate?id=${props.data._id}`,
              method: 'POST',
            }),
            popconfirm: {
              title: (
                <>
                  You&apos;re about to permanently delete your account and all
                  data associated with it.
                  <br />
                  To confirm, click the red &quot;Close Account&quot;
                  <br />
                  button below.
                </>
              ),
              okButtonProps: { type: 'danger', icon: 'delete' },
              okText: 'Close Account',
              cancelButtonProps: {},
              icon: <IconDelete />,
            },
            handleSuccess: (data, props) => props.reload(),
          },
        ],
      ],
    },
    fields: FIELDS_ADMIN_ALL,
  },
]).pages
