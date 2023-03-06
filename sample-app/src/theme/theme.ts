import { createTheme, Theme } from '@mui/material/styles'
import { cyan, grey, teal } from '@mui/material/colors'

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    custom: {
      background: PaletteColor
      textInsideBox: PaletteColor
      transparentBox: PaletteColor
    }
  }
  interface PaletteOptions {
    custom?: {
      background: PaletteColorOptions
      textInsideBox: PaletteColorOptions
      transparentBox: PaletteColorOptions
    }
  }
}

const overrides = {
  MuiTableCell: {
    styleOverrides: {
      sizeSmall: {
        padding: '0 2px 0 2px',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& input': {
          padding: '14px 8px 14px 8px',
        },
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      select: {
        padding: '14px 8px 14px 8px',
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
  },
}
declare module '@mui/material/styles' {
  interface Theme {
    sizes: {
      mainWidthMin: number
      mainWidthMax: number
    }
  }

  interface ThemeOptions {
    sizes?: {
      mainWidthMin?: number
      mainWidthMax?: number
    }
  }
}

type CustomColours = {
  primary: string
  secondary: string
  backPrimary: string
  backSecondary: string
  textInsideBox: string
  transparentBox: string
}

const createCustomTheme = (custom: CustomColours): Theme => {
  return createTheme({
    components: {
      ...overrides,
    },
    sizes: {
      mainWidthMin: 1280,
      mainWidthMax: 3840,
    },
    palette: {
      success: {
        main: custom.primary,
      },
      primary: {
        main: custom.primary,
      },
      secondary: {
        main: custom.secondary,
      },
      custom: {
        background: {
          main:
            'linear-gradient(90deg, ' +
            custom.backPrimary +
            ' 30%,' +
            custom.backSecondary +
            ' 100%)',
        },
        textInsideBox: {
          main: custom.textInsideBox,
        },
        transparentBox: {
          main: custom.transparentBox,
        },
      },
      info: {
        main: '#edf7ff',
      },
      warning: {
        main: '#fff2c6',
      },
      error: {
        main: '#ffc6c6',
      },
    },
  })
}

const teals: CustomColours = {
  primary: teal[800],
  secondary: teal[100],
  backPrimary: teal[700],
  backSecondary: teal[400],
  textInsideBox: '#fff',
  transparentBox: 'rgba(255,255,255,0.15)',
}

const cyans: CustomColours = {
  primary: cyan[800],
  secondary: cyan[100],
  backPrimary: cyan[700],
  backSecondary: cyan[600],
  textInsideBox: '#fff',
  transparentBox: 'rgba(255,255,255,0.15)',
}

const bee: CustomColours = {
  primary: 'rgba(235,150,5,1)',
  secondary: '#e6c338',
  backPrimary: grey[200],
  backSecondary: grey[100],
  textInsideBox: grey[800],
  transparentBox: 'rgba(255,255,255,0.75)',
}

const beeLight: CustomColours = {
  primary: '#A67951',
  secondary: '#BFA450',
  backPrimary: '#FAFAFA',
  backSecondary: '#FAFAFA',
  textInsideBox: grey[800],
  transparentBox: 'rgba(255,255,255,0.95)',
}

const blueGreen: CustomColours = {
  primary: 'rgba(0,121,145,1)',
  secondary: 'rgba(27,230,212,1)',
  backPrimary: 'rgba(0,121,145,1)',
  backSecondary: 'rgba(143,205,186,1)',
  textInsideBox: '#fff',
  transparentBox: 'rgba(255,255,255,0.15)',
}

const earth: CustomColours = {
  primary: 'rgba(171,104,94,1)',
  secondary: 'rgba(250,176,99,1)',
  backPrimary: 'rgba(236,228,213,1)',
  backSecondary: 'rgba(241,233,218,1)',
  textInsideBox: grey[800],
  transparentBox: 'rgba(255,255,255,0.35)',
}

export type ThemeName =
  | 'Teal'
  | 'Cyan'
  | 'Bee'
  | 'BeeLight'
  | 'Wood'
  | 'BlueGreen'
  | 'Honey'
  | 'Earth'

export type CustomTheme = {
  name: ThemeName
  theme: Theme
}

export const themes: CustomTheme[] = [
  { name: 'Teal', theme: createCustomTheme(teals) },
  { name: 'Cyan', theme: createCustomTheme(cyans) },
  { name: 'Bee', theme: createCustomTheme(bee) },
  { name: 'BeeLight', theme: createCustomTheme(beeLight) },
  { name: 'BlueGreen', theme: createCustomTheme(blueGreen) },
  { name: 'Earth', theme: createCustomTheme(earth) },
]

export const theme: Theme = createCustomTheme(bee)
