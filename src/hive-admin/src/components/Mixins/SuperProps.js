import getKey from 'lodash/get'
import omit from 'lodash/omit'
import isString from 'lodash/isString'

export default (Main) =>
  class SuperProps extends Main {
    getStatefullProps(statePath = 'props', skipProps = ['style']) {
      return {
        ...omit(this.props, skipProps),
        ...(statePath ? getKey(this.state, statePath, {}) : this.state || {}),
      }
    }

    static mapProps(props = {}, mapName = 'propsMap') {
      const map = this[mapName]
      if (map) {
        return Object.keys(props).reduce((agr, key) => {
          const value = map[key]
          if (value === true) {
            agr[key] = props[key]
          } else if (isString(value)) {
            agr[key] = getKey(props, value)
          }
          return agr
        }, {})
      }
      throw new Error(`Props map "${mapName}" does not exist`)
    }

    getMappedProps(mapName, extras = {}) {
      const props = this.getStatefullProps()
      return this.constructor.mapProps(
        {
          ...props,
          ...extras,
        },
        mapName
      )
    }
  }
