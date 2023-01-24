import { createTheme } from '@material-ui/core/styles';

const silkaFontFamily = ['Silka', 'system-ui', 'Roboto', 'Helvetic', 'sans-serif'].join(',');
const theme = createTheme({
  overrides: {
    MuiMenuItem: {
      root: {
        fontFamily: silkaFontFamily,
        marginBottom: 'var(--chakra-sizes-1)',
      },
    },
    MuiListItem: {
      button: {
        color: 'var(--chakra-colors-gray-800)',
        '&:hover': {
          backgroundColor: 'var(--chakra-colors-gray-100)',
          color: 'var(--chakra-colors-gray-800)',
          borderRadius: 'var(--chakra-radii-md)',
        },
      },
    },
    MuiCheckbox: {
      root: {
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiTableCell: {
      root: {
        fontFamily: silkaFontFamily,
      },
      head: {
        fontWeight: 'var(--chakra-fontWeights-bold)',
      },
    },
    MuiTableSortLabel: {
      root: {
        fontWeight: 'var(--chakra-fontWeights-bold)',
      },
    },
    MuiButton: {
      label: {
        fontFamily: silkaFontFamily,
      },
    },
    MuiButtonBase: {
      root: {
        outline: 'none',
        fontFamily: silkaFontFamily,
        paddingTop: 'var(--chakra-sizes-2)',
        paddingBottom: 'var(--chakra-sizes-2)',
      },
    },
    MuiIconButton: {
      root: {
        outline: 'none',
        fontFamily: silkaFontFamily,
      },
    },
    RaLayout: {
      root: {
        backgroundColor: 'var(--chakra-colors-white)',
      },
      content: {
        backgroundColor: 'var(--chakra-colors-white) !important',
        marginLeft: 'var(--chakra-sizes-2)',
        overflowY: 'hidden',
      },
      contentWithSidebar: {
        backgroundColor: 'var(--chakra-colors-white)',
      },
    },
    RaSidebar: {
      fixed: {
        paddingTop: 'var(--chakra-sizes-6)',
        paddingLeft: 'var(--chakra-sizes-1)',
        paddingRight: 'var(--chakra-sizes-1)',
        backgroundColor: 'var(--chakra-colors-white)',
      },
    },
    RaMenu: {
      closed: {
        width: '44px',
      },
    },
    RaMenuItemLink: {
      root: {
        color: 'var(--chakra-colors-gray-800)',
        borderRadius: 'var(--chakra-radii-md)',
      },
      active: {
        backgroundColor: 'var(--chakra-colors-gray-100)',
      },
      icon: {
        minWidth: '30px',
      },
    },
  },
});

export default theme;
