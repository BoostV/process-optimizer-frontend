import { parse, evaluate, isSymbolNode } from 'mathjs'
import type { ScoreFunctionType, DataPointType } from '@core/common/types'

// Turn a human display name into a valid, unique mathjs identifier.
// "Wait before stir" -> "waitBeforeStir"; collisions get _2, _3, ...
export const deriveSymbol = (name: string, existing: string[]): string => {
  const words = name
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  let base =
    words
      .map((w, i) =>
        i === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join('') || 'x'
  if (/^[0-9]/.test(base)) base = 'x' + base
  let symbol = base
  let n = 2
  while (existing.includes(symbol)) {
    symbol = `${base}_${n}`
    n += 1
  }
  return symbol
}

// Symbol names referenced by an expression. [] if it does not parse.
export const usedSymbols = (expression: string): string[] => {
  try {
    const node = parse(expression)
    const symbols = new Set<string>()
    node.filter(isSymbolNode).forEach(n => {
      if (isSymbolNode(n)) symbols.add(n.name)
    })
    return [...symbols]
  } catch {
    return []
  }
}

// Symbols the expression references that are neither declared variables nor
// known to mathjs (so `pi`, `sin`, ... are not flagged).
export const findUndefinedSymbols = (fn: ScoreFunctionType): string[] => {
  const declared = new Set(fn.variables.map(v => v.symbol))
  return usedSymbols(fn.expression).filter(s => {
    if (declared.has(s)) return false
    try {
      const value = evaluate(s)
      // Real math constants/functions (pi, e, sin, ...) are fine; a bare mathjs
      // unit (m, s, g, b, ...) or other non-numeric value isn't meaningful in a
      // score function, so treat it as an undefined symbol.
      return typeof value !== 'number' && typeof value !== 'function'
    } catch {
      return true
    }
  })
}

export const computeScore = (
  fn: ScoreFunctionType,
  responseValues: { symbol: string; value: number }[],
  factorData: DataPointType[]
): number | undefined => {
  const used = new Set(usedSymbols(fn.expression))
  const scope: Record<string, number> = {}
  for (const variable of fn.variables) {
    if (!used.has(variable.symbol)) continue
    if (variable.source === 'response') {
      const rv = responseValues.find(r => r.symbol === variable.symbol)
      if (rv === undefined || !Number.isFinite(rv.value)) return undefined
      scope[variable.symbol] = rv.value
    } else {
      const fd = factorData.find(d => d.name === variable.factorName)
      const value = fd === undefined ? undefined : Number(fd.value)
      if (value === undefined || !Number.isFinite(value)) return undefined
      scope[variable.symbol] = value
    }
  }
  try {
    const result = evaluate(fn.expression, scope)
    return typeof result === 'number' && Number.isFinite(result)
      ? result
      : undefined
  } catch {
    return undefined
  }
}
