import React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/mode/java'
import 'brace/mode/python'
import 'brace/mode/xml'
import 'brace/mode/ruby'
import 'brace/mode/sass'
import 'brace/mode/markdown'
import 'brace/mode/mysql'
import 'brace/mode/json'
import 'brace/mode/html'
import 'brace/mode/handlebars'
import 'brace/mode/golang'
import 'brace/mode/csharp'
import 'brace/mode/coffee'
import 'brace/mode/css'
import 'brace/mode/ejs'

import 'brace/theme/github'

import Admin from './Admin'
import Field from './Field'

import './FieldCodeEditor.less'

export default class FieldCodeEditor extends Field {
  static config = {
    ...Field.config,
    initialValue: '',
    mode: 'markdown',
    tabSize: 2,
    minLines: 4,
    maxLines: 20,
    highlightActiveLine: false,
    enableBasicAutocompletion: false,
    enableLiveAutocompletion: false,
    showPrintMargin: false,
    showGutter: true,
  }

  static inputPropsMap = {
    name: true,
    value: true,
    mode: true,
    theme: true,
    tabSize: true,
    minLines: true,
    maxLines: true,
    highlightActiveLine: true,
    enableBasicAutocompletion: false,
    showPrintMargin: true,
    enableLiveAutocompletion: false,
    showGutter: true,
  }

  constructor(props) {
    super(props)
    this.state = this.state || {}
    this.state.value = this.props.prepareValueForInput(
      this.props.value,
      this.props
    )
  }

  // componentWillReceiveProps(props) {
  //   this.setState({ value: props.value });
  // }

  handleChange = (value) => {
    this.setState({ value })
    this.props.onChange(this.props.prepareValueForForm(value, this.props))
  }

  renderInput(props) {
    return (
      <AceEditor
        name={this.props.name}
        width="100%"
        onChange={this.handleChange}
        {...props}
        value={this.state.value}
      />
    )
  }
}

Admin.addToLibrary('FieldCodeEditor', (config) =>
  FieldCodeEditor.create(config)
)
