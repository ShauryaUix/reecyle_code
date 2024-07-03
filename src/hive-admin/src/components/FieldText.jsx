import isNumber from 'lodash/isFinite'

import Admin from './Admin'
import Field from './Field'

import Input from './Input/Input'

const NUMBER_REGEX = /(?:^-0?$)|(?:\.$)|(?:\..*0+$)/

export default class FieldText extends Field {
  static config = {
    ...Field.config,
    Component: Input,
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    id: true,
    type: true,
    addonAfter: true,
    addonBefore: true,
    prefix: true,
    suffix: true,
    onPressEnter: true,
    autosize: true,
    enterButton: true,
    compact: true,
    autoComplete: true,
    align: true,
    inputMode: true,
  }

  renderInput(props) {
    if (props.type === 'number') {
      if (props.onChange) {
        const originalOnChange = props.onChange
        if (props.type === 'number') {
          props.onChange = (event) => {
            const numberValue = NUMBER_REGEX.test(event.target.value || '')
              ? NaN
              : parseFloat(event.target.value, 10)
            originalOnChange({
              target: {
                value: isNumber(numberValue) ? numberValue : event.target.value,
              },
            })
          }
        }
      }
      const numberValue = NUMBER_REGEX.test(props.value || '')
        ? NaN
        : parseFloat(props.value, 10)
      props.value = isNumber(numberValue) ? numberValue : props.value
    }
    return super.renderInput({
      ...props,
      type: props.type === 'number' ? 'text' : props.type,
    })
  }
}

Admin.addToLibrary('FieldText', (config) => FieldText.create(config))
