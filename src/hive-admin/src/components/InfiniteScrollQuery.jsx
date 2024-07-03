/* eslint-disable react/forbid-foreign-prop-types */

import React, { Component } from 'react'
import isArray from 'lodash/isArray'
import InfiniteScroll from 'react-infinite-scroller'

import Query from './Query'

if (InfiniteScroll.propTypes) {
  delete InfiniteScroll.propTypes.element
}

export default class InfiniteScrollQuery extends Component {
  static defaultProps = {
    limit: 20,
    getUrl: (props, page) =>
      `${props.url}?query=${encodeURIComponent(
        JSON.stringify({
          skip: page * props.limit,
          where: props.getWhereConditions(props, page),
          limit: props.limit,
        })
      )}`,
    getWhereConditions: (/* props, page */) => ({}),
    shouldReload: (/* currentProps, newProps */) => false,
    renderItem: (/* item, index, props */) => null,
    renderEmpty: (/* props */) => null,
    extractData: (response) =>
      !response || !response.data || !response.data.data
        ? []
        : response.data.data,
  }

  constructor(props) {
    super(props)
    this.state = { page: 0, exhausted: false }
  }

  componentWillReceiveProps(newProps) {
    if (this.props.shouldReload(this.props, newProps)) {
      this.setState({ page: 0 })
    }
  }

  handleData = (response, currentData, props) => {
    currentData = isArray(currentData) ? currentData : []
    let newData = this.props.extractData(response)
    if (!isArray(newData)) {
      newData = []
    }
    this.setState({ exhausted: newData.length < this.props.limit })
    if (props.page > 0) {
      return currentData.concat(newData)
    }
    return newData
  }

  handleLoadMore = () => {
    this.setState((state) => ({
      ...state,
      exhausted: true,
      page: state.page + 1,
    }))
  }

  renderContent = (queryProps) => (
    <InfiniteScroll
      pageStart={0}
      loadMore={this.handleLoadMore}
      hasMore={!this.state.exhausted}
      initialLoad={false}
      useWindow={false}
    >
      {!queryProps.loading && (!queryProps.data || !queryProps.data.length)
        ? this.props.renderEmpty(this.props)
        : queryProps.data.map((item, index) =>
            this.props.renderItem(item, index, this.props)
          )}
    </InfiniteScroll>
  )

  render() {
    return (
      <Query
        method={this.props.method}
        url={this.props.getUrl(this.props, this.state.page)}
        extractData={this.handleData}
        page={this.state.page}
        client={this.props.client}
      >
        {this.renderContent}
      </Query>
    )
  }
}
