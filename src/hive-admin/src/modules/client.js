/* global window, FormData */

import 'whatwg-fetch'
import isUndefined from 'lodash/isUndefined'

import defaultAxios from 'axios'

const HEADER_KEYS = {
  ACCEPT: 'Accept',
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
}

export { defaultAxios as axios }

export const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN'

export function create({
  baseURL,
  axios = defaultAxios,
  accessTokenKey = ACCESS_TOKEN_KEY,
  defaults = {},
  loader,
  storage,
  transform,
} = {}) {
  const client = axios.create()
  client.axios = axios
  client.loader = loader
  client.storage = storage
  client.getElement = () => client.loader.getElement()
  client.noReload = false
  client.getAccessToken = () => client.storage.getItem(accessTokenKey)
  client.setAccessToken = (token) =>
    client.storage.setItem(accessTokenKey, token)
  client.createSource = () => client.axios.CancelToken.source()
  client.setNoReloadOnUnauthorized = (prevent = true) => {
    client.noReload = prevent
  }
  Object.assign(client.defaults, { baseURL }, defaults)
  client.interceptors.request.use((config = {}) => {
    if (!config.noLoader) {
      client.loader.load()
    }
    return Object.assign(config, {
      headers: Object.assign(config.headers || {}, {
        [HEADER_KEYS.ACCEPT]: 'application/json',
        [HEADER_KEYS.AUTHORIZATION]: client.getAccessToken(),
        [HEADER_KEYS.CONTENT_TYPE]:
          config.data instanceof FormData
            ? 'multipart/form-data'
            : 'application/json',
      }),
    })
  })
  client.interceptors.response.use(
    (response) => {
      if (!response.config.noLoader) {
        client.loader.loaded()
      }
      if (!response.config.noLog) {
        // eslint-disable-next-line no-console
        console.log('response: %s', response.config.url, response)
      }
      return response
    },
    (error) => {
      if (!error.response || !error.response.config.noLoader) {
        client.loader.loaded()
      }
      if (!error.response || !error.response.config.noLog) {
        // eslint-disable-next-line no-console
        console.log('error:', error, error.response)
      }
      if (
        client.noReload === false &&
        error.response &&
        error.response.status === 401
      ) {
        window.location.reload()
      }
      throw error
    }
  )
  client.format = (url, params = {}) => {
    const keys = Object.keys(params)
    return !keys.length
      ? url
      : url.replace(/:([^/]+)/g, (all, id) => {
          const keyIndex = keys.indexOf(id)
          if (keyIndex > -1) {
            keys.splice(keyIndex, 1)
          }
          return isUndefined(params[id])
            ? `:${id}`
            : `${encodeURIComponent(params[id])}`
        }) +
          (!keys.length
            ? ''
            : `?${keys
                .reduce((queryArray, key) => {
                  queryArray.push(
                    `${key}=${encodeURIComponent(
                      key === 'filters'
                        ? JSON.stringify(params[key])
                        : params[key]
                    )}`
                  )
                  return queryArray
                }, [])
                .join('&')}`)
  }
  client.prefix = (url, params = {}) =>
    `${client.defaults.baseURL}/${client.format(url, params)}`
  if (transform) {
    return transform(client)
  }
  return client
}

export default create
