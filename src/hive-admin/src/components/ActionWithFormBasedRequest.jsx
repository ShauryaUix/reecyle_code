/* global FormData */

import setKey from 'lodash/set'
import isArray from 'lodash/isArray'
import isUndefined from 'lodash/isUndefined'
import ActionWithRequest from './ActionWithRequest'

import Admin from './Admin'

export default class ActionWithFormBasedRequest extends ActionWithRequest {
  static config = {
    ...ActionWithRequest.config,
    disabled: [
      ['condition.isLoading'],
      ['not', ['condition.anyFieldTouched']],
      ['condition.anyFieldHasError'],
    ],
    prepareJSONValues: (values, props) => values, // eslint-disable-line no-unused-vars
    prepareFormValues: (values, props) => values, // eslint-disable-line no-unused-vars
    validationOptions: { force: true },
    getValidationOptions: (props) => props.validationOptions,
    serializeValues: (values, props) => {
      let json = {}
      const files = []
      ;(props.fields || []).forEach((field) => {
        if (!field.isVirtual || field.isVirtual({ ...props, ...field })) {
          return
        }
        const key = field.name
        const value = props.form.getFieldValue(field.name)
        if (!isUndefined(value) && (field.sendEmpty || value !== '')) {
          if (field.isUpload) {
            const uploads = isArray(value) ? value : [value]
            if (uploads[0] === null) {
              setKey(json, key, null)
            } else {
              uploads.forEach((file) => {
                if (file.blob) {
                  files.push({ key, value: file.blob })
                }
              })
            }
          } else {
            setKey(json, key, value)
          }
        }
      })
      json = props.prepareJSONValues(json, props)
      if (files.length) {
        let form = new FormData()
        form.append('data', JSON.stringify(json))
        files.forEach((item) => form.append(item.key, item.value))
        form = props.prepareFormValues(form, props)
        return form
      }
      return json
    },
    getRequestConfig: (props, data) => ({
      url: props.url,
      method: props.method,
      data,
    }),
    validateForm: (props, options = {}) =>
      new Promise((resolve) => {
        props.form.validateFields(options, (errors, values) => {
          resolve({
            errors,
            values: Object.keys(values).reduce((agr, key) => {
              const field = props.fields.find((test) => test.name === key)
              if (
                field &&
                (!field.isVirtual || !field.isVirtual({ ...props, ...field }))
              ) {
                agr[key] = values[key]
              }
              return agr
            }, {}),
          })
        })
      }),
    processAction: (props) =>
      props
        .validateForm(props, props.getValidationOptions(props))
        .then(({ errors, values }) => {
          if (errors) {
            throw new Error('Check the fields and try again!')
          }
          return props.serializeValues(values, props)
        })
        .then((data) =>
          props
            .issueRequest(props, props.getRequestConfig(props, data))
            .then((response) => response.data)
        ),
  }
}

Admin.addToLibrary('ActionWithFormBasedRequest', (config) =>
  ActionWithFormBasedRequest.create(config)
)
