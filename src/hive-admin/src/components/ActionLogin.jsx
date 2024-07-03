import Admin from './Admin'
import ActionWithFormBasedRequest from './ActionWithFormBasedRequest'

const { REACT_APP_CAPACITOR } = process.env

export default class ActionLogin extends ActionWithFormBasedRequest {
  static config = {
    ...ActionWithFormBasedRequest.config,
    name: 'login',
    messageWorking: 'Logging in...',
    messageSuccess: 'Welcome!',
    method: 'post',
    type: 'primary',
    size: 'large',
    style: { width: '100%' },
    issueRequest: (props, { data }) => props.authorize(data),
    getRequestConfig: (props, data) => ({
      url: props.replaceUrlProps(
        props.createUrl || props.authorizeUrl || props.url,
        props
      ),
      method: props.loginMethod || props.method,
      data: {
        platform:
          `${REACT_APP_CAPACITOR}` === 'true' ? 'APP_MOBILE' : undefined,
        ...data,
      },
    }),
  }
}

Admin.addToLibrary('ActionLogin', (config) => ActionLogin.create(config))
