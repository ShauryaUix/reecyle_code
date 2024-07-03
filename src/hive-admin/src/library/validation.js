import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import Admin from '../components/Admin'
;[
  'string',
  'number',
  'boolean',
  'method',
  'regexp',
  'integer',
  'float',
  'array',
  'object',
  'enum',
  'date',
  'url',
  'hex',
  'email',
].forEach((type) =>
  Admin.addToLibrary(
    `validation.is${type[0].toUpperCase()}${type.slice(1)}`,
    ({ name = 'This field', ...restConfig } = {}) => ({
      type,
      message: `${name} must be ${/^[aeiou]/i.test(type) ? 'an' : 'a'} ${type}`,
      ...restConfig,
    })
  )
)

Admin.addToLibrary(
  'validation.isRequired',
  ({ name = 'This field', ...restConfig } = {}) => ({
    required: true,
    message: `${name} is required`,
    ...restConfig,
  })
)

Admin.addToLibrary(
  'validation.isPasswordSame',
  ({ as = 'password', ...restConfig } = {}) =>
    (props) => ({
      validator: (rule, value, cb) =>
        `${value}` === `${props.form.getFieldValue(as)}`
          ? cb()
          : cb(rule.message),
      message: 'Passwords do not match!',
      ...restConfig,
    })
)

Admin.addToLibrary('validation.isPassword', (config = {}) => ({
  type: 'string',
  min: 6,
  message: 'Valid password of at least 6 characters is required',
  ...config,
}))

Admin.addToLibrary('validation.isName', (config = {}) => ({
  min: 1,
  message: 'Valid name is required',
  whitespace: true,
  ...config,
}))

Admin.addToLibrary('validation.isUsername', (config = {}) => ({
  min: 1,
  message: 'Valid username is required',
  whitespace: true,
  ...config,
}))

Admin.addToLibrary('validation.isArray', (config = {}) => (/* props */) => ({
  validator: (rule, value, cb) => cb(isArray(value) ? undefined : rule.message),
  message: 'Field must be an Array!',
  ...config,
}))

Admin.addToLibrary('validation.isObject', (config = {}) => (/* props */) => ({
  validator: (rule, value, cb) =>
    cb(isObject(value) ? undefined : rule.message),
  message: 'Field must be an Object!',
  ...config,
}))
