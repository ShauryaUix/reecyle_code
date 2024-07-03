import moment from 'moment-timezone'

import React from 'react'
import styled, { css } from 'styled-components'

import { Link } from 'react-router-dom'

import {
  UserOutlined,
  DeleteOutlined,
  BorderBottomOutlined,
  CheckOutlined,
  GoldOutlined,
  CopyrightCircleOutlined,

  // RetweetOutlined,
  // SlidersOutlined,
  // DashboardOutlined,
  FilterOutlined,
} from '@ant-design/icons'

import { QRCodePreviewPopover, QRCodeIcon } from '../../components/CodeScanner'

import Types from '../../helpers/types'

// const DumpsterOutlinedSvg = (props) => (
//   /* eslint-disable max-len */
//   <span
//     {...props}
//     className={`anticon ${props.className || ''}`}
//   >
//     <svg
//       width="1.4em"
//       height="1.4em"
//       focusable="false"
//       fill="currentColor"
//       aria-hidden="true"
//       viewBox="0 0 32 32"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path d="M 5 6 L 3 14 L 4.3339844 14 L 4.6660156 16 L 3 16 L 3 18 L 5 18 L 6 24 L 6 26 L 8 26 L 8 24 L 24 24 L 24 26 L 26 26 L 26 24 L 27 18 L 29 18 L 29 16 L 27.333984 16 L 27.666016 14 L 29 14 L 27 6 L 17 6 L 15 6 L 5 6 z M 6.5625 8 L 9.3378906 8 L 8.5722656 12 L 5.5625 12 L 6.5625 8 z M 11.390625 8 L 15 8 L 15 12 L 10.630859 12 L 11.390625 8 z M 17 8 L 20.609375 8 L 21.369141 12 L 17 12 L 17 8 z M 22.662109 8 L 25.4375 8 L 26.4375 12 L 23.427734 12 L 22.662109 8 z M 6.3613281 14 L 8.1894531 14 L 10.25 14 L 15 14 L 17 14 L 21.75 14 L 23.810547 14 L 25.638672 14 L 24.306641 22 L 7.6933594 22 L 6.3613281 14 z" />
//     </svg>
//   </span>
//     /* eslint-enable max-len */
// );

export const IconWithValue = styled.div`
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  justify-content: flex-end;
  /* justify-content: center; */
  align-items: center;
  width: 100%;
  white-space: nowrap;
  @media (min-width: 769px) {
    min-width: 50px;
  }
  ${({ empty, theme }) =>
    empty
      ? css`
          opacity: 0.3;
          .anticon {
            color: ${theme.less.textColor} !important;
          }
        `
      : undefined}
`

export const columnRecycleTag = {
  path: 'recycleTags',
  title: null,
  render: (record, column, props) => (
    <span>
      <QRCodePreviewPopover
        mode="query"
        client={props.client}
        url={`/recycletags/customer/${record._id}`}
      >
        <QRCodeIcon />
      </QRCodePreviewPopover>
      <span>{`/ ${record.tagsCount || 0}`}</span>
    </span>
  ),
}

export const columnName = {
  path: 'name',
  width: '100%',
  link: '/users/:_id',
}

export const columnEmail = 'email'

export const columnRole = {
  path: 'role',
  title: 'Role',
  render: (record) => Types.USER_ROLE_LABELS_MAP[record.role],
}

export const columnActive = {
  path: 'active',
  title: 'Status',
  render: (record) => (record.active ? 'Active' : 'Inactive'),
}

export const IconCustomers = styled(UserOutlined)`
  transform: translateY(-0.5px);
  font-size: 15px;
`

export const IconPending = styled(DeleteOutlined)`
  color: ${({ theme }) => theme.less.errorColor};
  transform: translateY(-1.5px);
  font-size: 16px;
`

// export const IconDropped = styled(DumpsterOutlinedSvg)`
//   color: ${({ theme }) => theme.less.errorColor};
//   /* transform: translateY(-1.5px); */
//   font-size: 16px;
//   display: inline-block;
//   svg {
//     fill: currentcolor;
//   }
// `;

export const IconDropped = styled(BorderBottomOutlined)`
  color: ${({ theme }) => theme.less.errorColor};
  transform: translateY(-1.5px);
  font-size: 16px;
`

export const IconSorting = styled(FilterOutlined)`
  transform: translateY(-1px);
  font-size: 16px;
`

export const IconSorted = styled(CheckOutlined)`
  color: ${({ theme }) => theme.less.primaryColor};
  transform: translateY(-0.5px);
  font-size: 16px;
`

export const IconVolume = styled(GoldOutlined)`
  transform: translateY(-1px);
  font-size: 16px;
`

export const IconCoin = styled(CopyrightCircleOutlined)`
  /* color: #EBDB00; */
  color: ${({ theme }) => theme.less.primaryColor};
  transform: translateY(-1px);
`

export const Bags = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  justify-content: space-around;
`

export const BagsPart = styled.div`
  display: flex;
  flex: 1;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
`

export const BAGS_CONFIG = {
  pending: {
    Icon: IconPending,
    // getColor: theme => theme.less.errorColor,
  },
  dropped: {
    Icon: IconDropped,
  },
  sorting: {
    Icon: IconSorting,
  },
  sorted: {
    Icon: IconSorted,
    // getColor: () => '#d7c900',
  },
}

export const columnTagsCount = {
  path: 'tagsCount',
  title: 'Tags',
  align: 'right',
}

export const columnTier = {
  path: 'tier',
  title: 'Tier',
  align: 'right',
  render: (record) => Types.CUSTOMER_TIER_LABELS_MAP[record.tier],
}

export const columnTierStatus = {
  path: 'tierStatus',
  title: 'Payment',
  align: 'right',
  render: (record) => (!record.tierStatus ? '-' : record.tierStatus.label),
}

export const columnBags = {
  path: 'bags',
  title: 'Bags',
  align: 'right',
  render: (record) => (
    <Bags>
      {Types.BAGS_LIST.map(({ id, description }) => {
        const { Icon: IconComponent } = BAGS_CONFIG[id] || {}
        return (
          <BagsPart key={id} title={description}>
            <IconWithValue empty={!record.bags[id]}>
              {Types.decimalizeInt(record.bags[id] || 0)}
              &nbsp;
              <IconComponent />
            </IconWithValue>
          </BagsPart>
        )
      })}
    </Bags>
  ),
}

export const RouteID = styled.code`
  /* font-weight: 200; */
`

export const columnNextRoute = {
  path: 'nextRoute',
  title: 'Next Route',
  render: (record) =>
    record.nextRoute ? (
      <Link to={`/routes/${record.nextRoute._id}`}>
        {moment(record.nextRouteAt).tz(Types.TIMEZONE).calendar({
          sameDay: '[Today] [at] hh:mm a',
          nextDay: '[Tomorrow] [at] hh:mm a',
          nextWeek: '[on] dddd [at] hh:mm a',
          lastDay: '[Yesterday]',
          lastWeek: '[Last] dddd',
          sameElse: '[on] MMMM Do [at] hh:mm a',
        })}
      </Link>
    ) : (
      '-'
    ),
}

export const columnLastRoute = {
  path: 'lastRoute',
  title: 'Last Route',
  render: (record) => {
    if (!record.lastRouteAt) {
      return '-'
    }
    const lastRouteAt = moment(record.lastRouteAt).tz(Types.TIMEZONE).calendar({
      sameDay: '[Today] [at] hh:mm a',
      nextDay: '[Tomorrow] [at] hh:mm a',
      nextWeek: 'dddd [at] hh:mm a',
      lastDay: '[Yesterday]',
      lastWeek: '[Last] dddd',
      sameElse: 'MMMM Do [at] hh:mm a',
    })
    if (record.lastRoute) {
      return <Link to={`/routes/${record.lastRoute._id}`}>{lastRouteAt}</Link>
    }
    return lastRouteAt
  },
}

export const columnBalance = {
  path: 'balance',
  title: 'Points',
  align: 'right',
  render: (record) => (
    <IconWithValue>
      {Types.decimalizeInt(record.points.balance)}
      &nbsp;
      <IconCoin />
    </IconWithValue>
  ),
}

export const columnArea = {
  path: 'area',
  title: 'Area',
  render: (record) =>
    record.area ? (
      <Link to={`/areas/${record.area._id}`}>{record.area.name}</Link>
    ) : (
      '-'
    ),
}

export const ADMIN = [columnName, columnEmail, columnRole, columnActive]

export const CUSTOMER = [
  columnRecycleTag,
  columnName,
  columnTagsCount,
  columnTier,
  columnTierStatus,
  columnBags,
  columnBalance,
  columnArea,
  columnNextRoute,
  columnLastRoute,
  columnEmail,
  columnActive,
]
