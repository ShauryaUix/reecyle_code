import Admin from './Admin'
import Action from './Action'

export default class ActionAsync extends Action {
  static config = {
    ...Action.config,

    messageWorking: 'Working...',
    getMessageWorking: (workload, props) => props.messageWorking,
    messageWorkingDuration: 0,
    getMessageWorkingDuration: (workload, props) =>
      props.messageWorkingDuration,
    minimumWorkingDuration: 400,

    messageSuccess: 'Done!',
    getMessageSuccess: (data, props) => props.messageSuccess,
    messageSuccessDuration: 3,
    getMessageSuccessDuration: (error, props) => props.messageSuccessDuration,
    handleSuccess: () => {},

    messageError: 'Oops! Something went wrong!',
    getMessageError: (error, props) => error.message || props.messageError,
    messageErrorDuration: 3,
    getMessageErrorDuration: (error, props) => props.messageErrorDuration,
    handleError: () => {},

    setLoading: () => {},

    processAction: (props) =>
      new Promise((resolve, reject) => {
        setTimeout(
          () =>
            Math.random() > 0.5
              ? resolve({})
              : reject(new Error('Oops! Something went wrong!')),
          props.minimumWorkingDuration
        )
      }),
    onClick: (props, getExecutionPromise = false) => {
      const startTime = Date.now()
      props.setLoading(true)
      const workload = props.processAction(props)
      const hideWorking = Admin.showMessage(
        props.getMessageWorking(workload, props),
        'loading',
        props.getMessageWorkingDuration(workload, props)
      )
      workload
        .then((data) => ({ data }))
        .catch((error) => ({ error }))
        .then(({ error, data }) =>
          setTimeout(
            () => {
              hideWorking()
              if (error) {
                Admin.showMessage(
                  props.getMessageError(error, props),
                  'error',
                  props.getMessageErrorDuration(data, props)
                )
                props.handleError(error, props)
              } else {
                Admin.showMessage(
                  props.getMessageSuccess(data, props),
                  'success',
                  props.getMessageSuccessDuration(data, props)
                )
                props.handleSuccess(data, props)
              }
              props.setLoading(false)
            },
            Math.min(
              props.minimumWorkingDuration,
              Math.max(0, startTime + props.minimumWorkingDuration - Date.now())
            )
          )
        )
      if (getExecutionPromise) {
        return workload
      }
      return undefined
    },
  }
}

Admin.addToLibrary('ActionAsync', (config) => ActionAsync.create(config))
