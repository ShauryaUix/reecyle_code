import { createRef } from 'react'

export function create({ ref = createRef(), transform } = {}) {
  const loader = {
    ref,
    count: 0,
    timeout: null,
    getElement: () => loader.ref.current,
    load: () => {
      clearTimeout(loader.timeout)
      loader.count++
      if (loader.count > 0 && loader.ref.current) {
        loader.ref.current.setAttribute('data-loading', true)
      }
    },
    loaded: () => {
      clearTimeout(loader.timeout)
      loader.count = Math.max(0, loader.count - 1)
      if (loader.count === 0) {
        if (loader.ref.current) {
          loader.ref.current.setAttribute('data-loading', false)
        }
        loader.timeout = setTimeout(() => {
          if (loader.ref.current) {
            loader.ref.current.removeAttribute('data-loading')
          }
        }, 1500)
      }
    },
  }
  if (transform) {
    return transform(loader)
  }
  return loader
}

export default create
