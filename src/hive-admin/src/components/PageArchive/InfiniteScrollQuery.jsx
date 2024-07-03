/* global document */

import React, { Component, useEffect, forwardRef } from 'react'
import isArray from 'lodash/isArray'
import InfiniteScroll from 'react-infinite-scroller'

import Query from '../Query'
import mix from '../../modules/mix'
import Injectable from '../Mixins/Injectable'

const InfiniteScrollElement = forwardRef(({ children }, ref) => {
  useEffect(() => {
    if (ref) {
      ref(document.querySelector('#content'))
    }
    return () => {
      if (ref) {
        ref(null)
      }
    }
  }, [ref])
  return children || null
})

export default class InfiniteScrollQuery extends mix(Component, Injectable) {
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
    extractData: (response) => response,
  }

  constructor(props) {
    super(props)
    this.state = { page: 0, exhausted: false }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(newProps) {
    if (this.props.shouldReload(this.props, newProps)) {
      this.setState({ page: 0 })
    }
  }

  handleData = (response, currentData, props) => {
    currentData =
      currentData && isArray(currentData.data)
        ? currentData
        : {
            data: [],
            count: 0,
          }
    let newData = this.props.extractData(response)
    if (!newData || !isArray(newData.data)) {
      newData = { data: [], count: 0 }
    }
    this.setState({ exhausted: newData.data.length < this.props.limit })
    if (props.page > 0) {
      newData = {
        ...currentData,
        ...newData,
        data: currentData.data.concat(newData.data),
      }
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
      element={InfiniteScrollElement}
    >
      {this.renderChildrenWithProps({
        ...queryProps,
      })}
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
