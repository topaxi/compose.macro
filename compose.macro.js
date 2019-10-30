const { createMacro, MacroError } = require('babel-plugin-macros')

module.exports = createMacro(({ references, babel: { types: t } }) => {
  const usedReferences = Object.keys(references)

  if (usedReferences.length > 1 || usedReferences[0] !== 'default') {
    throw new MacroError(
      `compose must be used as default import, instead you have used it as: ${usedReferences.join(
        ', '
      )}.`
    )
  }

  references.default.forEach(({ parentPath: composeCall }) => {
    if (!composeCall.isCallExpression()) {
      throw new MacroError(
        `compose must be used as function call, instead you have used it as: ${composeCall.node.type}.`
      )
    }

    // Is immediately called?
    if (composeCall.parentPath.isCallExpression()) {
      composeCall.parentPath.replaceWith(
        unroll(composeCall, composeCall.parentPath.node.arguments)
      )
    } else {
      composeCall.replaceWith(
        t.arrowFunctionExpression(
          [t.restElement(t.identifier('args'))],
          unroll(composeCall, [t.spreadElement(t.identifier('args'))])
        )
      )
    }
  })

  function unroll(composeCall, args) {
    return composeCall.node.arguments.reduceRight(
      (folded, fn) => [
        t.callExpression(
          t.isFunctionExpression(fn) ? t.parenthesizedExpression(fn) : fn,
          folded
        )
      ],
      args
    )[0]
  }
})
