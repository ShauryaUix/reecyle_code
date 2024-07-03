import React from 'react'
import getKey from 'lodash/get'
import { Link } from 'react-router-dom'

import Admin from './Admin'
import PageArchive from './PageArchive'

import './PageArchiveGrid.less'

export default class PageArchiveGrid extends PageArchive {
  static config = {
    ...PageArchive.config,
    ClassName: 'PageArchiveGrid',
    gridItemLink: '',
    gridItemHeaderImagePath: 'file.src',
    getGridItemHeaderImage: (item, index, props) =>
      getKey(item, props.gridItemHeaderImagePath),
    gridItemTitlePath: 'title',
    getGridItemTitle: (item, index, props) =>
      getKey(item, props.gridItemTitlePath),
    gridItemTitleGlue: ' | ',
  }

  renderGridItemHeader = (item, index) => {
    let content = null
    if (this.props.renderGridItemHeader) {
      content = this.props.renderGridItemHeader(item, index, this.props)
    } else {
      const headerImage = this.props.getGridItemHeaderImage(
        item,
        index,
        this.props
      )
      if (headerImage) {
        content = (
          <div
            className="grid-item-header-image"
            style={{ backgroundImage: `url(${headerImage})` }}
          />
        )
      }
    }
    return <div className="grid-item-header">{content}</div>
  }

  renderGridItemContent(item, index) {
    if (this.props.renderGridItemContent) {
      return (
        <div className="grid-item-content">
          {this.props.renderGridItemContent(item, index, this.props) || null}
        </div>
      )
    }
    return null
  }

  renderGridItem = (item, index) => {
    if (this.props.renderGridItem) {
      return this.props.renderGridItem(item, index, this.props)
    }
    return (
      <div key={item._id} className="grid-item-spacer">
        <Link
          className="grid-item"
          to={this.props.gridItemLink.replace(/:([^/]+)/g, (all, path) =>
            getKey(item, path)
          )}
        >
          {this.renderGridItemHeader(item, index)}
          {this.renderGridItemContent(item, index)}
        </Link>
      </div>
    )
  }

  renderArchiveContent() {
    const data = this.props.data ? this.props.data.data : []
    return (
      <div key="grid" className="grid">
        <div className="grid-items">{data.map(this.renderGridItem)}</div>
      </div>
    )
  }
}

Admin.addToLibrary('PageArchiveGrid', (config) =>
  PageArchiveGrid.create(config)
)
