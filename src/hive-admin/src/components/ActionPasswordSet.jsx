import path from 'path'
import qs from 'query-string'
import Admin from './Admin'
import ActionWithFormBasedRequest from './ActionWithFormBasedRequest'

export default class ActionPasswordSet extends ActionWithFormBasedRequest {
  static config = {
    ...ActionWithFormBasedRequest.config,
    name: 'password-set',
    title: 'Set New Password',
    messageWorking: 'Changing...',
    messageSuccess: 'Password changed successfully! You can log in now!',
    messageSuccessDuration: 4,
    method: 'post',
    type: 'primary',
    size: 'large',
    style: { width: '100%' },
    handleSuccess: (data, props) =>
      props.passwordSetSuccessRedirectPath
        ? setTimeout(
            () =>
              props.history.push(
                path.join(props.base, props.passwordSetSuccessRedirectPath)
              ),
            1000
          )
        : null,
    getRequestConfig: (props, data) => ({
      url: `${props.replaceUrlProps(
        props.passwordSetUrl || props.url,
        props
      )}?access_token=${qs.parse(props.search || '').token}`,
      method: props.passwordSetMethod || props.method,
      data,
    }),
  }
}

Admin.addToLibrary('ActionPasswordSet', (config) =>
  ActionPasswordSet.create(config)
)
