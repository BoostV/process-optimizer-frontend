import { useEffect, useRef, useState } from 'react'

// Measures an element's content box and keeps it in React state. Use this to
// size a Recharts chart explicitly instead of <ResponsiveContainer>, which
// renders the chart at -1×-1 / 0×0 (logging "width(-1) and height(-1)"
// warnings) on every render before its own ResizeObserver catches up — and the
// surrounding app re-renders the plots many times while their layout settles.
//
// Render the chart only once the returned size is positive, passing explicit
// width/height.
export const useElementSize = <T extends HTMLElement>() => {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const update = (width: number, height: number) =>
      setSize(prev =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height }
      )
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect
      if (rect) {
        update(Math.round(rect.width), Math.round(rect.height))
      }
    })
    observer.observe(el)
    const rect = el.getBoundingClientRect()
    update(Math.round(rect.width), Math.round(rect.height))
    return () => observer.disconnect()
  }, [])
  return [ref, size] as const
}
