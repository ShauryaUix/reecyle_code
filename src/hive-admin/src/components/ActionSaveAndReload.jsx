import Admin from './Admin'
import ActionSave from './ActionSave'

export default class ActionSaveAndReload extends ActionSave {
  static config = {
    ...ActionSave.config,
    handleSuccess: (data, props, ...args) => {
      ActionSave.config.handleSuccess(data, props, ...args)
      if (props && props.reload) {
        props.reload()
      }
    },
  }
}

Admin.addToLibrary('ActionSaveAndReload', (config) =>
  ActionSaveAndReload.create(config)
)
