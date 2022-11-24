import React from 'react'

type Props = {
  plot: string
  width?: number | string
  maxWidth?: number | string
  altText?: string
}

export const PNGPlot: React.FC<Props> = ({
  plot,
  width,
  maxWidth,
  altText,
}) => (
  <img
    style={{ width: width || 'auto', maxWidth: maxWidth || 'none' }}
    src={`data:image/png;base64, ${plot}`}
    alt={altText ?? ''}
  />
)
