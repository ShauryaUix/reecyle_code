import Admin from './Admin'
import ActionWithRequest from './ActionWithRequest'

export default class ActionDuplicate extends ActionWithRequest {
  static config = {
    ...ActionWithRequest.config,
    name: 'duplicate',
    type: 'primary',
    messageWorking: 'Duplicating...',
    messageSuccess: 'Duplicated!',
    method: 'put',
    handleSuccess: (data, props) => {
      if (data && props.duplicateRedirectPath) {
        props.history.replace(
          props.replaceUrlProps(props.duplicateRedirectPath, props, data)
        )
      }
    },
    getRequestConfig: (props) => ({
      url: props.replaceUrlProps(props.duplicateUrl, props),
      method: props.duplicateMethod || props.method,
    }),
  }
}

Admin.addToLibrary('ActionDuplicate', (config) =>
  ActionDuplicate.create(config)
)
