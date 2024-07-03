import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import Spinner from '../Spinner/spinner'

const ButtonWrapper = styled(motion.div)<ButtonProps>`
  display: ${({ disabled }) => (disabled ? 'none' : 'flex')};
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 325px;
  padding: 24px 8px;
  border-radius: 220px;
  cursor: pointer;
  color: white;
  background: ${({ theme, color }) => theme.colors[color]};
`

interface ButtonProps {
  children?: React.ReactNode
  color?: any
  className?: string
  disabled?: boolean
  onClick?: () => Promise<void> | void
}
const Button: React.FC<ButtonProps> = ({
  children,
  color,
  className,
  disabled,
  onClick,
}) => {
  const [loading, setloading] = useState(false)

  const handleClick = async () => {
    if (onClick) {
      setloading(true)

      try {
        await onClick()
      } catch (err) {
        setloading(false)
      } finally {
        setloading(false)
      }
    }
  }
  return (
    <ButtonWrapper
      className={className}
      color={color}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      onClick={handleClick}
    >
      {loading ? <Spinner /> : children}
    </ButtonWrapper>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf([
    'brand',
    'brandDark',
    'brandLight',
    'dark',
    'light',
    'transparent',
  ]),
}

export default Button

// interface ButtonCancelProps {
//   className?: string;
//   style?: string;
//   onClick: () => void;
// }

// const ButtonWrapperIcon = styled(motion.div)<ButtonCancelProps>`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   width: 60px;
//   height: 60px;
//   border-radius: 60px;
//   box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.11);

//   background: ${({ theme }) => theme.colors.light};
// `;

// export const ButtonCancel: React.FC<ButtonCancelProps> = ({
//   className,
//   style,
//   onClick,
// }) => (
//   /* eslint-disable max-len */
//   <ButtonWrapperIcon
//     whileTap={{ scale: 0.9 }}
//     onClick={onClick}
//     className={className}
//     style={style}
//   >
//     <svg
//       width="17"
//       height="17"
//       viewBox="0 0 17 17"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         d="M15.5 1.47052L1.5 15.4705"
//         stroke="black"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M1.5 1.47052L15.5 15.4705"
//         stroke="black"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   </ButtonWrapperIcon>
//   /* eslint-enable max-len */
// );
