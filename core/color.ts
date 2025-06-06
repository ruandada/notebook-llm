import * as TailwindColors from 'tailwindcss/colors'

type PaletteSeries = keyof typeof TailwindColors
type PaletteVariant =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950

export interface PaletteColor {
  type: 'palette'
  color: [PaletteSeries, PaletteVariant]
}

export interface LiteralColor {
  type: 'literal'
  color: string
}

export type Color = string | PaletteColor | LiteralColor

export const getColorValue = (c: Color): string => {
  if (typeof c === 'string') {
    return c
  }

  if (c.type === 'palette') {
    const [palette, depth] = c.color
    return TailwindColors[palette][depth]
  }

  return c.color
}

export const paletteColor = (
  series: PaletteSeries,
  depth: PaletteVariant
): PaletteColor => ({
  type: 'palette',
  color: [series, depth],
})

export const literalColor = (color: string): LiteralColor => ({
  type: 'literal',
  color,
})
