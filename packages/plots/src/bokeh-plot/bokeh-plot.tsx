import { useEffect, useRef } from 'react'
import { embed } from '@bokeh/bokehjs'

type BokehPlotProps = {
  data?: (embed.JsonItem & { root_id: string }) | string
}

const createBokehId = (root_id: string) => `bokeh-${root_id}`

export const BokehPlot = (props: BokehPlotProps) => {
  const bokehContainer = useRef<HTMLDivElement>(null)
  const { data } = props

  useEffect(() => {
    if (
      bokehContainer &&
      bokehContainer.current &&
      data &&
      typeof data !== 'string' &&
      createBokehId(data.root_id) !== bokehContainer.current.id
    ) {
      bokehContainer.current.id = createBokehId(data.root_id)
      embed.embed_item(data, bokehContainer.current.id)
    }
  }, [data])

  return <div ref={bokehContainer} />
}

export default BokehPlot
