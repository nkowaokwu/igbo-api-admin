import { extendTheme } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';

const primaryExtraLightColor = '#EBF6F0';
const grayColor = '#4F4F4F';
const lightGrayColor = '#F7FAFC';
const lightOrangeColor = '#FFEBD9';
const orangeColor = '#BF620C';
const redColor = '#E53E3E';
const baseFontSize = '18px';

const breakpoints = createBreakpoints({
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
});

export default extendTheme({
  breakpoints,
  colors: {
    primary: 'black',
    teal: {
      50: '#E6FFFA',
      100: '#F2F9FF',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#264653',
    },
    blue: {
      50: '#EBF8FF',
      100: '#E5EFFC',
      200: '#90CDF4',
      300: '#63B3ED',
      400: '#4299E1',
      500: '#1570FA',
      600: '#2B6CB0',
      700: '#2C5282',
      800: '#2A4365',
      900: '#1A365D',
    },
    gray: {
      900: '#0F172A',
      800: '#1E293B',
      700: '#272727',
      600: grayColor,
      500: '#767373',
      450: '#A0AEC0',
      400: '#C0C0C0',
      300: '#ECECEC',
      200: '#F3F3F3',
      100: '#FAFAFA',
    },
    selected: primaryExtraLightColor,
    inactive: lightGrayColor,
    orange: {
      50: '#FFFAF0',
      100: '#FFEFE0',
      200: lightOrangeColor,
      300: '#F6AD55',
      400: '#ED8936',
      500: '#F2994A',
      600: '#C05621',
      700: orangeColor,
      800: '#7B341E',
      900: '#652B19',
    },
    red: {
      50: '#FFECF1',
      100: '#FFDCDC',
      200: '#FEB2B2',
      300: '#FC8181',
      400: '#F56565',
      500: redColor,
      600: '#C53030',
      700: '#D10A0A',
      800: '#822727',
      900: '#63171B',
    },
    cyan: {
      50: '#EDFDFD',
      100: '#D8ECFE',
      200: '#9DECF9',
      300: '#76E4F7',
      400: '#0BC5EA',
      500: '#00B5D8',
      600: '#00A3C4',
      700: '#0987A0',
      800: '#086F83',
      900: '#065666',
    },
    yellow: {
      50: '#FFFFF0',
      100: '#FEFCBF',
      200: '#FCD770',
      300: '#F6E05E',
      400: '#ECC94B',
      500: '#D69E2E',
      600: '#B7791F',
      700: '#975A16',
      800: '#744210',
      900: '#5F370E',
    },
    green: {
      50: '#F0FFF4',
      100: '#F0FCF6',
      200: '#E0EBE5',
      300: '#149E46',
      400: '#366145',
      500: '#38A169',
      600: '#2F855A',
      700: '#276749',
      800: '#2A4A36',
      900: '#1C4532',
    },
    magenta: {
      50: '#F8E6FF',
      100: '#F2CCFF',
      200: '#EBB3FF',
      300: '#E599FF',
      400: '#DE80FF',
      500: '#D766FF',
      600: '#D14DFF',
      700: '#CA33FF',
      800: '#C41AFF',
      900: '#BD00FF',
    },
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  components: {
    Alert: {
      baseStyle: {
        container: {
          borderRadius: 'md',
          boxShadow: 'md',
        },
      },
    },
    Skeleton: {
      defaultProps: {
        startColor: 'green.200',
        endColor: 'gray.200',
      },
    },
    Spinner: {
      baseStyle: {
        color: 'black',
      },
    },
    Heading: {
      sizes: {
        '2xl': {
          // h1
          fontSize: '5xl',
          fontWeight: 'bold',
        },
        xl: {
          // h2
          fontSize: '3xl',
          fontWeight: 'bold',
        },
        lg: {
          // h3
          fontSize: '2xl',
          heading: 'Noto Sans',
          fontWeight: 'normal',
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          boxShadow: 'sm',
          backgroundColor: 'white',
          transition: 'all .2s ease',
          borderColor: 'gray.400',
          borderWidth: '1px',
          '::placeholder': {
            color: 'gray.400',
          },
        },
      },
      sizes: {},
      defaultProps: {
        variant: '',
      },
    },
    Select: {
      baseStyle: {
        field: {
          fontFamily: 'heading',
          borderColor: 'gray.200 !important',
          borderWidth: '1px',
          ':focus': {
            borderColor: 'green.200 !important',
            borderWidth: '1px',
          },
          ':active': {
            borderColor: 'green.200 !important',
            borderWidth: '1px',
          },
          ':hover': {
            borderColor: 'green.200 !important',
            borderWidth: '1px',
          },
        },
      },
    },
    Button: {
      baseStyle: {
        borderWidth: '1px',
        borderColor: 'gray.400',
        fontFamily: 'heading',
        boxShadow: 'sm',
      },
      variants: {
        ghost: {
          borderWidth: '0px',
          boxShadow: 'none',
        },
        primary: {
          backgroundColor: 'black',
          color: 'white',
          borderColor: 'gray.900',
        },
      },
    },
    Textarea: {
      baseStyle: {
        boxShadow: 'sm',
        backgroundColor: 'white',
        transition: 'all .2s ease',
        borderColor: 'gray.400',
        borderWidth: '1px',
        '::placeholder': {
          color: 'gray.400',
        },
      },
      sizes: {},
      defaultProps: {
        variant: '',
      },
    },
    Icon: {
      baseStyle: {
        ':hover': {
          backgroundColor: 'transparent',
        },
        ':active': {
          backgroundColor: 'transparent',
        },
        ':focus': {
          backgroundColor: 'transparent',
        },
      },
    },
    Tabs: {
      baseStyle: {
        tab: {
          fontWeight: '600',
          fontColor: 'gray.500',
        },
        tablist: {
          fontWeight: '600',
        },
      },
    },
    Tag: {
      sizes: {
        lg: {
          container: {
            fontWeight: '500',
            borderRadius: 'md',
          },
        },
      },
    },
    Divider: {
      baseStyle: {
        borderColor: 'gray.400',
      },
    },
    StackDivider: {
      baseStyle: {
        borderColor: 'gray.400',
      },
    },
    Modal: {
      baseStyle: {
        header: {
          fontFamily: 'heading',
        },
      },
    },
  },
  fonts: {
    heading: 'Silka',
    body: 'Noto Sans,Inter,-apple-system,BlinkMacSystemFont,Noto Sans,Arial',
  },
  styles: {
    global: {
      body: {
        color: grayColor,
        fontSize: baseFontSize,
      },
      p: {
        color: grayColor,
      },
      a: {
        color: grayColor,
      },
    },
  },
});
