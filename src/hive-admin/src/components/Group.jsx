import { Component } from 'react'
import isArray from 'lodash/isArray'

import Admin from './Admin'

import mix from '../modules/mix'
import Configurable from './Mixins/Configurable'

export default class Group extends mix(Component, Configurable) {
  static config = {
    pages: [],
    skip: [],
    getSkip: (props) => Admin.test(props.skip || [], props, true, true),
    hidden: [],
    getHidden: (props) =>
      props.hidden === true ||
      Admin.test(props.hidden || [], props, true, true),
  }

  static create(config = {}) {
    config = this.getConfig(config)
    return {
      ...config,
      skip: Admin.compileFromLibrary(config.skip, true),
      pages: Admin.compileFromLibrary(config.pages, true),
      hidden: isArray(config.hidden)
        ? Admin.compileFromLibrary(config.hidden, true)
        : config.hidden,
    }
  }
}

Admin.addToLibrary('Group', (config) => Group.create(config))
