import Admin from './Admin'
import ActionWithFormBasedRequest from './ActionWithFormBasedRequest'

export default class ActionCreate extends ActionWithFormBasedRequest {
  static config = {
    ...ActionWithFormBasedRequest.config,
    name: 'create',
    messageWorking: 'Creating...',
    messageSuccess: 'Created!',
    method: 'post',
    disabled: [
      ['condition.isLoading'],
      [
        'condition.and',
        [
          ['not', ['condition.anyFieldTouched']],
          ({ searchParams, data }) => !searchParams.duplicate || !data,
        ],
      ],
      ['condition.anyFieldHasError'],
    ],
    handleSuccess: (data, props) => {
      if (data && props.createRedirectPath) {
        props.history.replace(
          props.replaceUrlProps(props.createRedirectPath, props, data)
        )
      }
    },
    getRequestConfig: (props, data) => ({
      url: props.replaceUrlProps(props.createUrl, props),
      method: props.createMethod || props.method,
      data,
    }),
  }
}

Admin.addToLibrary('ActionCreate', (config) => ActionCreate.create(config))
