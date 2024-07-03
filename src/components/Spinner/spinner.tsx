import styled from 'styled-components'

const Spinner = styled.div`
  display: inline-block;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-left-color: ${({ theme }) => theme.colors.dark};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: donut-spin 1.2s linear infinite;
  opacity: 0.4;

  @keyframes donut-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

export default Spinner
