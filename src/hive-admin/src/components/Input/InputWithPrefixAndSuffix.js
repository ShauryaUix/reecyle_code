// import isUndefined from 'lodash/isUndefined';
// import isFinite from 'lodash/isFinite';

import React, { Component, useRef, useEffect } from 'react'
import styled, { css } from 'styled-components'

export function isValueNotEmpty() {
  return false
}
// export function isValueNotEmpty(value) {
//   return (
//     !isUndefined(value)
//     && (isFinite(value) || (value && value.length))
//   );
// }

export function createStyledInput(Input, styles, defaultStyles) {
  return styled(Input)`
    ${defaultStyles || null}
    ${({ prefixWidth, suffixWidth }) =>
      prefixWidth === null && suffixWidth === null
        ? null
        : prefixWidth === -1 || suffixWidth === -1
          ? css`
              opacity: 0;
            `
          : styles}
  `
}

const PrefixSuffixWrapper = styled.span``

export function PrefixSuffix({
  name,
  onSize,
  hidden,
  wrapper: Wrapper = PrefixSuffixWrapper,
  ...props
}) {
  const ref = useRef()
  const cacheRef = useRef({ width: null, height: null })
  useEffect(
    () => {
      const { width, height } = ref.current.getBoundingClientRect()
      if (width === 0 && height === 0) {
        // timeout = setTimeout(() => setCount(count + 1), 200);
      } else if (
        cacheRef.current.width !== width ||
        cacheRef.current.height !== height
      ) {
        onSize({ name, width, height })
        cacheRef.current.width = width
        cacheRef.current.height = height
      }
    }
    // [setCount, count, onSize],
  )
  return <Wrapper ref={ref} {...props} />
}

export default class InputWithPrefixAndSuffix extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // eslint-disable-next-line react/no-unused-state
      prefixWidth: -1,
      // eslint-disable-next-line react/no-unused-state
      suffixWidth: -1,
    }
  }

  handlePrefixOrSuffixSize = ({ name, width }) => {
    this.setState({
      [`${name}Width`]: width + this.getPrefixOrSuffixExtraWidth(name),
    })
  }

  getPrefixOrSuffixExtraWidth(/* name */) {
    return 0
  }

  getPrefixOrSuffixWrapper(name, wrapper) {
    const { [name]: prefixOrSuffixInput } = this.props
    return prefixOrSuffixInput ? (
      <PrefixSuffix
        name={name}
        onSize={this.handlePrefixOrSuffixSize}
        wrapper={wrapper}
      >
        {prefixOrSuffixInput}
      </PrefixSuffix>
    ) : null
  }

  render() {
    return null
  }
}
