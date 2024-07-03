import { motion } from 'framer-motion'
import styled from 'styled-components'

const ButtonIcon = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 60px;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.11);

  background: ${({ theme }) => theme.colors.light};
`

;<ButtonIcon whileTap={{ scale: 0.9 }}>
  <svg
    width="17"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.5 1.47052L1.5 15.4705"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.5 1.47052L15.5 15.4705"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</ButtonIcon>

export default ButtonIcon
