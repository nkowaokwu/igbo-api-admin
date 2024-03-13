import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import IgboAPIAdmin from './IgboAPIAdmin';
import ChakraTheme from './ChakraTheme';
import { ModalProvider } from '../shared/contexts/ModalContext';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import '../styles.css';

export default (props: any): React.ReactElement => (
  <ChakraProvider theme={ChakraTheme}>
    <ModalProvider>
      <IgboAPIAdmin {...props} />
    </ModalProvider>
  </ChakraProvider>
);
