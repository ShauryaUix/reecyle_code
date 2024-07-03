import path from 'path'

import Admin from './Admin'
import ActionWithFormBasedRequest from './ActionWithFormBasedRequest'

export default class ActionPasswordReset extends ActionWithFormBasedRequest {
  static config = {
    ...ActionWithFormBasedRequest.config,
    name: 'password-reset',
    title: 'Reset Password',
    messageWorking: 'Resetting...',
    messageSuccess: 'Check your inbox for the Password Reset email!',
    messageSuccessDuration: 15,
    method: 'post',
    type: 'primary',
    size: 'large',
    style: { width: '100%' },
    handleSuccess: (data, props) =>
      props.passwordResetSuccessRedirectPath
        ? setTimeout(
            () =>
              props.history.push(
                path.join(props.base, props.passwordResetSuccessRedirectPath)
              ),
            1000
          )
        : null,
    getRequestConfig: (props, data) => ({
      url: props.replaceUrlProps(props.passwordResetUrl || props.url, props),
      method: props.passwordResetMethod || props.method,
      data,
    }),
  }
}

Admin.addToLibrary('ActionPasswordReset', (config) =>
  ActionPasswordReset.create(config)
)
