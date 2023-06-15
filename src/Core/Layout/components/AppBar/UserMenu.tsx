import React, { ReactElement } from 'react';
import { UserMenu as ReactAdminUserMenu } from 'react-admin';
import { Box, Button, ButtonProps } from '@chakra-ui/react';
import { BUG_REPORT_URL, CROWDSOURCING_SLACK_CHANNEL, FEATURE_REQUEST_FORM_URL } from 'src/Core/constants';

const ConfigurationMenu = React.forwardRef(
  (
    { leftIcon, primaryText, href, ...rest }: { primaryText: string; href: string } & ButtonProps,
    ref
  ): ReactElement => (
    <a href={href} target="_blank" rel="noreferrer">
      <Button
        ref={ref}
        leftIcon={leftIcon}
        {...rest}
        backgroundColor="white"
        _hover={{ backgroundColor: 'white' }}
        _active={{ backgroundColor: 'white' }}
        _focus={{ backgroundColor: 'white' }}
      >
        {primaryText}
      </Button>
    </a>
  )
);

const UserMenu = (props: any): ReactElement => (
  <ReactAdminUserMenu {...props}>
    <Box className="flex flex-col space-y-1">
      <ConfigurationMenu
        href={CROWDSOURCING_SLACK_CHANNEL}
        primaryText="Contact the team"
        leftIcon={(() => (
          <>📨</>
        ))()}
      />
      <ConfigurationMenu
        href={BUG_REPORT_URL}
        primaryText="Report a bug"
        leftIcon={(() => (
          <>🐛</>
        ))()}
      />
      <ConfigurationMenu
        href={FEATURE_REQUEST_FORM_URL}
        primaryText="Request a feature"
        leftIcon={(() => (
          <>✅</>
        ))()}
      />
    </Box>
  </ReactAdminUserMenu>
);

export default UserMenu;
