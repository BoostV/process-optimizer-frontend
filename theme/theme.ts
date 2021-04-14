import { createMuiTheme } from "@material-ui/core";

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    custom: {
      background: PaletteColor
    }
  }
  interface PaletteOptions {
    custom?: {
      background: PaletteColorOptions
    }
  }
}

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#39889c',
    },
    secondary: {
      main: '#1be6d4',
      dark: '#17ccbc',
    },
    custom: {
      background: {
        main: '#39889c',
      }
    }
  }
});