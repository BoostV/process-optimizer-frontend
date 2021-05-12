import { createMuiTheme, PaletteColorOptions, Theme } from "@material-ui/core";
import { brown, cyan, deepOrange, grey, teal } from "@material-ui/core/colors";
import { Overrides } from "@material-ui/core/styles/overrides";
declare module '@material-ui/core/styles/createPalette' {
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

const overrides: Overrides = {
  MuiTableCell: {
    sizeSmall: {
      padding: "0 2px 0 2px",
    }
  },
  MuiSelect: {
    select: {
      paddingBottom: 4,
    }
  },
  MuiListItem: {
    root: {
      paddingTop: 0,
      paddingBottom: 0,
    }
  },
  MuiCardContent: {
    root: {
      '&:last-child': {
        paddingBottom: 0,
      }
    }
  }
}
declare module '@material-ui/core/styles/createMuiTheme' {
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
  return createMuiTheme({
    overrides,
    sizes: {
      mainWidthMin: 1280,
      mainWidthMax: 3840,
    },
    palette: {
      primary: {
        main: custom.primary,
      },
      secondary: {
        main: custom.secondary,
      },
      custom: {
        background: {
          main: 'linear-gradient(90deg, ' + custom.backPrimary + ' 30%,' + custom.backSecondary + ' 100%)',
        },
        textInsideBox: {
          main: custom.textInsideBox,
        },
        transparentBox: {
          main: custom.transparentBox,
        },
      }
    }
  });
}

const teals: CustomColours = {
  primary: teal[800],
  secondary: teal[100],
  backPrimary: teal[600],
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

/*
bee:
#A67951
#734F2F
#BFA450
#F2DF80
#BE8037
*/

const bee: CustomColours = {
  primary: '#BE8037',
  secondary: '#F2DF80',
  backPrimary: '#A67951',
  backSecondary: '#A67951',
  textInsideBox: '#fff',
  transparentBox: 'rgba(255,255,255,0.15)',
}

const beeLight: CustomColours = {
  primary: '#A67951',
  secondary: '#BFA450',
  backPrimary: '#FAFAFA',
  backSecondary: '#FAFAFA',
  textInsideBox: grey[800],
  transparentBox: 'rgba(255,255,255,0.95)',
}

/*
wood:
#732002
#BF9D5E
#F2D785
#0D3B29
#6379F2
and
#d8e0d3
#A67951
*/

const wood: CustomColours = {
  primary: '#A67951',
  secondary: '#BF9D5E',
  backPrimary: '#d8e0d3',
  backSecondary: '#d8e0d3',
  textInsideBox: grey[800],
  transparentBox: 'rgba(255,255,255,0.35)',
}

/*
honey:
#03A688
#F2B705
#F28705
#A63F03
#A63F03
#400101
and
#f5da88 
#ffd760
#fff3cf
#fff4d3
*/

const honey: CustomColours = {
  primary: '#A63F03',
  secondary: '#03A688',
  backPrimary: '#fff4d3',
  backSecondary: '#fff3cf',
  textInsideBox: grey[800],
  transparentBox: 'rgba(255,255,255,0.50)',
}

const blueGreen: CustomColours = {
  primary: 'rgba(0,121,145,1)',
  secondary: 'rgba(27,230,212,1)',
  backPrimary: 'rgba(0,141,145,1)',
  backSecondary: 'rgba(143,205,186,1)',
  textInsideBox: '#fff',
  transparentBox: 'rgba(255,255,255,0.15)',
}

/*
earth:
rgba(136,91,90,1)
rgba(171,104,94,1)
rgba(240,139,106,1)
rgba(250,176,99,1)
rgba(241,233,218,1)
*/

const earth: CustomColours = {
  primary: 'rgba(171,104,94,1)',
  secondary: 'rgba(250,176,99,1)',
  backPrimary: 'rgba(241,233,218,1)',
  backSecondary: 'rgba(241,233,218,1)',
  textInsideBox: grey[800],
  transparentBox: 'rgba(255,255,255,0.35)',
}

export type ThemeName =
    'tealTheme'
  | 'cyanTheme'
  | 'beeTheme'
  | 'beeLightTheme'
  | 'woodTheme'
  | 'blueGreenTheme'
  | 'honeyTheme'
  | 'earthTheme'

export const tealTheme: Theme = createCustomTheme(teals)
export const cyanTheme: Theme = createCustomTheme(cyans)
export const beeTheme: Theme = createCustomTheme(bee)
export const beeLightTheme: Theme = createCustomTheme(beeLight)
export const woodTheme: Theme = createCustomTheme(wood)
export const blueGreenTheme: Theme = createCustomTheme(blueGreen)
export const honeyTheme: Theme = createCustomTheme(honey)
export const earthTheme: Theme = createCustomTheme(earth)

export const theme: Theme = blueGreenTheme

