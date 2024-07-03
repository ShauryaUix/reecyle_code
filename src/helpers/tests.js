import Types from './types'

const tests = {
  ...Types.USER_ROLE.reduce((agr, role) => {
    ;['===', '!=='].forEach((op) =>
      ['user', 'viewer'].forEach((type) => {
        agr[
          `${type}${op === '===' ? 'Is' : 'IsNot'}${role[0]}${role
            .slice(1)
            .toLowerCase()}`
        ] =
          type === 'user'
            ? ['condition.testFieldValue', 'role', op, role]
            : ['condition.checkViewer', 'role', op, role]
      })
    )
    return agr
  }, {}),

  isNotCreateActivity: ({ activity }) => activity !== 'create',
  isNotEditActivity: ({ activity }) => activity !== 'edit',
}

tests.viewerIsUserOwner = (props) =>
  props.data && props.viewer && props.data._id === props.viewer._id

tests.viewerIsNotUserOwner = ['condition.not', tests.viewerIsUserOwner]

export default tests
