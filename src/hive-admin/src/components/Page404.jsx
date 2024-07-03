import React from 'react'
import styled from 'styled-components'

import Admin from './Admin'
import Page from './Page'

export const Page404Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export const Page404Title = styled.div`
  font-size: 80px;
  font-weight: 600;
  color: ${({ theme }) => theme.less.primaryColor};
`

export const Page404Description = styled.div`
  font-size: 18px;
`

export default class Page404 extends Page {
  static config = {
    ...Page.config,
    ClassName: 'Page404',
    path: '*',
    title: 'Not Found',
    hidden: true,
    style: {
      maxWidth: '800px',
      margin: '0 auto',
    },
  }

  static create(config) {
    const staticConfig = super.create(config)
    const PageClass = this
    staticConfig.render = (props) => (
      <PageClass
        // eslint-disable-next-line react/no-this-in-sfc
        {...this.getProps(staticConfig, config, props)}
      />
    )
    return staticConfig
  }

  renderFound() {
    return (
      <Page404Wrapper className="page-404-wrapper">
        <Page404Title className="page-404-title">404</Page404Title>
        <Page404Description className="page-404-description">
          Page not found!
        </Page404Description>
      </Page404Wrapper>
    )
  }
}

Admin.addToLibrary('Page404', (config) => Page404.create(config))
