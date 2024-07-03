import { customAlphabet } from 'nanoid'
import isUndefined from 'lodash/isUndefined'

import COUNTRIES from '../assets/countries.json'
import CATEGORIES from './categories.json'

const Types = {}

Types.SERVER_URL = `${
  process.env.SERVER_PROTOCOL || process.env.REACT_APP_SERVER_PROTOCOL
}://${process.env.SERVER_HOST || process.env.REACT_APP_SERVER_HOST}${
  (process.env.SERVER_PROTOCOL || process.env.REACT_APP_SERVER_PROTOCOL) !==
  'https'
    ? `:${process.env.HTTP_PORT || process.env.REACT_APP_HTTP_PORT}`
    : ''
}`

Types.HOME_URL = process.env.HOME_URL || process.env.REACT_APP_HOME_URL
Types.PLATFORM_URL =
  process.env.PLATFORM_URL || process.env.REACT_APP_PLATFORM_URL

Types.COUNTRIES = COUNTRIES

Types.COUNTRIES_MAP = COUNTRIES.reduce((agr, country) => {
  agr[country.iso3a2] = country
  return agr
}, {})

Types.COUNTRIES_DIAL_CODES = Types.COUNTRIES.reduce((agr, country) => {
  country.dialCodes.forEach((dialCode, i) => {
    agr.push({
      value: dialCode,
      label: `+${dialCode} (${country.name})${i > 0 ? ` ${i}` : ''}`,
    })
  })
  return agr
}, [])

Types.COUNTRY = 'ae'
Types.CURRENCY = 'AED'

Types.COUNTRY_NAME = Types.COUNTRIES_MAP[Types.COUNTRY].name

Types.TIMEZONE = 'Asia/Dubai'

Types.ROUTE_START = {
  lat: 25.238648,
  lng: 55.281877,
}

Types.ROUTE_END = {
  lat: 25.2094406,
  lng: 55.2388469,
}

Types.decimalize = (
  number,
  decimalSeparator = '.',
  rounding = 2,
  thousandSeparator
) => {
  if (isUndefined(thousandSeparator)) {
    thousandSeparator = decimalSeparator === '.' ? ',' : '.'
  }
  return number
    .toFixed(rounding)
    .split('')
    .reverse()
    .join('')
    .split('.')
    .map((value, i, values) =>
      (values.length === 2 && i === 1) || i === 0
        ? value
            .replace(/(.{3})/g, `$1${thousandSeparator}`)
            .replace(new RegExp(`\\${thousandSeparator}$`, 'g'), '')
        : value
    )
    .join(decimalSeparator)
    .split('')
    .reverse()
    .join('')
}

Types.decimalizeInt = (number, decimalSeparator) =>
  Types.decimalize(number, decimalSeparator, 0)

Types.getRoundedAmount = (amount, rounding = 2) =>
  Math.ceil(amount * 10 ** rounding) / 10 ** rounding

Types.createConstant = (valuesArray) =>
  valuesArray.reduce((agr, value) => {
    agr[value] = value
    return agr
  }, {})

Types.createValues = (
  name,
  values = [],
  {
    keyId = 'id',
    getId = (value) => value[keyId],
    keyLabel = 'label',
    getLabel = (value) => value[keyLabel],
  } = {}
) =>
  values.reduce((agr, value) => {
    const id = getId(value)
    const label = getLabel(value)
    agr[name] = agr[name] || []
    agr[name].push(id)
    const nameList = `${name}_LIST`
    agr[nameList] = agr[nameList] || []
    agr[nameList].push(value)
    const nameMap = `${name}_MAP`
    agr[nameMap] = agr[nameMap] || {}
    agr[nameMap][id] = value
    const nameLabels = `${name}_LABELS`
    agr[nameLabels] = agr[nameLabels] || []
    agr[nameLabels].push(label)
    const nameLabelsMap = `${name}_LABELS_MAP`
    agr[nameLabelsMap] = agr[nameLabelsMap] || {}
    agr[nameLabelsMap][id] = label
    const nameConstants = `${name}_CONST`
    agr[nameConstants] = agr[nameConstants] || {}
    agr[nameConstants][id] = id
    return agr
  }, {})

Types.CONSTANTS = {}

Types.BAG_VOLUME = 60

Object.assign(
  Types,
  Types.createValues('USER_ROLE', [
    {
      id: 'ADMIN',
      label: 'Admin',
    },
    {
      id: 'CUSTOMER',
      label: 'Customer',
    },
    {
      id: 'DRIVER',
      label: 'Driver',
    },
    {
      id: 'SORTER',
      label: 'Sorter',
    },
  ]),
  Types.createValues(
    'CUSTOMER_TIER',
    [
      {
        id: 'REGULAR',
        label: 'Basic',
        dropoff: true,
        pickup: false,
        free: true,
      },
      {
        id: 'PRO',
        label: 'Pro',
        dropoff: true,
        pickup: false,
        hidden: true,
      },
      {
        id: 'PREMIUM',
        label: 'VIP',
        star: true,
        dropoff: true,
        pickup: true,
      },
    ].map((config) => ({
      free: false,
      star: false,
      dropoff: true,
      pickup: false,
      hidden: false,
      paymentPeriodUnit: 'month',
      paymentPeriodCount: 1,
      ...config,
    }))
  ),
  Types.createValues('ACCESS_TOKEN_TYPE', [
    {
      id: 'User',
      label: 'User',
    },
  ]),
  Types.createValues('CATEGORIES', CATEGORIES),
  Types.createValues('BAGS', [
    {
      id: 'pending',
      label: 'Pending',
      description: 'Awaiting pickup.',
      skip: (user) => !user || !user.tierSupportsPickup,
    },
    {
      id: 'dropped',
      label: 'Dropped',
      description: 'Left in the Ree® Cage.',
    },
    {
      id: 'sorting',
      label: 'Sorting',
      description: 'Picked up and sent to sorting.',
      skip: (user) => !user || !user.tierSupportsPickup,
    },
    {
      id: 'sorted',
      label: 'Sorted',
      description: 'Awarded and sent to recycling.',
    },
  ]),
  Types.createValues('CATEGORY_UNITS', [
    {
      id: 'KILOGRAM',
      label: 'Kilograms',
      unit: 'kg',
      unitShort: 'kg',
      quantifiable: true,
    },
    {
      id: 'GRAM',
      label: 'Grams',
      unit: 'g',
      unitShort: 'g',
      quantifiable: true,
    },
    {
      id: 'POINT',
      label: 'Points',
      unit: 'points',
      unitShort: 'p',
      quantifiable: false,
    },
  ]),
  Types.createValues('LOG_ENTRY_TYPES', [
    {
      id: 'SORT',
      label: 'Sort',
    },
  ]),
  Types.createValues('COUPON_TYPES', [
    {
      //   id: 'QRCODE',
      //   label: 'QR Code',
      //   type: 'QRCODE',
      //   generate: (createNanoId => (
      //     () => `${createNanoId()}`
      //   ))(customAlphabet([
      //     ...(new Array(10).fill(0).map((_, i) => `${i}`)), // 0-9
      //     ...(new Array(26).fill(0).map((_, i) => String.fromCharCode(65 + i))), // A-Z
      //   ].join(''), 24)),
      // }, {
      id: 'TEXT',
      label: 'Textual Code',
      type: 'TEXT',
      generate: (
        (createNanoId) =>
        (partSize = 5, partCount = 3, glue = '-') =>
          new Array(partCount)
            .fill(0)
            .map(() => createNanoId(partSize))
            .join(glue)
      )(
        customAlphabet(
          [
            ...new Array(10).fill(0).map((_, i) => `${i}`), // 0-9
            ...new Array(26).fill(0).map((_, i) => String.fromCharCode(65 + i)), // A-Z
          ].join(''),
          5
        )
      ),
    },
    {
      id: 'BARCODE_EAN13',
      label: 'Barcode (EAN13)',
      type: 'BARCODE',
      format: 'EAN13',
      generate: ((createNanoId) => () => {
        const code = createNanoId()
        let checksum = 0
        for (let i = 0; i < code.length; i++) {
          const position = i + 1
          const value = parseInt(code[i], 10)
          if (position % 2 === 0) {
            checksum += value * 3
          } else {
            checksum += value
          }
        }
        checksum %= 10
        if (checksum > 0) {
          checksum = 10 - checksum
        }
        return `${code}${checksum}`
      })(
        customAlphabet(
          [
            ...new Array(10).fill(0).map((_, i) => `${i}`), // 0-9
          ].join(''),
          12
        )
      ),
    },
    {
      id: 'BARCODE_CODE128',
      label: 'Barcode (CODE128)',
      type: 'BARCODE',
      format: 'CODE128',
      generate: (
        (createNanoId) => () =>
          createNanoId()
      )(
        customAlphabet(
          [
            ...new Array(10).fill(0).map((_, i) => `${i}`), // 0-9
            ...new Array(26).fill(0).map((_, i) => String.fromCharCode(65 + i)), // A-Z
          ].join(''),
          10
        )
      ),
    },
    {
      id: 'BARCODE_CODE39',
      label: 'Barcode (CODE39)',
      type: 'BARCODE',
      format: 'CODE39',
      generate: (
        (createNanoId) => () =>
          createNanoId()
      )(
        customAlphabet(
          [
            ...new Array(10).fill(0).map((_, i) => `${i}`), // 0-9
            ...new Array(26).fill(0).map((_, i) => String.fromCharCode(65 + i)), // A-Z
          ].join(''),
          5
        )
      ),
    },
    {
      id: 'BARCODE_UPC',
      label: 'Barcode (UPC)',
      type: 'BARCODE',
      format: 'UPC',
      generate: ((createNanoId) => () => {
        const code = `4${createNanoId()}`
        let checksum = 0
        for (let i = 0; i < code.length; i++) {
          const position = i + 1
          const value = parseInt(code[i], 10)
          if (position % 2 === 0) {
            checksum += value
          } else {
            checksum += value * 3
          }
        }
        checksum %= 10
        if (checksum > 0) {
          checksum = 10 - checksum
        }
        return `${code}${checksum}`
      })(
        customAlphabet(
          [
            ...new Array(10).fill(0).map((_, i) => `${i}`), // 0-9
          ].join(''),
          10
        )
      ),
    },
  ]),
  Types.createValues('COUPON_COLOR_STYLES', [
    {
      id: 0,
      label: 'Solid',
    },
    {
      id: 1,
      label: 'Gradient',
    },
  ])
)

Types.CUSTOMER_TIER_NOT_FREE = Types.CUSTOMER_TIER_LIST.reduce(
  (agr, { id, free }) => {
    if (!free) {
      agr.push(id)
    }
    return agr
  },
  []
)

Object.assign(Types.CONSTANTS, {})

export default Types
