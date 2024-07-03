import path from 'path'
import qs from 'query-string'
import Admin from './Admin'
import ActionWithFormBasedRequest from './ActionWithFormBasedRequest'

// eslint-disable-next-line max-len
export default class ActionAccountActivation extends ActionWithFormBasedRequest {
  static config = {
    ...ActionWithFormBasedRequest.config,
    name: 'account-activation',
    title: 'Activate Account',
    messageWorking: 'Activating...',
    messageSuccess: 'Account activated! You can log in now!',
    messageSuccessDuration: 4,
    method: 'post',
    type: 'primary',
    size: 'large',
    style: { width: '100%' },
    handleSuccess: (data, props) =>
      props.accountActivationSuccessRedirectPath
        ? setTimeout(
            () =>
              props.history.push(
                path.join(
                  props.base,
                  props.accountActivationSuccessRedirectPath
                )
              ),
            1000
          )
        : null,
    getRequestConfig: (props, data) => ({
      url: `${props.replaceUrlProps(
        props.accountActivationUrl || props.url,
        props
      )}?access_token=${qs.parse(props.search || '').token}`,
      method: props.accountActivationMethod || props.method,
      data,
    }),
  }
}

Admin.addToLibrary('ActionAccountActivation', (config) =>
  ActionAccountActivation.create(config)
)
