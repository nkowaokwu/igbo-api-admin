import React, { ReactElement } from 'react';
import { Box, Heading, Hide, Text } from '@chakra-ui/react';
import moment from 'moment';
import LoginStats from 'src/Login/LoginStats';
import UserRoles from '../backend/shared/constants/UserRoles';
import CredentialsForm from './CredentialsForm';

export interface SignupInfo {
  email: string;
  password: string;
  displayName: string;
  role: UserRoles.USER;
}

const Login = (): ReactElement => (
  <Box display="flex" flexDirection="row" height="100vh">
    <Hide below="lg">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        flex={1}
        backgroundColor="#417453"
        // eslint-disable-next-line max-len
        backgroundImage="url('https://nkowaokwu.s3.us-west-1.amazonaws.com/assets/images/igboAPIEditorPlatform/pattern.png')"
        backgroundSize="82px 44px"
        height="full"
        padding={12}
      >
        <Heading as="h1" fontFamily="Silka" color="white" fontSize="2xl">
          Igbo API Editor Platform
        </Heading>
        <Box>
          <Box className="space-y-4 w-10/12">
            <Heading as="h2" fontFamily="Silka" color="white" fontSize={{ base: '4xl', md: '6xl' }}>
              Building accessible Igbo technology for everyone.
            </Heading>
            <Text as="h3" fontFamily="Silka" color="white" fontSize="xl">
              Create an account and join our volunteers to build the largest Igbo dataset ever.
            </Text>
          </Box>
          <Box className="mt-12">
            <LoginStats className="justify-start" />
          </Box>
        </Box>
        <Text as="p" color="blue.100" fontSize="md">
          {`© ${moment().year()} Nkọwa okwu. All rights reserved.`}
        </Text>
      </Box>
    </Hide>
    <Box
      display="flex"
      flexDirection="column"
      justifyContent={{ base: 'start', lg: 'center ' }}
      alignItems="center"
      flex={1}
      width={{ base: '100vw', lg: 'auto' }}
      backgroundColor="white"
      height="full"
      padding={12}
    >
      <Box display="flex" flexDirection="column" justifyContent="center" className="space-y-4">
        <Hide above="lg">
          <Heading as="h1" fontFamily="Silka" color="gray.700" fontSize="2xl" textAlign="center">
            Igbo API Editor Platform
          </Heading>
        </Hide>
        <CredentialsForm />
      </Box>
    </Box>
  </Box>
);

export default Login;
