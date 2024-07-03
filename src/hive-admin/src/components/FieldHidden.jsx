import Field from './Field'
import Admin from './Admin'

export default class FieldHidden extends Field {
  static config = {
    ...Field.config,
    hidden: [() => true],
  }

  renderInput() {
    return null
  }
}

Admin.addToLibrary('FieldHidden', (config) => FieldHidden.create(config))
