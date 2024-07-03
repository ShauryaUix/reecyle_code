import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import Paragraph from '../Text/Paragraph'
import Title from '../Text/Title'
import Space from '../Space/space'
import Spinner from '../Spinner/spinner'

interface WrapperProps {
  position: 'relative'
  display: 'flex'
  flexDirection: 'row'
  justifyContent: 'space-between'
  alignItems: 'center'
  width: '100%'
  padding: '20px'
}

const Wrapper = styled.div<WrapperProps>`
  position: ${({ position }) => position};
  display: ${({ display }) => display};
  flex-direction: ${({ flexDirection }) => flexDirection};
  justify-content: ${({ justifyContent }) => justifyContent};
  align-items: ${({ alignItems }) => alignItems};
  width: ${({ width }) => width};
  padding: ${({ padding }) => padding};

  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 0;
    right: 0%;
    height: 30px;
    z-index: 1;
    background: linear-gradient(
      to bottom,
      hsla(0, 0%, 100%, 1),
      hsla(0, 0%, 100%, 0)
    );
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
`

const ImageContainer = styled(Link)`
  position: relative;
  display: flex;
  width: 60px;
  height: 60px;
`

interface ImageAvatarProps {
  src?: string
}

const ImageAvatar = styled.div<ImageAvatarProps>`
  display: flex;
  flex: 1;
  border-radius: 100%;
  background-color: transparent;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: ${({ src }) => `url("${src}")`};
`

const ImageShade = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: hsla(0, 0%, 0%, 0.03);
  border-radius: 1000px;
`

const Flex = styled.div`
  display: flex;
`

interface HeaderProps {
  name?: string
  message?: string
  points?: { balance: number; total: number }
  image?: string
  loading?: boolean
}

const Header: React.FC<HeaderProps> = ({
  name,
  message,
  points,
  image,
  loading,
}) => (
  <Wrapper
    position="relative"
    display="flex"
    flexDirection="row"
    justifyContent="space-between"
    alignItems="center"
    width="100%"
    padding="20px"
  >
    <Content>
      <Title fontSize={28}>{name}</Title>
      <Space h={1} />
      <Flex>
        {points ? (
          <Flex>
            <Paragraph color="brand">{`${points.balance} points`}</Paragraph>
            <Paragraph opacity={0.4}>&nbsp;/&nbsp;</Paragraph>
            <Paragraph color="dark" opacity={0.4}>
              {`${points.total} total`}
            </Paragraph>
          </Flex>
        ) : (
          <Paragraph>{message}</Paragraph>
        )}
        {loading ? (
          <>
            <Space w={8} />
            <Spinner />
          </>
        ) : null}
      </Flex>
    </Content>
    <motion.div whileTap={{ scale: 0.9 }}>
      <ImageContainer to="/users/me">
        <ImageAvatar src={image} />
        <ImageShade />
      </ImageContainer>
    </motion.div>
  </Wrapper>
)

export default Header
