import styled from 'styled-components'

interface SpaceProps {
  w?: number
  h?: number
}

const Space = styled.div<SpaceProps>`
  width: ${({ w }) => w}px;
  height: ${({ h }) => h}px;
  flex: 1 0 auto;
`

export default Space
