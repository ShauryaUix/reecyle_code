import React from 'react'
import styled from 'styled-components'

import Input from 'antd/lib/input'

import AntdButton from 'antd/lib/button'

import Types from '../../helpers/types'
import getFilterWithCol from '../../helpers/getFilterWithCol'
import clickAnchor from '../../helpers/clickAnchor'

import SorterReportAction from '../../components/SorterReportAction'

const ButtonGroup = styled(AntdButton.Group)`
  width: 100%;
  display: flex;
  > .ant-btn:first-child {
    width: 100%;
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

export const filterSearch = [
  'FilterField',
  {
    id: 'search',
    label: null, // 'ID',
    section: 'top',
    buildQuery: (value, builder) =>
      value &&
      builder.add('where', {
        OR: [
          { name: { REGEX: value, OPTIONS: 'i' } },
          { email: { REGEX: value, OPTIONS: 'i' } },
        ],
      }),
    getValueForField: (value) => value || '',
    getValueForQuery: (value) => {
      value = !value ? undefined : value.target ? value.target.value : value
      return !value || !value.length ? undefined : value
    },
    field: [
      'FieldText',
      {
        name: 'search',
        placeholder: 'Search name or email',
      },
    ],
  },
]

export const filterCustomersSort = [
  'FilterField',
  {
    id: 'sort',
    label: null,
    section: 'top',
    VALUES_MAP: {
      name: { name: 1 },
      bags: { 'bags.pending': 1, name: 1 },
      'last-route': { lastRouteAt: -1, name: 1 },
      // area: { area: 1, name: 1 },
      'tags-count': { tagsCount: 1, name: 1 },
    },
    buildQuery: (value, builder, filter) =>
      filter.VALUES_MAP[value || 'name']
        ? builder.add('sort', { ...filter.VALUES_MAP[value || 'name'] })
        : null,
    getValueForField: (value) => (value && value.length ? value : 'name'),
    field: [
      'FieldSelect',
      {
        name: 'status',
        placeholder: 'Sort',
        prepareValueForInput: (value) => (value ? value : 'any'),
        initialValue: 'name',
        choices: [
          {
            label: 'Sort by name',
            value: 'name',
          },
          {
            label: 'Sort by bags pending',
            value: 'bags',
          },
          {
            label: 'Sort by last route',
            value: 'last-route',
          },
          {
            label: 'Sort by tags count',
            value: 'tags-count',
            // }, {
            //   label: 'Sort by area',
            //   value: 'area',
          },
        ],
      },
    ],
  },
]

export const filterTagsCount = [
  'FilterField',
  {
    id: 'tags',
    label: null,
    section: 'top',
    VALUES_MAP: {
      'did-not-order-tags': { tagsFirstOrder: { $ne: true } },
      'less-than-5': { tagsCount: { LT: 5 } },
      'less-than-20': { tagsCount: { LT: 20 } },
    },
    buildQuery: (value, builder, filter) =>
      filter.VALUES_MAP[value]
        ? builder.add('where', { ...filter.VALUES_MAP[value] })
        : null,
    getValueForField: (value) => (value && value.length ? value : 'any'),
    field: [
      'FieldSelect',
      {
        name: 'tags',
        placeholder: 'Tags',
        prepareValueForInput: (value) => (value ? value : 'any'),
        initialValue: 'any',
        choices: [
          {
            label: 'Has any amount of tags',
            value: 'any',
          },
          {
            label: 'Did not order tags',
            value: 'did-not-order-tags',
          },
          {
            label: 'Has less than 5 tags',
            value: 'less-than-5',
          },
          {
            label: 'Has less than 20 tags',
            value: 'less-than-20',
          },
        ],
      },
    ],
  },
]

export const filterRole = [
  'FilterField',
  {
    id: 'role',
    label: null,
    section: 'top',
    VALUES_MAP: Types.USER_ROLE_LIST.reduce(
      (agr, { id, label }) => {
        agr[id] = { role: { EQ: id } }
        return agr
      },
      { any: null }
    ),
    buildQuery: (value, builder, filter) =>
      filter.VALUES_MAP[value]
        ? builder.add('where', { ...filter.VALUES_MAP[value] })
        : null,
    getValueForField: (value) => (value && value.length ? value : undefined),
    field: [
      'FieldSelect',
      {
        name: 'role',
        placeholder: 'Role',
        prepareValueForInput: (value) => (value ? value : 'any'),
        choices: [
          { label: 'Any Role', value: 'any' },
          ...Types.USER_ROLE_LIST.map(({ id: value, label }) => ({
            value,
            label,
          })),
        ],
      },
    ],
  },
]

export const filterActive = [
  'FilterField',
  {
    id: 'status',
    label: null,
    section: 'top',
    VALUES_MAP: {
      any: null,
      active: { active: { EQ: true } },
      inactive: { active: { EQ: false } },
    },
    buildQuery: (value, builder, filter) =>
      filter.VALUES_MAP[value]
        ? builder.add('where', { ...filter.VALUES_MAP[value] })
        : null,
    getValueForField: (value) => (value && value.length ? value : 'any'),
    field: [
      'FieldSelect',
      {
        name: 'status',
        placeholder: 'Status',
        prepareValueForInput: (value) => (value ? value : 'any'),
        initialValue: 'any',
        choices: [
          {
            label: 'Any Status',
            value: 'any',
          },
          {
            label: 'Active',
            value: 'active',
          },
          {
            label: 'Inactive',
            value: 'inactive',
          },
        ],
      },
    ],
  },
]

export const filterPagination = [
  'FilterPagination',
  {
    id: 'pagination',
    section: 'bottom',
  },
]

export const filterNotSignups = [
  'FilterHidden',
  {
    id: 'nonSignupUsers',
    section: 'bottom',
    build: (builder) => builder.add('where', { signup: { NE: true } }),
  },
]

export const filterSorterReportAction = [
  'FilterField',
  {
    id: 'sortingreport',
    section: 'top',
    buildQuery: () => {},
    // skip: [
    //   isNotEditActivity,
    //   userIsNotSorter,
    // ],
    propsFromPage: (props) => ({ client: props.client }),
    field: [
      'FieldReact',
      {
        label: null,
        name: 'sortingreport',
        renderContent: (props) => (
          <SorterReportAction sorter={null} client={props.client} />
        ),
      },
    ],
  },
]

export const filterExportAction = [
  'FilterField',
  {
    id: 'export',
    section: 'top',
    buildQuery: () => {},
    propsFromPage: (props) => ({
      client: props.client,
      queryBuilder: props.queryBuilder,
      isCustomersPage: props.id === '/customers',
    }),
    field: [
      'Action',
      {
        id: 'export',
        title: 'Export CSV',
        section: 'top',
        style: { width: '100%' },
        ghost: true,
        onClick: (props) => {
          // console.log(props);
          const { where } = props.queryBuilder.build()
          const conditions = [...(where.AND || [])]
          if (props.isCustomersPage) {
            conditions.push({ role: { EQ: 'CUSTOMER' } })
          }
          clickAnchor(
            {
              url: `${Types.SERVER_URL}/api/users/export`,
              query: {
                access_token: props.client.getAccessToken(),
                query: JSON.stringify({
                  where: conditions.length ? { AND: conditions } : undefined,
                }),
              },
            },
            {
              download: true,
            }
          )
        },
      },
    ],
  },
]

export const filterNotify = [
  'FilterField',
  {
    id: 'push',
    label: null,
    section: 'top',
    buildQuery: () => {},
    propsFromPage: (props) => ({
      client: props.client,
      restBaseRoot: props.restBaseRoot,
      queryBuilder: props.queryBuilder,
    }),
    style: { width: '100%' },
    field: [
      'ActionWithRequest',
      {
        name: 'push',
        ghost: true,
        title: 'Notify',
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
        getRequestConfig: (props) => {
          const { where } = props.queryBuilder.build()
          return {
            url: `users/actions/push-send?query=${JSON.stringify({
              where,
            })}`,
            method: 'POST',
            data: {
              title: document.getElementById('push-title').value,
              body: document.getElementById('push-body').value,
            },
          }
        },
      },
    ],
  },
]

export const [filterAreas] = [['areas', 'IN', 'Areas']].map(
  ([id, operator, placeholder]) => [
    'FilterField',
    {
      id,
      label: null,
      section: 'top',
      propsFromPage: (props) => ({ client: props.client }),
      buildQuery: (value, builder) =>
        value &&
        value.length &&
        builder.add('where', {
          area: Array.isArray(value) ? value : [value],
        }),
      field: [
        'FieldConnectionSelect',
        {
          name: 'areas',
          url: '/areas',
          placeholder,
          mode: 'multiple',
          allowClear: true,
          searchPaths: ['name'],
          getChoiceLabel: (choice) => `${choice.data.name}`,
        },
      ],
    },
  ]
)

export const filterTier = [
  'FilterField',
  {
    id: 'tier',
    label: null,
    section: 'top',
    VALUES_MAP: Types.CUSTOMER_TIER_LIST.reduce(
      (agr, { id, label }) => {
        agr[id] = { tier: { EQ: id } }
        return agr
      },
      { any: null }
    ),
    buildQuery: (value, builder, filter) =>
      filter.VALUES_MAP[value]
        ? builder.add('where', { ...filter.VALUES_MAP[value] })
        : null,
    getValueForField: (value) => (value && value.length ? value : undefined),
    field: [
      'FieldSelect',
      {
        name: 'tire',
        placeholder: 'Tier',
        prepareValueForInput: (value) => (value ? value : 'any'),
        choices: [
          { label: 'Any Tier', value: 'any' },
          ...Types.CUSTOMER_TIER_LIST.reduce(
            (agr, { id: value, label, hidden }) => {
              if (!hidden) {
                agr.push({ value, label })
              }
              return agr
            },
            []
          ),
        ],
      },
    ],
  },
]

export const filterActiveTier = [
  'FilterField',
  {
    id: 'activeTier',
    label: null,
    section: 'top',
    buildQuery: (value, builder) =>
      `${value}` === 'true' && builder.add('custom', { activeTiersOnly: true }),
    getValueForField: (value) => (`${value}` === 'true' ? 'true' : 'false'),
    field: [
      'FieldSelect',
      {
        name: 'activeTier',
        label: null,
        placeholder: 'Payment Status',
        initialValue: 'false',
        choices: [
          { value: 'false', label: 'Any Payment Status' },
          { value: 'true', label: 'Paid / On Trial' },
        ],
        block: true,
      },
    ],
  },
]

export const filterDiscountCode = [
  'FilterField',
  {
    id: 'discountCode',
    label: null,
    section: 'top',
    propsFromPage: (props) => ({ client: props.client }),
    buildQuery: (value, builder) => {
      value && value.length && builder.add('where', { tierDiscountCode: value })
    },
    field: [
      'FieldConnectionSelect',
      {
        name: 'tierDiscountCode',
        url: '/discountcodes',
        placeholder: 'Discount Code',
        // mode: 'multiple',
        allowClear: true,
        searchPaths: ['code'],
        extraQuerySortProps: { code: 1 },
        getChoiceLabel: (choice) =>
          `${choice.data.code} (${choice.data.description})`,
      },
    ],
  },
]

export const filterGenerateTags = [
  'FilterField',
  {
    id: 'generate-tags',
    label: null,
    section: 'top',
    buildQuery: () => {},
    propsFromPage: (props) => ({
      client: props.client,
      restBaseRoot: props.restBaseRoot,
    }),
    field: [
      'FieldReact',
      {
        label: null,
        renderContent: (props) => (
          <ButtonGroup>
            {[1, 100, 500, 1000].map((count) => (
              <AntdButton
                key={count}
                type="primary"
                ghost
                onClick={() =>
                  clickAnchor(
                    {
                      url: `${props.restBaseRoot}/recycletags/generate`,
                      query: {
                        count,
                        download: true,
                        access_token: props.client.getAccessToken(),
                      },
                    },
                    { download: true }
                  )
                }
              >
                {count === 1 ? 'Generate Tag' : `x${count}`}
              </AntdButton>
            ))}
          </ButtonGroup>
        ),
      },
    ],
  },
]

export const filterCustomersPopulate = [
  'FilterHidden',
  {
    id: 'populateCustomers',
    section: 'bottom',
    build: (builder) =>
      builder.add('populate', {
        area: true,
        nextRoute: true,
        lastRoute: true,
      }),
  },
]

export const filterSeeAllUsers = [
  'FilterActionLink',
  {
    to: '/users',
    title: 'See All Users',
    // buttonProps: { icon: 'arrow-left' },
    buttonProps: { icon: 'left' },
  },
]

export const filterSeeCustomers = [
  'FilterActionLink',
  {
    to: '/customers',
    title: 'See Customers',
    // buttonProps: { icon: 'arrow-right' },
    buttonProps: { icon: 'right' },
  },
]

export const ADMIN = [
  ...[
    [filterSearch, 8],
    [filterActive, 8],
    [filterRole, 8],
    // [filterSorterReportAction, 24],
    [filterSeeCustomers, 24],
    [filterExportAction, 24],
  ].map(([filter, col]) => getFilterWithCol(filter, col)),

  filterPagination,
  // filterNotSignups,
]

export const CUSTOMER = [
  ...[
    [filterSearch, 12],
    [filterActive, 12],
    [filterTagsCount, 12],
    [filterCustomersSort, 12],
    [filterAreas, 12],
    [filterTier, 12],
    [filterActiveTier, 24],
    [filterDiscountCode, 24],
    [filterSeeAllUsers, 24],
    [filterGenerateTags, 24],
    [filterNotify, 12],
    [filterExportAction, 12],
  ].map(([filter, col]) => getFilterWithCol(filter, col)),

  filterPagination,
  // filterNotSignups,
  filterCustomersPopulate,
]
