import Admin from './Admin'
import Filter from './Filter'

export default class FilterHidden extends Filter {
  static config = {
    ...Filter.config,
    build: () => {},
    isHidden: true,
  }

  static buildQuery(value, builder, filter, params, props) {
    filter.build(builder, filter, value, params, props)
  }

  render() {
    return null
  }
}

Admin.addToLibrary('FilterHidden', (config) => FilterHidden.create(config))
