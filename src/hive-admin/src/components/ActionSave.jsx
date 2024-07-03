/* global window */

import Admin from './Admin'
import ActionWithFormBasedRequest from './ActionWithFormBasedRequest'

export default class ActionSave extends ActionWithFormBasedRequest {
  static config = {
    ...ActionWithFormBasedRequest.config,
    name: 'save',
    icon: 'save',
    ghost: true,
    messageWorking: 'Saving...',
    messageSuccess: 'Saved!',
    method: 'patch',
    handleSuccess: (data, props) => {
      if (data._id === props.viewer._id) {
        window.location.reload()
      }
    },
    getRequestConfig: (props, data) => {
      const targetUrl = props.saveUrl || props.loadUrl || props.url
      return {
        url: props.replaceUrlProps
          ? props.replaceUrlProps(targetUrl, props)
          : targetUrl,
        method: props.saveMethod || props.method,
        data,
      }
    },
  }
}

Admin.addToLibrary('ActionSave', (config) => ActionSave.create(config))
