import Admin from './Admin'

import PageArchiveTable from './PageArchiveTable'

export default class PageArchiveTableAutoRefresh extends PageArchiveTable {
  static config = {
    ...PageArchiveTable.config,
    archiveAutoRefreshTimeout: 10000,
  }

  restartRefreshCycle = (skip = false) => {
    clearTimeout(this.autoRefreshTimeout)
    if (!skip && this.mounted) {
      this.props.reload()
    }
    if (this.mounted) {
      this.autoRefreshTimeout = setTimeout(
        this.restartRefreshCycle,
        this.props.archiveAutoRefreshTimeout,
        false
      )
    }
  }

  componentDidMount() {
    super.componentDidMount()
    this.restartRefreshCycle(true)
  }

  componentWillUnmount() {
    clearTimeout(this.autoRefreshTImeout)
    super.componentWillUnmount()
  }
}

Admin.addToLibrary('PageArchiveTableAutoRefresh', (config) =>
  PageArchiveTableAutoRefresh.create({
    ...config,
    getArchiveQueryMode: (/* props */) => 'paginated',
  })
)
