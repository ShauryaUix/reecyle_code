import Admin from './Admin'
import FieldText from './FieldText'

import Input from './Input/Input'

export default class FieldTextArea extends FieldText {
  static config = {
    ...FieldText.config,
    Component: Input.TextArea,
  }

  static inputPropsMap = {
    ...FieldText.inputPropsMap,
    autoSize: true,
  }
}

Admin.addToLibrary('FieldTextArea', (config = {}) =>
  FieldTextArea.create(config)
)
