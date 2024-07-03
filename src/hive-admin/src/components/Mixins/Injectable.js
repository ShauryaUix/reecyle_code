import React from 'react'
import isFunction from 'lodash/isFunction'

export default (Main) =>
  class Injectable extends Main {
    renderChildrenWithProps(props = {}) {
      if (isFunction(this.props.children)) {
        return this.props.children(props)
      }
      return React.Children.map(this.props.children, (child) =>
        React.cloneElement(child, props)
      )
    }
  }
