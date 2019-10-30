const { compose: reduxCompose } = require('redux')
const compose = require('./compose.macro')

describe('compose macro', () => {
  it('behaves the same as compose from redux', () => {
    const getValue = o => o.value
    const isTrue = o => o === true

    const isValueTrue = compose(
      isTrue,
      getValue
    )

    expect(isValueTrue({ value: true })).toBe(true)
    expect(isValueTrue({ value: true })).toBe(
      reduxCompose(isTrue, getValue)({ value: true })
    )

    expect(isValueTrue({ value: 'true' })).toBe(false)

    expect(isValueTrue({ value: 'true' })).toBe(
      reduxCompose(isTrue, getValue)({ value: false })
    )

    expect(toString(isValueTrue)).toMatchInlineSnapshot(
      `"(...args) => isTrue(getValue(...args))"`
    )
  })

  it('should eliminate arrow iife', () => {
    const getValue = o => o.value
    const isTrue = o => o === true

    const fn = () =>
      compose(
        isTrue,
        getValue
      )({ value: true })

    expect(fn()).toBe(true)
    expect(toString(fn)).toMatchInlineSnapshot(
      `"isTrue(getValue({ value: true }))"`
    )
  })
})

function toString(fn) {
  return fn
    .toString()
    .replace(/\(\)\s*=>\s*/, '')
    .replace(/\s+/gm, ' ')
}
