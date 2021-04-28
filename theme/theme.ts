import { createMuiTheme, Theme } from "@material-ui/core";
import { Overrides } from "@material-ui/core/styles/overrides";
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

export const defaultTheme: Theme = createMuiTheme()

const overrides: Overrides = {
  MuiTableCell: {
    sizeSmall: {
      padding: "0 2px 0 2px",
    }
  },
  MuiSelect: {
    select: {
      paddingBottom: "4px",
    }
  }
}

export const theme: Theme = createMuiTheme({
  overrides,
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