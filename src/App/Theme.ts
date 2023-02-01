import { createTheme } from '@material-ui/core/styles';

const silkaFontFamily = ['Silka', 'system-ui', 'Roboto', 'Helvetic', 'sans-serif'].join(',');
const theme = createTheme({
  overrides: {
    RaAppBar: {
      toolbar: {
        backgroundColor: '#417453 !important',
        backgroundImage: 'url(\'https://nkowaokwu.s3.us-west-1.amazonaws.com'
          + '/assets/images/igboAPIEditorPlatform/pattern.png\')',
        backgroundSize: 'contain',
      },
      menuButton: {
        '*': {
          fill: 'white',
        },
      },
    },
    MuiMenuItem: {
      root: {
        fontFamily: silkaFontFamily,
        marginBottom: 'var(--chakra-sizes-1)',
        paddingTop: '8px',
        paddingBottom: '8px',
        fontWeight: 700,
      },
    },
    MuiListItem: {
      button: {
        color: 'var(--chakra-colors-gray-800)',
        '&:hover': {
          backgroundColor: 'var(--chakra-colors-gray-100)',
          color: 'var(--chakra-colors-gray-800)',
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
        color: 'white',
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
    RaUserMenu: {
      userButton: {
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
      },
    },
    RaLayout: {
      root: {
        backgroundColor: 'var(--chakra-colors-white)',
      },
      content: {
        backgroundColor: 'var(--chakra-colors-white) !important',
        marginLeft: 'var(--chakra-sizes-0)',
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
        paddingRight: 'var(--chakra-sizes-0)',
        backgroundColor: 'var(--chakra-colors-white)',
        position: 'relative',
      },
      drawerPaper: {
        width: 'auto',
      },
    },
    RaMenu: {
      closed: {
        width: '44px',
      },
    },
    RaMenuItemLink: {
      root: {
        color: 'var(--chakra-colors-gray-600)',
      },
      active: {
        color: 'var(--chakra-colors-green-500)',
        backgroundColor: 'var(--chakra-colors-gray-200)',
        borderRightWidth: '5px',
        borderRightColor: 'var(--chakra-colors-green-500)',
        borderRightStyle: 'solid',
        '&:hover': {
          color: 'var(--chakra-colors-green-500)',
        },
      },
      icon: {
        minWidth: '30px',
      },
    },
  },
});

export default theme;
