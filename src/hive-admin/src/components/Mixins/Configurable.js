import pick from 'lodash/pick'

export default (Main) =>
  class Configurable extends Main {
    static config = {}

    static getConfig(config = {}, keys = []) {
      return Object.assign(
        {},
        this.config,
        ...keys.map((key) => this.config[key] || {}),
        config,
        ...keys.map((key) => config[key] || {})
      )
    }

    static getProps(staticConfig, config, ...rest) {
      return {
        ...staticConfig,
        ...rest.reduce((agr, next) => Object.assign(agr, next), {}),
        ...pick(staticConfig, Object.keys(config)),
      }
    }

    static create(config = {}) {
      return this.getConfig(config)
    }
  }
