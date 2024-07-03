import moment from 'moment-timezone'
import isString from 'lodash/isString'
import padStart from 'lodash/padStart'

import { stringify as stringifyQuery } from 'querystring'

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
} from 'react'
import styled, { useTheme } from 'styled-components'

import { PlusOutlined, MinusOutlined } from '@ant-design/icons'

import { Link } from 'react-router-dom'

import AntdModal from 'antd/lib/modal'
import Table from 'antd/lib/table'
import Button from 'antd/lib/button'
import Popover from 'antd/lib/popover'
import Tooltip from 'antd/lib/tooltip'
import Icon from 'antd/lib/icon'

import Query from 'hive-admin/src/components/Query'
import { GoogleMap } from 'hive-admin/src/components/FieldGoogleAddress'
import FieldSortableList from 'hive-admin/src/components/FieldSortableList'

import Admin from '../../components/Admin'
import Alert from '../../components/Alert'

import SorterReportAction from '../../components/SorterReportAction'

import Types from '../../helpers/types'

import tests from '../../helpers/tests'

import { BAGS_CONFIG, IconCoin } from './columns'

const CheckoutRedirectModalHTML = ({ className, ...props }) => (
  <AntdModal wrapClassName={className} {...props} />
)

const CheckoutRedirectModal = styled(CheckoutRedirectModalHTML)`
  .ant-modal {
    max-width: 1024px;
  }

  .ant-modal-content {
    position: relative;
    overflow: hidden;
    height: calc(100vh - 40px);
    border-radius: 20px;
    /* padding: 0 25px; */

    .ant-modal-header {
      display: none;
    }

    .ant-modal-body {
      padding: 0px;
      margin: 0px;
      /* height: calc(100% - 40px - 20px); */
      height: 100%;
      overflow: hidden;
      iframe {
        border: 0px;
      }
    }
  }
`

const skipPassword = () => false

const {
  viewerIsNotAdmin,
  userIsNotAdmin,
  userIsNotCustomer,
  userIsNotDriver,
  userIsNotSorter,
  isNotCreateActivity,
  isNotEditActivity,
} = tests

const skipPoints = [viewerIsNotAdmin, userIsNotCustomer, isNotEditActivity]

const DataWrapper = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  margin: -5px;
`

const DataItemWrapper = styled.div`
  display: flex;
  flex: 1 1 ${({ minWidth = 140 }) => minWidth}px;
  flex-direction: column;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.less.borderColor};
  margin: 5px;
  border-radius: ${({ theme }) => theme.less.borderRadius};
  line-height: 100%;
`

const DataItemLabel = styled.div`
  display: flex;
  .anticon {
    color: ${({ theme }) => theme.less.textColor};
  }
`

const DataItemLabelText = styled.span`
  opacity: 0.4;
`

const DataItemValue = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  margin-top: 15px;
  padding-bottom: 4px;
`

const DataItemValueNumber = styled.div.attrs(
  // eslint-disable-next-line arrow-body-style
  ({ value, theme, color }) => {
    return {
      style: {
        opacity: value === 0 ? 0.1 : 1,
      },
    }
  }
)`
  display: flex;
  font-size: 28px;
  font-weight: 700;
`

function DataItemBags({ id, userId, label, client }) {
  const { Icon: IconComponent } = BAGS_CONFIG[id] || {}
  return (
    <Query
      url={`users/${userId}/bags/${id}`}
      extractData={(response) => (response ? response.data : null)}
      client={client}
    >
      {({ data, reload }) => {
        const { value } = data || { value: 0 }
        return (
          <Popover
            key={id}
            content={
              <Button.Group>
                <Button
                  onClick={async () => {
                    await client.request({
                      url: `users/${userId}/bags/${id}`,
                      method: 'post',
                      data: { value: value + 1 },
                    })
                    reload()
                  }}
                >
                  <PlusOutlined />
                </Button>
                {/* <Button style={{ pointerEvents: 'none' }}>
                  {value}
                </Button> */}
                <Button
                  onClick={async () => {
                    await client.request({
                      url: `users/${userId}/bags/${id}`,
                      method: 'post',
                      data: { value: value - 1 },
                    })
                    reload()
                  }}
                >
                  <MinusOutlined />
                </Button>
              </Button.Group>
            }
            title={null}
            // visible={false}
          >
            <DataItemWrapper minWidth={80}>
              <DataItemLabel>
                {IconComponent ? <IconComponent /> : null}
                &nbsp;
                <DataItemLabelText>{label}</DataItemLabelText>
              </DataItemLabel>
              <DataItemValue>
                <DataItemValueNumber value={value}>
                  {Types.decimalizeInt(value)}
                </DataItemValueNumber>
              </DataItemValue>
            </DataItemWrapper>
          </Popover>
        )
      }}
    </Query>
  )
}

const PointsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const CategoriesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
  margin-top: ${({ top }) => (top ? '20px' : '-10px')};
`

const CategoriesItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 14px;
`

const CategoriesItemHeader = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  padding: 2px;
`

const CategoriesItemLabel = styled.div`
  opacity: 0.4;
`

const CategoriesItemValues = styled.div`
  display: flex;
  flex-direction: row;
`

const CategoriesItemValue = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 5px;
`

const CategoriesItemValueNumber = styled.div``

const CategoriesItemValueUnit = styled.div`
  /* font-size: 80%; */
  opacity: 0.4;
  ${IconCoin} {
    font-size: 14px;
    transform: initial;
  }
`

const CategoriesItemBarWrapper = styled.div`
  display: flex;
  width: 100%;
  background: rgba(217, 217, 217, 0.3);
  border-radius: ${({ theme }) => theme.less.borderRadius};
  overflow: hidden;
`

const CategoriesItemBar = styled.div.attrs(
  // eslint-disable-next-line arrow-body-style
  ({ theme, percentage = 0 }) => {
    return {
      style: {
        width: `${(percentage || 0).toFixed(2)}%`,
        background:
          percentage === 0 ? theme.less.borderColor : theme.less.primaryColor,
        opacity: percentage === 0 ? 0.6 : 1,
      },
    }
  }
)`
  display: flex;
  height: 16px;
  /* min-width: 10px; */
  transform-origin: 0% center;
  background: ${({ theme }) => theme.less.primaryColor};
  border-radius: ${({ theme }) => theme.less.borderRadius};
  transition: width 300ms cubic-bezier(0.25, 1, 0.5, 1);
`

function Categories({
  categories,
  values = {},
  top = true,
  skipEmpty = false,
  renderCategoryItem,
  renderCategoryItemQuantity,
}) {
  const data = useMemo(() => {
    const max = Object.values(values).reduce(
      (agr, value) => Math.max(agr, value.points),
      0
    )
    return categories
      .filter(({ id }) => !skipEmpty || (values[id] || {}).points > 0)
      .map(({ id, label, unit, quantifiable }) => ({
        id,
        label,
        value: (values[id] || {}).points || 0,
        unit: Types.CATEGORY_UNITS_MAP[unit].unitShort,
        quantity: (values[id] || {}).quantity || 0,
        percentage: (((values[id] || {}).points || 0) / max || 0) * 100,
        quantifiable: Types.CATEGORY_UNITS_MAP[unit].quantifiable !== false,
      }))
  }, [values, categories, skipEmpty])
  return (
    <CategoriesWrapper top={top}>
      {data.map((category) =>
        renderCategoryItem(
          <CategoriesItem key={category.id}>
            <CategoriesItemHeader>
              <CategoriesItemLabel>{category.label}</CategoriesItemLabel>
              <CategoriesItemValues>
                {category.quantifiable ? (
                  <>
                    {renderCategoryItemQuantity(
                      <CategoriesItemValue>
                        <CategoriesItemValueNumber>
                          {Types.decimalize(category.quantity)}
                        </CategoriesItemValueNumber>
                        <CategoriesItemValueUnit>
                          {category.unit}
                        </CategoriesItemValueUnit>
                      </CategoriesItemValue>,
                      category
                    )}
                    &nbsp; / &nbsp;
                  </>
                ) : null}
                <CategoriesItemValue>
                  <CategoriesItemValueNumber>
                    {Types.decimalizeInt(category.value)}
                  </CategoriesItemValueNumber>
                  <CategoriesItemValueUnit>p</CategoriesItemValueUnit>
                </CategoriesItemValue>
              </CategoriesItemValues>
            </CategoriesItemHeader>
            <CategoriesItemBarWrapper>
              <CategoriesItemBar percentage={category.percentage || 0} />
            </CategoriesItemBarWrapper>
          </CategoriesItem>,
          category
        )
      )}
    </CategoriesWrapper>
  )
}

Categories.defaultProps = {
  renderCategoryItem: (children, category) => children,
  renderCategoryItemQuantity: (children, category) => children,
}

export function Points({ points, viewer, categories, style, ...rest }) {
  return (
    <PointsWrapper style={style}>
      {points ? (
        <DataWrapper>
          <DataItemWrapper minWidth={80}>
            <DataItemLabel>
              <DataItemLabelText>Balance</DataItemLabelText>
            </DataItemLabel>
            <DataItemValue>
              <DataItemValueNumber value={points.balance || 0}>
                {Types.decimalizeInt(points.balance || 0)}
              </DataItemValueNumber>
            </DataItemValue>
          </DataItemWrapper>
          {/* <DataItem minWidth={80}>
                <DataItemLabel>
                  <DataItemLabelText>
                    Spent
                  </DataItemLabelText>
                </DataItemLabel>
                <DataItemValue>
                  <DataItemValueNumber
                    value={points.spent || 0}
                  >
                    {`${points.spent || 0}`}
                  </DataItemValueNumber>
                </DataItemValue>
              </DataItem> */}
        </DataWrapper>
      ) : null}
      <Categories
        categories={viewer._.categories}
        values={categories}
        top={!!points}
        {...rest}
      />
    </PointsWrapper>
  )
}

export const fieldAvatar = [
  'FieldUploadRefs',
  {
    name: 'avatar',
    label: 'Avatar',
    accept: 'image/png,image/jpg,image/jpeg',
    transformations: [
      // TODO check pictures max width
      ['GM', { command: 'compress', maxWidth: 700 }],
    ],
    skip: [userIsNotCustomer],
  },
]

export const fieldName = [
  'FieldText',
  {
    name: 'name',
    label: null,
    prefix: 'Name:',
    rules: [['validation.isRequired'], ['validation.isName']],
  },
]

export const fieldEmail = [
  'FieldText',
  {
    name: 'email',
    label: null,
    prefix: 'Email:',
    autoComplete: 'new-email',
    rules: [['validation.isRequired'], ['validation.isEmail']],
  },
]

export const fieldRole = [
  'FieldSelect',
  {
    name: 'role',
    label: null,
    prefix: 'Role:',
    initialValue: 'ADMIN',
    rules: [['validation.isRequired']],
    choices: Types.USER_ROLE_LIST.map(({ id, label }) => ({
      label,
      value: id,
    })),
    disabled: [isNotCreateActivity],
    virtual: [isNotCreateActivity],
    hidden: [viewerIsNotAdmin],
  },
]

export const fieldTierTitle = [
  'FieldTitle',
  {
    title: 'Tier',
    skip: [userIsNotCustomer],
    // hidden: [viewerIsNotAdmin],
  },
]

export const fieldTier = [
  'FieldRadio',
  {
    name: 'tier',
    label: null,
    block: true,
    initialValue: Types.CUSTOMER_TIER[0],
    choices: Types.CUSTOMER_TIER_LIST.filter(({ hidden }) => !hidden).map(
      ({ id: value, label }) => ({ label, value })
    ),
    // hidden: [viewerIsNotAdmin],
    // disabled: [viewerIsNotAdmin],
    // virtual: [viewerIsNotAdmin],
    skip: [userIsNotCustomer],
  },
]

export const fieldTierStatus = [
  'FieldReact',
  {
    label: null,
    renderContent: (props) => {
      // const tier = props.form.getFieldValue('tier');
      let {
        data: { tierStatus: status },
      } = props
      if (status) {
        status = {
          ...status,
          message: status.message.replace(
            /\[expires:([^\]]+)\]/,
            (all, time) =>
              time === 'from'
                ? moment(status.expires).from(new Date())
                : time === 'date'
                  ? moment(status.expires).format('ll')
                  : ''
          ),
        }
      }
      return status ? (
        <Alert type={status.kind} message={status.message} showIcon />
      ) : // <p>{message}</p>
      null
    },
    virtual: [() => true],
    skip: [userIsNotCustomer, isNotEditActivity],
  },
]

export const fieldPhoneNumber = [
  'FieldText',
  {
    name: 'phoneNumber',
    label: null,
    prefix: 'Phone Number:',
    autoComplete: 'new-phone-number',
    rules: [],
    skip: [['condition.and', [userIsNotDriver, userIsNotCustomer]]],
  },
]

export const fieldReferenceId = [
  'FieldText',
  {
    name: 'referenceId',
    label: null,
    prefix: 'Air Miles Number:',
    // placeholder: 'eg. HSBC Air Miles number',
    suffix: (
      <Tooltip
        placement="topRight"
        title={
          <div style={{ padding: '0px 5px' }}>
            If you have a referral number, such as HSBC Air Miles number or
            similar, you may input it here.
          </div>
        }
      >
        <Icon type="question-circle" style={{ pointerEvents: 'all' }} />
      </Tooltip>
    ),
    skip: [userIsNotCustomer],
  },
]

export const fieldRecycleTagsCountTitle = [
  'FieldTitle',
  {
    title: 'Tags',
    skip: [userIsNotCustomer, viewerIsNotAdmin],
  },
]

export const fieldRecycleTagsCount = [
  'FieldTagsCount',
  {
    name: 'tagsCount',
    disabled: [() => true],
    skip: [userIsNotCustomer, viewerIsNotAdmin],
  },
]

export const fieldAddressTitle = [
  'FieldTitle',
  {
    title: 'Address',
    skip: [userIsNotCustomer],
  },
]

export const fieldAreaOverride = [
  'FieldConnectionSelect',
  {
    name: 'areaOverride',
    label: null,
    prefix: 'Override Area:',
    initialValue: null,
    formItemConfig: {
      style: {
        paddingBottom: '5px',
        marginBottom: '10px',
      },
    },
    searchPaths: ['name'],
    placeholder: 'Leave empty to base it on address pin',
    url: '/areas',
    allowClear: true,
    skip: [viewerIsNotAdmin, userIsNotCustomer],
  },
]

const GoogleMapArea = forwardRef(
  ({ area: areaInput, areas: areasInput, ...props }, ref) => {
    // const mapRef = useRef(null);
    // window.mapRef = mapRef;
    const polygonRef = useRef(null)
    const theme = useTheme()
    useEffect(() => {
      if (polygonRef.current) {
        polygonRef.current.forEach((polygon) => polygon.setMap(null))
        polygonRef.current = []
      }
      let areasToRender = areasInput || []
      if (areaInput) {
        areasToRender = [areaInput]
      }
      polygonRef.current = areasToRender.map((area) => {
        const polygon = new global.google.maps.Polygon({
          editable: false,
          draggable: false,
          options: { clickable: false },
          paths: area.polygon.coordinates[0].map(([lng, lat]) => ({
            lng,
            lat,
          })),
          fillColor: area.serviced ? theme.less.primaryColor : '#aaa',
          fillOpacity: area.serviced ? 0.3 : 0.3,
          // strokeColor: (
          //     area.serviced
          //   ? theme.less.primaryColor
          //   : '#aaa'
          // ),
          strokeWidth: 0,
          strokeWeight: 0,
          strokeOpacity: 0,
        })
        polygon.setMap(ref.current.mutable.map)
        return polygon
      })
      ref.current.mutable.map.setZoom(15)
    }, [ref, areaInput, areasInput, theme])
    return <GoogleMap ref={ref} {...props} />
  }
)

const GoogleMapAreaQuery = forwardRef(({ areaId, client, ...props }, ref) => (
  <Query
    skip={!areaId}
    client={client}
    url={areaId === 'ALL' ? 'areas' : `areas/${areaId}`}
  >
    {({ data }) => {
      const areas =
        areaId === 'ALL' && data && data.data && data.data.data
          ? data.data.data
          : null
      const area = areaId !== 'ALL' && data && data.data ? data.data : null
      return <GoogleMapArea ref={ref} area={area} areas={areas} {...props} />
    }}
  </Query>
))

export const fieldAddress = [
  'FieldGoogleAddress',
  {
    name: 'address',
    label: null,
    placeholder: 'Address',
    formItemConfig: { style: { marginBottom: '20px' } },
    rules: [['validation.isRequired']],
    skip: [userIsNotCustomer],
    initialValue: {
      coordinates: [55.23235540546874, 25.170403219172076],
    },
    initialMapConfig: {
      zoom: 15,
      mapId: 'f7b88d1b7848c940',
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
    },
    extraGeocodingParams: {
      componentRestrictions: {
        country: Types.COUNTRY,
      },
    },
    extraAutocompleteParams: {
      componentRestrictions: {
        country: Types.COUNTRY,
      },
    },
    postalCodeProps: null,
    cityProps: null,
    MapComponent: GoogleMapAreaQuery,
    getExtraMapProps: (props) => ({
      client: props.client,
      areaId: props.drawAllAreas ? 'ALL' : props.form.getFieldValue('area'),
    }),
  },
]

const AreaCheck = styled.p`
  font-size: 14px;
  line-height: 110%;
  opacity: 0.8;
`

export const fieldAreaCheck = [
  'FieldReact',
  {
    label: null,
    renderContent: (props) => {
      const tier = Types.CUSTOMER_TIER_MAP[props.form.getFieldValue('tier')]
      if (!tier || !tier.pickup) {
        return null
      }
      const areaOverride = props.form.getFieldValue('areaOverride')
      const address = props.form.getFieldValue('address')
      const coordinates =
        address && address.coordinates ? address.coordinates : null
      return (
        <Query
          url={
            areaOverride
              ? `areas/${areaOverride}`
              : `areas/coordinates?lng=${
                  coordinates ? coordinates[0] : 0
                }&lat=${coordinates ? coordinates[1] : 0}`
          }
          extractData={(response) => (response ? response.data : null)}
          skip={!areaOverride && !coordinates}
          client={props.client}
        >
          {({ loading, data }) => {
            if (loading) {
              return <AreaCheck {...(props.textProps || {})}>&nbsp;</AreaCheck>
            }
            if (
              (!loading && !data) ||
              (data && (!data.active || !data.serviced))
            ) {
              return (
                <AreaCheck {...(props.textProps || {})}>
                  At door pickups not available in this area yet.
                </AreaCheck>
              )
            }
            return null
          }}
        </Query>
      )
    },
  },
]

export const fieldCustomerBagsTitle = [
  'FieldTitle',
  {
    title: 'Bags',
    skip: [viewerIsNotAdmin, userIsNotCustomer, isNotEditActivity],
  },
]

export const fieldCustomerBags = [
  'FieldReact',
  {
    name: 'bags',
    virtual: true,
    skip: [viewerIsNotAdmin, userIsNotCustomer, isNotEditActivity],
    // eslint-disable-next-line arrow-body-style
    renderContent: ({ data, client, viewer }) => {
      const { _id: userId, bags = {} } = data
      return (
        <DataWrapper>
          {Types.BAGS_LIST.map(({ id, label, description, skip }) => {
            if (data && skip && skip(data)) {
              return null
            }
            if (!viewer || viewer.role !== 'ADMIN') {
              const { Icon: IconComponent } = BAGS_CONFIG[id] || {}
              return (
                <DataItemWrapper key={id} minWidth={80}>
                  <DataItemLabel>
                    {IconComponent ? <IconComponent /> : null}
                    &nbsp;
                    <DataItemLabelText>{label}</DataItemLabelText>
                  </DataItemLabel>
                  <DataItemValue>
                    <DataItemValueNumber value={bags[id] || 0}>
                      {Types.decimalizeInt(bags[id] || 0)}
                    </DataItemValueNumber>
                  </DataItemValue>
                </DataItemWrapper>
              )
            }
            return (
              <DataItemBags
                key={id}
                id={id}
                userId={userId}
                label={label}
                value={bags[id] || 0}
                client={client}
              />
            )
          })}
        </DataWrapper>
      )
    },
  },
]

export const fieldPointsTitle = [
  'FieldTitle',
  {
    title: 'Points',
  },
]

export const fieldPoints = [
  'FieldReact',
  {
    name: 'points',
    virtual: true,
    // eslint-disable-next-line arrow-body-style
    renderContent: ({ viewer, data: { categories = {}, points } }) => (
      <Points viewer={viewer} categories={categories} points={points} />
    ),
  },
]

export const DriverRoutesTable = styled(Table)`
  .ant-table {
    border: 0px !important;
  }
  .ant-table-body {
    margin: 0px !important;
  }
`

export function DriverRoutes({ data, ...props }) {
  const dataSource = useMemo(
    () => (data && data.data && data.data.data ? data.data.data : []),
    [data]
  )
  const columns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: '_id',
        render: (id) => (
          <Link to={`/routes/${id}`}>
            <code>{id.slice(-8).toUpperCase()}</code>
          </Link>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render: (text, record) =>
          record.completed
            ? 'Complete'
            : record.started
              ? 'Started'
              : 'Scheduled',
      },
      {
        title: 'Starts',
        dataIndex: 'startsAt',
        render: (startsAt) =>
          moment(startsAt).tz(Types.TIMEZONE).calendar({
            sameDay: '[Today] [at] hh:mm a',
            nextDay: '[Tomorrow] [at] hh:mm a',
            nextWeek: 'dddd [at] hh:mm a',
            lastDay: '[Yesterday]',
            lastWeek: '[Last] dddd',
            sameElse: 'MMMM Do [at] hh:mm a',
          }),
      },
    ],
    []
  )
  return (
    <DriverRoutesTable
      rowKey="_id"
      columns={columns}
      dataSource={dataSource}
      showHeader={false}
      pagination={false}
      size="small"
      bordered={false}
      {...props}
    />
  )
}

export const fieldDriverRoutesTitle = [
  'FieldTitle',
  {
    title: 'Routes',
    skip: [userIsNotDriver, isNotEditActivity],
  },
]

export const fieldDriverRoutes = [
  'FieldReact',
  {
    label: null,
    skip: [userIsNotDriver, isNotEditActivity],
    // eslint-disable-next-line arrow-body-style
    renderContent: (props) => {
      return (
        <Query
          client={props.client}
          url={`routes?query=${btoa(
            JSON.stringify({
              where: {
                driver:
                  props.viewer.role === Types.USER_ROLE_CONST.DRIVER
                    ? props.viewer._id
                    : props.data.role === Types.USER_ROLE_CONST.DRIVER
                      ? props.data._id
                      : null,
              },
              sort: {
                started: 1,
                completed: 1,
                startsAt: -1,
                createdAt: -1,
              },
              limit: 5,
            })
          )}`}
        >
          {/* eslint-disable-next-line arrow-body-style */}
          {({ data }) => {
            return <DriverRoutes data={data} />
            // return (
            //   <pre>
            //     <code>
            //       {JSON.stringify(data, null, '  ')}
            //     </code>
            //   </pre>
            // );
          }}
        </Query>
      )
    },
  },
]

export const fieldSorterReportAction = [
  'FieldReact',
  {
    label: null,
    renderContent: (props) => (
      <SorterReportAction sorter={props.data._id} client={props.client} />
    ),
    skip: [isNotEditActivity, userIsNotSorter],
  },
]

export const fieldNotificationsTitle = [
  'FieldTitle',
  {
    title: 'Notifications',
    skip: [userIsNotAdmin],
    // style: { marginTop: '10px' },
  },
]

export const fieldNotificationsSignup = [
  'FieldSwitch',
  {
    name: 'notifications.signup',
    label: null,
    inlineLabelBefore: 'New signups',
    skip: [userIsNotAdmin],
  },
]

export const fieldNotificationsTagsFirstOrder = [
  'FieldSwitch',
  {
    name: 'notifications.tagsFirstOrder',
    label: null,
    inlineLabelBefore: 'First Tags Order',
    skip: [userIsNotAdmin],
  },
]

export const fieldNotificationsTagsOrder = [
  'FieldSwitch',
  {
    name: 'notifications.tagsOrder',
    label: null,
    inlineLabelBefore: 'Tags Order',
    skip: [userIsNotAdmin],
  },
]

export const fieldPasswordTitle = [
  'FieldTitle',
  {
    title: 'Password',
    skip: [skipPassword],
    // style: { marginTop: '10px' },
  },
]

const isCardNew = ['condition.testFieldValue', 'new', '==', true]

const isCardNotNew = ['condition.not', isCardNew]

const FieldCardsNewCardModal = ({ card, reload, onCancel, ...props }) => {
  const iframeListener = useCallback(
    (event) => {
      // if (event.origin === window.location.origin) {
      try {
        const [name, data] = JSON.parse(event.data)
        // eslint-disable-next-line no-console
        console.log('message:', name, data)
        if (data && data.success) {
          Admin.showMessage('Card added successfully.', 'success', 5)
        } else {
          Admin.showMessage('Error adding card, please try again', 'error', 5)
        }
        reload()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('message error:', error, event.data)
        reload()
      }
      // }
    },
    [reload]
  )
  useEffect(() => {
    window.addEventListener('message', iframeListener)
    return () => {
      window.removeEventListener('message', iframeListener)
    }
  }, [iframeListener])
  if (!card) {
    return null
  }
  return (
    <CheckoutRedirectModal
      visible={!!card.checkoutRedirect}
      title="Checkout Validation"
      footer={null}
      centered
      width="calc(100vw - 40px)"
      height="calc(100vh - 40px)"
      onCancel={onCancel}
    >
      {card.checkoutRedirect ? (
        <iframe
          title="Checkout Validation"
          width="100%"
          height="100%"
          // frameBorder={0}
          // scrolling="no"
          src={card.checkoutRedirect}
        />
      ) : null}
    </CheckoutRedirectModal>
  )
}

const FieldCardFieldPresentationOnlyWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -20px;
  padding-bottom: 20px;
  p {
    margin-bottom: 0px;
  }
  > span:nth-child(1) {
    text-align: left;
    font-weight: 400;
    font-size: 28px;
  }
  > span:nth-child(2) {
    display: block;
    text-align: right;
    p {
      text-align: right;
    }
  }
`

const FieldCardField = (props) => {
  const [card, setCard] = useState(props.data)
  const addCardAction = useMemo(
    () =>
      Admin.compileFromLibrary([
        'ActionWithRequest',
        {
          title: 'Add Card',
          renderAction: (actionProps, instance) =>
            React.cloneElement(instance.renderAction(actionProps), {
              style: { marginBottom: '20px', width: '100%' },
            }),
          processAction: async (actionProps) => {
            const data = {}
            const frames =
              await actionProps.checkoutCardInputRef.current.getFrames()
            if (!frames) {
              throw new Error('Cannot process cards at this moment')
            }
            if (!frames.cardholder) {
              frames.cardholder = {}
            }
            frames.cardholder.name = [card.firstName, card.lastName]
              .filter((part) => part && part.trim().length > 0)
              .join(' ')
            frames.cardholder.billingAddress = {
              addressLine1: card.addressLine1 || undefined,
              addressLine2: card.addressLine2 || undefined,
              city: card.city || undefined,
              country: card.country?.toUpperCase() || 'AE',
            }
            try {
              frames.enableSubmitForm()
              const checkoutResult = await frames.submitCard()
              data.token = checkoutResult.token
              return await actionProps
                .issueRequest(actionProps, {
                  url: `users/${
                    actionProps?.match?.params?.id || 'me'
                  }/add-card`,
                  method: 'POST',
                  data: JSON.stringify(data),
                })
                .then((response) => {
                  setCard({ ...response.data, new: true })
                })
            } catch (error) {
              if (isString(error)) {
                // eslint-disable-next-line no-ex-assign
                error = new Error(error)
              }
              throw error
            }
          },
        },
      ]),
    [
      card?.firstName,
      card?.lastName,
      card?.addressLine1,
      card?.addressLine2,
      card?.country,
      card?.city,
    ]
  )
  if (!card) {
    return null
  }
  return (
    <>
      {card.checkoutRedirect ? (
        <FieldCardsNewCardModal
          {...props}
          onCancel={() => setCard(props.data)}
          card={card}
        />
      ) : !card.new ? (
        card.id ? (
          <FieldCardFieldPresentationOnlyWrapper>
            <span>
              <p>{`${card.scheme}`}</p>
            </span>
            <span>
              <p>{`**** **** **** ${card.last4}`}</p>
              <p>
                {`${padStart(
                  `${card.expiryMonth}`.slice(-2),
                  2,
                  '0'
                )}/${padStart(`${card.expiryYear}`.slice(-2), 2, '0')}`}
              </p>
            </span>
          </FieldCardFieldPresentationOnlyWrapper>
        ) : (
          <h2>Failed</h2>
        )
      ) : (
        addCardAction.render(props)
      )}
    </>
  )
}

export const fieldCardsTitle = [
  'FieldTitle',
  {
    // eslint-disable-next-line arrow-body-style
    title: (props) => {
      const dateMoment = moment()
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span>Payment</span>
          {props.data?._id && props.viewer?.role === 'ADMIN' ? (
            <>
              &nbsp;
              <a
                target="_blank"
                rel="noreferrer"
                style={{
                  marginBottom: '10px',
                }}
                href={`${
                  process.env.REACT_APP_CHECKOUT_URL
                }/payments/all-payments?${stringifyQuery({
                  customer: `${props.data?._id}@id.customer.reecycle.app`,
                  date: `${dateMoment
                    .clone()
                    .subtract(6, 'month')
                    .format('YYYYMMDD')}..${dateMoment.format('YYYYMMDD')}`,
                })}`}
              >
                <Button>Open Payments</Button>
              </a>
            </>
          ) : null}
        </div>
      )
    },
    skip: [isNotEditActivity, userIsNotCustomer],
  },
]

export const fieldTierDiscountCode = [
  'FieldConnectionSelect',
  {
    name: 'tierDiscountCode',
    label: null,
    prefix: 'Discount Code:',
    url: '/discountcodes',
    allowClear: true,
    searchPaths: ['code', 'description'],
    extraQuerySortProps: { code: 1 },
    getChoiceLabel: (choice) =>
      `${choice.data.code} (${choice.data.description})`,
    hidden: [viewerIsNotAdmin],
    virtual: [viewerIsNotAdmin],
    disabled: [viewerIsNotAdmin],
  },
]

export const fieldCards = [
  'FieldSortableList',
  {
    name: 'cards',
    label: null,
    addButtonLabel: 'Add Card',
    maxCount: 1,
    // eslint-disable-next-line arrow-body-style
    generateNewItem: (props, input) => {
      const name = props.form?.getFieldValue('name') || ''
      return {
        new: true,
        firstName: name.split(/\s+/)[0],
        lastName: name.split(/\s+/)[1],
        country: 'ae',
        city: props.form.getFieldValue('address')?.city,
        addressLine1: props.form.getFieldValue('address')?.line1,
        addressLine2: props.form.getFieldValue('address')?.line2,
      }
    },
    renderAddButton: (props, field) => {
      const button = FieldSortableList.config.renderAddButton(props, field)
      return React.cloneElement(button, { style: { width: '100%' } })
    },
    fields: [
      [
        'FieldHidden',
        {
          name: 'new',
          initialValue: false,
        },
      ],
      [
        'FieldText',
        {
          name: 'firstName',
          label: null,
          prefix: 'Fist Name:',
          rules: [['validation.isRequired']],
          col: { span: 12 },
          skip: [isCardNotNew],
        },
      ],
      [
        'FieldText',
        {
          name: 'lastName',
          label: null,
          prefix: 'Last Name:',
          rules: [['validation.isRequired']],
          col: { span: 12 },
          skip: [isCardNotNew],
        },
      ],
      [
        'FieldSelect',
        {
          name: 'country',
          label: null,
          prefix: 'Country:',
          choices: Types.COUNTRIES.map(({ name, iso3a2 }) => ({
            label: name,
            value: iso3a2,
          })),
          rules: [['validation.isRequired']],
          col: { span: 12 },
          skip: [isCardNotNew],
        },
      ],
      [
        'FieldText',
        {
          name: 'city',
          label: null,
          prefix: 'City:',
          col: { span: 12 },
          skip: [isCardNotNew],
        },
      ],
      [
        'FieldText',
        {
          name: 'addressLine1',
          label: null,
          prefix: 'Address Line 1:',
          skip: [isCardNotNew],
        },
      ],
      [
        'FieldText',
        {
          name: 'addressLine2',
          label: null,
          prefix: 'Address Line 2:',
          skip: [isCardNotNew],
        },
      ],
      [
        'FieldCheckoutCard',
        {
          name: 'frames',
          checkoutPublicKey: process.env.REACT_APP_CHECKOUT_PUBLIC_KEY,
          label: null,
          style: {
            marginTop: '10px',
            marginBottom: '12px',
          },
          skip: [isCardNotNew],
        },
      ],
      // ['FieldReact', {
      //   name: 'submitCard',
      //   label: null,
      //   renderContent: (props) => {
      //     console.log(props.data);
      //     const card = props.data;
      //   },
      //   skip: [isCardNotNew],
      // }],
      [
        'FieldReact',
        {
          label: null,
          virtual: [() => true],
          renderContent: (props) => <FieldCardField {...props} />,
        },
      ],
    ],
    skip: [isNotEditActivity, userIsNotCustomer],
  },
]

export const fieldPassword = [
  'FieldText',
  {
    name: 'password',
    label: null,
    prefix: 'Password:',
    type: 'password',
    autoComplete: 'new-password',
    rules: [['validation.isPassword']],
    skip: [skipPassword],
    col: { xs: 24, md: 12 },
  },
]

export const fieldConfirmPassword = [
  'FieldText',
  {
    name: 'confirmPassword',
    label: null,
    prefix: 'Confirm:',
    type: 'password',
    rules: [['validation.isPasswordSame']],
    skip: [skipPassword],
    col: { xs: 24, md: 12 },
    virtual: true,
  },
]

export const ADMIN_ALL = [
  fieldAvatar,
  fieldName,
  fieldEmail,
  fieldPhoneNumber,
  fieldReferenceId,
  fieldRole,
  fieldNotificationsTitle,
  fieldNotificationsSignup,
  fieldNotificationsTagsFirstOrder,
  fieldNotificationsTagsOrder,
  fieldTierTitle,
  fieldTier,
  fieldTierStatus,
  [
    'ActionWithRequest',
    {
      name: 'action-pay-now',
      title: 'Pay Now!',
      block: true,
      style: { width: '100%' },
      getRequestConfig: (props) => ({
        url: `users/${props.data._id}/tier/pay`,
        method: 'POST',
      }),
      skip: [
        isNotEditActivity,
        userIsNotCustomer,
        (props) =>
          !props.data?.card || props.data?.tierStatus?.payable !== true,
      ],
      disabled: [
        (props) => props.data?.tier !== props?.form?.getFieldValue('tier'),
      ],
      handleSuccess: (data, props) => props.reload(),
    },
  ],
  fieldCardsTitle,
  fieldTierDiscountCode,
  fieldCards,
  fieldRecycleTagsCountTitle,
  fieldRecycleTagsCount,
  fieldAddressTitle,
  fieldAreaOverride,
  [
    fieldAddress[0],
    {
      ...fieldAddress[1],
      drawAllAreas: true,
    },
  ],
  [
    fieldAreaCheck[0],
    {
      ...fieldAreaCheck[1],
      formItemConfig: { style: { marginTop: '-15px' } },
    },
  ],
  fieldCustomerBagsTitle,
  fieldCustomerBags,
  [
    fieldPointsTitle[0],
    {
      ...fieldPointsTitle[1],
      skip: skipPoints,
    },
  ],
  [
    fieldPoints[0],
    {
      ...fieldPoints[1],
      skip: skipPoints,
    },
  ],
  fieldDriverRoutesTitle,
  fieldDriverRoutes,
  fieldSorterReportAction,
  fieldPasswordTitle,
  fieldPassword,
  fieldConfirmPassword,
]
