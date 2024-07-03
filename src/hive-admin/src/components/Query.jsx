import { PureComponent } from 'react'

import isFunction from 'lodash/isFunction'

import mix from '../modules/mix'
import Injectable from './Mixins/Injectable'

export default class Query extends mix(PureComponent, Injectable) {
  static defaultProps = {
    url: '/',
    method: 'get',
    config: {},
    autoload: true,
    autoreload: true,
    throttle: 0,
    skip: false,
    extractData: (response) => response,
  }

  constructor(props) {
    super(props)
    this.state = {
      request: null,
      source: this.props.client.createSource(),
      loading: true,
      response: null,
      data: this.props.extractData(null, [], props),
      skip: this.skip(this.props),
      error: null,
    }
  }

  componentDidMount() {
    if (this.props.autoload) {
      this.load(this.props)
    }
  }

  componentWillUnmount() {
    this.state.unmounted = true
    this.cancel()
  }

  componentDidUpdate(props) {
    if (props.autoload || this.props.autoreload) {
      if (
        props.url !== this.props.url ||
        props.method !== this.props.method ||
        props.config !== this.props.config ||
        props.skip !== this.props.skip
      ) {
        this.reload()
      }
    }
  }

  skip = (props = {}) =>
    props.skip === true
      ? true
      : isFunction(props.skip)
        ? props.skip(props)
        : false

  load = (props = {}) => {
    this.cancel()
    if (this.skip(props)) {
      this.state.request = Promise.resolve(null)
      this.setState({
        response: null,
        skip: true,
        data: props.extractData(null, [], props),
        error: null,
        loading: false,
      })
    } else {
      this.setState({ loading: true, skip: false })
      this.state.request = props.client
        .request({
          url: props.url,
          method: props.method,
          cancelToken: this.state.source.token,
          ...props.config,
        })
        .then((response) => {
          if (!this.state.unmounted) {
            this.setState({
              response,
              data: props.extractData(response, this.state.data, props),
              error: null,
              loading: false,
            })
          }
        })
        .catch((error) => {
          if (!this.state.unmounted) {
            this.setState({
              response: null,
              data: props.extractData(null, [], props),
              error: error.message ? error : null,
              loading: false,
            })
          }
        })
    }
    return this.state.request
  }

  reload = (props = {}) => {
    props = Object.assign({}, this.props, props)
    this.cancel()
    clearTimeout(this.state.throttleTimeout)
    if (props.throttle > 0) {
      return new Promise((resolve) => {
        this.state.throttleTimeout = setTimeout(
          () => this.load(props).then(resolve),
          props.throttle
        )
      })
    }
    return this.load(props)
  }

  cancel = () => {
    this.state.source.cancel()
    this.state.source = this.props.client.createSource()
  }

  render() {
    return this.renderChildrenWithProps({
      loading: this.state.loading,
      response: this.state.response,
      data: this.state.data,
      error: this.state.error,
      url: this.props.url,
      search: this.props.search,
      skip: this.state.skip,
      reload: this.reload,
      cancel: this.cancel,
    })
  }
}
