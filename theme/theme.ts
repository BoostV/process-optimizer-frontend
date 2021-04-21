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
      main: 'rgba(0,121,145,1)',
    },
    secondary: {
      main: 'rgba(27,230,212,1)',
      dark: 'rgba(23,204,188,1)',
    },
    custom: {
      background: {
        main: 'linear-gradient(90deg, rgba(0,121,145,1) 30%, rgba(143,205,186,1) 100%)',
      }
    }
  }
});