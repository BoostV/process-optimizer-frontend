import React from 'react'

type Props = {
  plot: string
  width?: number | string
  maxWidth?: number | string
  altText?: string
}

export const JsonPlot: React.FC<Props> = ({ plot }) => {
  const data = JSON.parse(plot)
  if ('front_x_data' in data) {
    return (
      <>
        {/* <ParetoFrontPlot plot={data as ParetoData} /> */}
        <span>{JSON.stringify(data, null, 2)}</span>
      </>
    )
  }
  return <span>{JSON.stringify(data, null, 2)}</span>
}
