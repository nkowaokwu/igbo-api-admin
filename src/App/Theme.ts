import { createTheme } from '@material-ui/core/styles';

const silkaFontFamily = ['Silka', 'system-ui', 'Roboto', 'Helvetic', 'sans-serif'].join(',');
const theme = createTheme({
  overrides: {
    RaAppBar: {
      toolbar: {
        borderBottom: '1px solid var(--chakra-colors-gray-300)',
      },
      menuButton: {
        '*': {
          fill: 'white',
        },
      },
    },
    MuiAppBar: {
      root: {
        boxShadow: 'none',
        position: 'relative',
      },
      positionFixed: {
        position: 'relative',
      },
      toolbar: {
        backgroundColor: 'white',
      },
    },
    MuiDrawer: {
      root: {
        borderRight: '1px solid var(--chakra-colors-gray-300)',
      },
      // Desktop
      paperAnchorDockedLeft: {
        paddingBottom: '0 !important',
      },
      // Mobile
      paperAnchorLeft: {
        paddingBottom: 'var(--chakra-sizes-16)',
      },
    },
    MuiPaper: {
      root: {
        width: '100vw',
      },
      rounded: {
        border: '1px solid var(--chakra-colors-gray-300) !important',
        boxShadow: 'none !important',
      },
    },
    MuiPopover: {
      paper: {
        width: 'fit-content',
        right: '16px !important',
        left: 'auto',
      },
    },
    MuiTableRow: {
      root: {
        backgroundColor: 'transparent !important',
      },
    },
    MuiMenuItem: {
      root: {
        fontFamily: silkaFontFamily,
        marginBottom: 'var(--chakra-sizes-1)',
        paddingTop: '8px',
        paddingBottom: '8px',
        fontWeight: 700,
        width: 'fit-content',
      },
    },
    MuiListItem: {
      button: {
        color: 'var(--chakra-colors-gray-800)',
        '&:hover': {
          backgroundColor: 'var(--chakra-colors-gray-200)',
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
    MuiTableHead: {
      root: {
        backgroundColor: 'var(--chakra-colors-white) !important',
      },
    },
    MuiTableCell: {
      root: {
        backgroundColor: 'var(--chakra-colors-white) !important',
        fontFamily: silkaFontFamily,
      },
      head: {
        backgroundColor: 'var(--chakra-colors-white)',
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
    MuiSvgIcon: {
      root: {
        fill: '',
      },
    },
    RaUserMenu: {
      userButton: {
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
      },
    },
    RaList: {
      root: {
        backgroundColor: 'var(--chakra-colors-white) !important',
      },
    },
    RaLayout: {
      root: {
        backgroundColor: 'var(--chakra-colors-white)',
      },
      appFrame: {
        marginTop: '0 !important',
      },
      content: {
        backgroundColor: 'var(--chakra-colors-white) !important',
        marginLeft: 'var(--chakra-sizes-0)',
        padding: '0 var(--chakra-sizes-4) var(--chakra-sizes-12) !important',
        overflowY: 'scroll',
        height: '100vh',
      },
      contentWithSidebar: {
        backgroundColor: 'var(--chakra-colors-white)',
      },
    },
    RaSidebar: {
      fixed: {
        padding: 'var(--chakra-sizes-0)',
        backgroundColor: 'var(--chakra-colors-white)',
        position: 'unset',
      },
      drawerPaper: {
        width: 'auto',
        backgroundColor: 'white !important',
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
        margin: 'var(--chakra-sizes-2) 0',
        borderRadius: '10px',
        '&:focus': {
          color: 'var(--chakra-colors-blue-500)',
        },
        fontWeight: 'normal',
        width: '100%',
      },
      active: {
        color: 'var(--chakra-colors-blue-500)',
        backgroundColor: 'var(--chakra-colors-blue-100)',
        '&:hover': {
          color: 'var(--chakra-colors-blue-500)',
        },
      },
      icon: {
        minWidth: '30px',
      },
    },
  },
});

export default theme;
