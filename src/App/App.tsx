import React, { ReactElement } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import IgboAPIAdmin from './IgboAPIAdmin';
import ChakraTheme from './ChakraTheme';
import '../styles.css';

const App = (): React.ReactElement => <IgboAPIAdmin />;

export default (props: any): ReactElement => (
  <ChakraProvider theme={ChakraTheme}>
    <App {...props} />
  </ChakraProvider>
);
