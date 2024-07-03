import { Component } from 'react'
import mix from '../modules/mix'
import Injectable from './Mixins/Injectable'

export default class Viewer extends mix(Component, Injectable) {
  static STATE = {
    INITIALIZING: 'INITIALIZING',
    AUTHORIZING: 'AUTHORIZING',
    UNAUTHORIZED: 'UNAUTHORIZED',
    AUTHORIZED: 'AUTHORIZED',
  }

  static defaultProps = {
    viewerUrl: '/api/users/me',
    authorizeUrl: '/api/access-token',
  }

  constructor(props) {
    super(props)
    this.state = {
      state: Viewer.STATE.INITIALIZING,
      error: null,
      viewer: null,
      source: props.client.createSource(),
    }
  }

  componentDidMount() {
    this.initialize(true).catch(() => {})
  }

  componentWillReceiveProps(props) {
    if (props.viewerUrl !== this.props.viewerUrl) {
      this.initialize(true).catch(() => {})
    }
  }

  authorize = ({ email, username, password, platform, purpose }) => {
    this.props.client.setNoReloadOnUnauthorized(true)
    this.authorization = this.props.client
      .request({
        url: this.props.authorizeUrl,
        method: 'post',
        data: { email, username, password, platform, purpose },
        cancelToken: this.state.source.token,
      })
      .then((response) => {
        this.props.client.setAccessToken(response.data._id)
        return this.initialize()
      })
      .catch((error) => {
        this.props.client.setAccessToken('')
        this.props.client.setNoReloadOnUnauthorized(true)
        this.setState({
          error,
          viewer: null,
          state: Viewer.STATE.UNAUTHORIZED,
        })
        throw error
      })
    return this.authorization
  }

  unauthorize = () => {
    this.props.client.setAccessToken('')
    return this.initialize(true).catch(() => {})
  }

  initialize = (restart = false) => {
    this.setState(
      restart
        ? {
            state: Viewer.STATE.INITIALIZING,
            viewer: null,
            error: null,
          }
        : {}
    )
    this.props.client.setNoReloadOnUnauthorized(true)
    this.initialization = this.props.client
      .request({
        url: this.props.viewerUrl,
        method: 'get',
        cancelToken: this.state.source.token,
      })
      .then((response) =>
        Promise.resolve(
          this.props.validateViewer(response.data, this.props, this)
        ).then((viewer) => {
          response.data = viewer
          return response
        })
      )
      .then((response) => {
        this.props.client.setNoReloadOnUnauthorized(false)
        this.setState({
          viewer: response.data,
          error: null,
          state: Viewer.STATE.AUTHORIZED,
        })
        return response
      })
      .catch((error) => {
        this.props.client.setNoReloadOnUnauthorized(false)
        this.setState({
          viewer: null,
          error,
          state: Viewer.STATE.UNAUTHORIZED,
        })
        throw error
      })
    return this.initialization
  }

  reload = (restart = false) => this.initialize(restart).catch(() => {})

  render() {
    const { error, viewer, state } = this.state
    return this.renderChildrenWithProps({
      error,
      viewer,
      cancel: this.cancel,
      authorize: this.authorize,
      unauthorize: this.unauthorize,
      isInitializing: state === Viewer.STATE.INITIALIZING,
      isAuthorizing: state === Viewer.STATE.AUTHORIZING,
      isAuthorized: state === Viewer.STATE.AUTHORIZED,
    })
  }
}
