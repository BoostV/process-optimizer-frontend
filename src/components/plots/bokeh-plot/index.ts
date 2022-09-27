import dynamic from 'next/dynamic'

// This is a workaround for Next.js to work with BokehJS
export const BokehPlot = dynamic(() => import('./bokeh-plot'), {
  ssr: false,
})
