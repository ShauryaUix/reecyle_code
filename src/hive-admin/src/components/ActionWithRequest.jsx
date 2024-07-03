import ActionAsync from './ActionAsync'

import Admin from './Admin'

export default class ActionWithRequest extends ActionAsync {
  static config = {
    ...ActionAsync.config,
    section: 'bottom',
    getRequestConfig: (props) => ({
      url: props.url,
      method: props.method,
    }),
    getMessageError: (error) => {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        error = error.response.data
      }
      return error.message
    },
    issueRequest: (props, requestConfig) => props.client.request(requestConfig),
    processAction: (props) =>
      props
        .issueRequest(props, props.getRequestConfig(props))
        .then((response) => response.data),
  }
}

Admin.addToLibrary('ActionWithRequest', (config) =>
  ActionWithRequest.create(config)
)
