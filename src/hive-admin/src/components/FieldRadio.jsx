import React from 'react'
import styled, { css } from 'styled-components'

import Radio from 'antd/lib/radio'

import Admin from './Admin'
import Field from './Field'
import FieldSelect from './FieldSelect'

export const RadioGroup = styled(Radio.Group)`
  ${({ block }) =>
    block &&
    css`
      width: 100%;
      display: flex;
      > label {
        flex: 1;
        flex-grow: 1;
        flex-shrink: 1;
        text-align: center;
        white-space: nowrap;
      }
    `}
`

export default class FieldRadio extends FieldSelect {
  static config = {
    ...FieldSelect.config,
    Component: RadioGroup,
    choiceClass: Radio.Button,
    // eslint-disable-next-line no-unused-vars
    prepareValueForInput: (value, props) => value,
    // eslint-disable-next-line no-unused-vars
    prepareValueForForm: (value, props) => value,
    renderChoice: (choice, field, props) => (
      <props.choiceClass
        key={props.getChoiceValue(choice, field, props)}
        value={props.getChoiceValue(choice, field, props)}
      >
        {props.getChoiceLabel(choice, field, props)}
      </props.choiceClass>
    ),
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    block: true,
    buttonStyle: true,
    defaultChecked: true,
  }

  handleChange = (event) => {
    this.props.onChange({
      ...event,
      target: {
        ...event.target,
        value: this.props.prepareValueForForm(event.target.value, this.props),
      },
    })
  }

  renderInput(props) {
    return (
      <this.props.Component
        key={props.name}
        {...props}
        value={props.value}
        onChange={this.handleChange}
      >
        {this.props.renderChoices(this, this.getStatefullProps())}
      </this.props.Component>
    )
  }
}

Admin.addToLibrary('FieldRadio', (config) => FieldRadio.create(config))
