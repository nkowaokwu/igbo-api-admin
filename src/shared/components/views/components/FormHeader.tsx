import React, { ReactElement } from 'react';
import { noop } from 'lodash';
import { Box, Heading, Text, Tooltip } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';

const FormHeader = ({
  title,
  subtitle,
  tooltip,
  color,
  onClick,
  href,
}: {
  title: string;
  subtitle?: string;
  tooltip?: string;
  color?: string;
  onClick?: () => any;
  href?: string;
}): ReactElement => {
  const handleClickLink = () => {
    if (href) {
      window.open(href, '_blank');
    }
  };
  return (
    <Box className={`flex flex-row items-center${onClick ? ' cursor-pointer' : ''}`} onClick={onClick || noop}>
      <Box>
        <Heading
          as="h2"
          className={`form-header${onClick ? ' hover:underline' : ''}`}
          fontSize="xl"
          fontWeight="normal"
          color={color}
        >
          {title}
        </Heading>
        {subtitle ? (
          <Text fontSize="sm" color="gray.400" fontStyle="italic">
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {tooltip ? (
        <Tooltip label={tooltip}>
          <InfoOutlineIcon color={color} className="ml-2" onClick={handleClickLink} />
        </Tooltip>
      ) : null}
    </Box>
  );
};

FormHeader.defaultProps = {
  tooltip: '',
  color: 'gray.700',
  onClick: null,
};

export default FormHeader;
