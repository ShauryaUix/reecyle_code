import Switch from 'antd/lib/switch'
import Admin from './Admin'
import Field from './Field'

export default class FieldSwitch extends Field {
  static config = {
    ...Field.config,
    Component: Switch,
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    checked: true,
    value: true,
  }

  renderInput(props) {
    return [
      this.renderInlineLabel('before'),
      super.renderInput({
        ...props,
        checked: props.value,
      }),
      this.renderInlineLabel('after'),
    ]
  }
}

Admin.addToLibrary('FieldSwitch', (config) => FieldSwitch.create(config))
