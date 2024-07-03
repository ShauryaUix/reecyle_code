import isString from 'lodash/isString'
import getKey from 'lodash/get'
import { isFunction } from 'util'

import Admin from '../components/Admin'

const createMultiTestCondition = (value) => (tests) => {
  const compiledTests = Admin.compileFromLibrary(tests, true)
  return (...args) => {
    for (let i = 0; i < compiledTests.length; i++) {
      if (!!compiledTests[i](...args) === value) {
        return value
      }
    }
    return !value
  }
}

Admin.addToLibrary('condition.and', createMultiTestCondition(false))
Admin.addToLibrary('condition.or', createMultiTestCondition(true))
Admin.addToLibrary('condition.not', (test) => {
  const compiledTest = Admin.compileFromLibrary(test, false)
  return (...args) => !compiledTest(...args)
})

Admin.addToLibrary('and', Admin.getFromLibrary('condition.and'))
Admin.addToLibrary('or', Admin.getFromLibrary('condition.or'))
Admin.addToLibrary('not', Admin.getFromLibrary('condition.not'))

Admin.addToLibrary(
  'condition.check',
  ({ path1, value1, path2, value2, op = '===' } = {}) =>
    (props) => {
      const v1 = isString(path1) ? getKey(props, path1) : value1
      const v2 = isString(path2) ? getKey(props, path2) : value2
      if (isFunction(op)) {
        return !!op(v1, v2)
      }
      switch (op) {
        case '===':
          return v1 === v2
        case '!==':
          return v1 !== v2
        case '==':
          return v1 == v2 // eslint-disable-line eqeqeq
        case '>=':
          return v1 >= v2
        case '<=':
          return v1 <= v2
        case '>':
          return v1 > v2
        case '<':
          return v1 > v2
        default:
          throw new Error(`Invalid "condition.check" op: "${op}"`)
      }
    }
)

Admin.addToLibrary(
  'condition.isLoading',
  ({ path = 'loading' } = {}) =>
    (props) =>
      !!getKey(props, path)
)

Admin.addToLibrary(
  'condition.anyFieldTouched',
  ({ formPath = 'form' } = {}) =>
    (props) => {
      const form = getKey(props, formPath)
      if (form) {
        return !!form.isFieldsTouched()
      }
      return false
    }
)

Admin.addToLibrary(
  'condition.anyFieldHasError',
  ({ formPath = 'form' } = {}) =>
    (props) => {
      const form = getKey(props, formPath)
      if (form) {
        return (
          props.fields.findIndex((field) => !!form.getFieldError(field.name)) >
          -1
        )
      }
      return false
    }
)

Admin.addToLibrary('condition.testFieldValue', (field, op, value) => {
  const check = Admin.createFromLibrary('condition.check', {
    path1: field,
    op,
    value2: value,
  })
  return (props) => check({ [field]: props.form.getFieldValue(field) })
})

Admin.addToLibrary('condition.checkViewer', (key, op, value) => {
  const check = Admin.createFromLibrary('condition.check', {
    path1: key,
    op,
    value2: value,
  })
  return (props) => check(props.viewer || {})
})
