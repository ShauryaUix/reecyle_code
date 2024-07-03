import Admin from './Admin'
import FieldCodeEditor from './FieldCodeEditor'

export default class FieldJSON extends FieldCodeEditor {
  static config = {
    ...FieldCodeEditor.config,
    mode: 'json',
    initialValue: [],
  }

  constructor(props) {
    super(props)
    this.state = this.state || {}
    this.state.value = JSON.stringify(this.props.value, null, 2)
    this.state.inputHandled = true
  }

  componentWillReceiveProps(props) {
    if (!this.state.inputHandled) {
      try {
        this.setState({ value: JSON.stringify(props.value, null, 2) })
      } catch (error) {
        //
      }
    }
    this.state.inputHandled = true
  }

  handleChange = (value) => {
    this.setState({ value })
    this.state.inputHandled = true
    try {
      value = JSON.parse(value)
      this.props.onChange(value)
    } catch (error) {
      this.props.onChange(null)
    }
  }
}

Admin.addToLibrary('FieldJSON', (config) => FieldJSON.create(config))
