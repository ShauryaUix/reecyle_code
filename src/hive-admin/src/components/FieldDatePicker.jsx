import React from 'react'
import styled from 'styled-components'

import DatePicker from 'antd/lib/date-picker'

import Admin from './Admin'
import Field from './Field'

const Wrapper = styled.div`
  span.ant-calendar-picker {
    width: 100%;
  }
`

export default class FieldDatePicker extends Field {
  static config = {
    ...Field.config,
    Component: DatePicker,
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    allowClear: true,
    autoFocus: true,
    className: true,
    dateRender: true,
    disabledDate: true,
    dropdownClassName: true,
    getCalendarContainer: true,
    locale: true,
    mode: true,
    open: true,
    popupStyle: true,
    suffixIcon: true,
    style: true,
    onOpenChange: true,
    onPanelChange: true,
    defaultPickerValue: true,
    disabledTime: true,
    format: true,
    renderExtraFooter: true,
    showTime: true,
    showToday: true,
    onOk: true,
    onPanelChang: true,
    monthCellContentRender: true,
    onChang: true,
    renderExtraFoote: true,
    ranges: true,
    separator: true,
    onCalendarChange: true,
  }

  renderInput(...args) {
    return <Wrapper>{super.renderInput(...args)}</Wrapper>
  }
}

Admin.addToLibrary('FieldDatePicker', (config) =>
  FieldDatePicker.create(config)
)
