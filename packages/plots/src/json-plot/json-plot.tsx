import React from 'react'

type Props = {
  plot: string
  width?: number | string
  maxWidth?: number | string
  altText?: string
}

export const JsonPlot: React.FC<Props> = ({ plot }) => (
  <span>{JSON.stringify(JSON.parse(plot), null, 2)}</span>
)
