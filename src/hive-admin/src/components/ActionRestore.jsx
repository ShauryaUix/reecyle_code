import Admin from './Admin'
import ActionWithRequest from './ActionWithRequest'

export default class ActionRestore extends ActionWithRequest {
  static config = {
    ...ActionWithRequest.config,
    name: 'restore',
    type: 'primary',
    messageWorking: 'Restoring...',
    messageSuccess: 'Restored!',
    method: 'post',
    skip: [
      [
        'condition.check',
        {
          path1: 'data.removed',
          op: '!==',
          value2: true,
        },
      ],
    ],
    handleSuccess: (data, props) => {
      if (data && props.restoreRedirectPath) {
        props.history.replace(
          props.replaceUrlProps(props.restoreRedirectPath, props, data)
        )
        props.reload()
      }
    },
    getRequestConfig: (props) => ({
      url: props.replaceUrlProps(props.restoreUrl, props),
      method: props.restoreMethod || props.method,
    }),
  }
}

Admin.addToLibrary('ActionRestore', (config) => ActionRestore.create(config))
