import React, { ReactElement } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import IgboAPIAdmin from './IgboAPIAdmin';
import ChakraTheme from './ChakraTheme';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import '../styles.css';

export default (props: any): ReactElement => (
  <ChakraProvider theme={ChakraTheme}>
    <IgboAPIAdmin {...props} />
  </ChakraProvider>
);
