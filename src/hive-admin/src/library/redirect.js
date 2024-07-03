import Admin from '../components/Admin'

Admin.addToLibrary(
  'redirect.unauthorized',
  (destination = '/login') =>
    ({ isInitializing, isAuthorized }) =>
      !isInitializing && !isAuthorized ? destination : false
)

Admin.addToLibrary(
  'redirect.authorized',
  (destination = '/') =>
    ({ isAuthorized, location }) =>
      !isAuthorized
        ? false
        : location.state && location.state.from
          ? location.state.from
          : destination
)

Admin.addToLibrary(
  'redirect.always',
  (destination = '/') =>
    () =>
      destination
)

Admin.addToLibrary('redirect.check', (condition, destination = '/') => {
  const check = Admin.createFromLibrary('condition.check', condition)
  return (props) => (check(props) ? destination : false)
})

Admin.addToLibrary(
  'redirect.checkViewer',
  (key, op, value, destination = '/') => {
    const check = Admin.createFromLibrary('condition.check', {
      path1: key,
      op,
      value2: value,
    })
    return (props) => (check(props.viewer || {}) ? destination : false)
  }
)
