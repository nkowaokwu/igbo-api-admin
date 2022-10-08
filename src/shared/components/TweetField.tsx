import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box, Link } from '@chakra-ui/react';
import { TWITTER_APP_URL } from 'src/Core/constants';
import { IdFieldProps } from '../interfaces';

const TweetField = ({ source, record = {} }: IdFieldProps): ReactElement => (
  <Box display="flex" flexDirection="row" alignItems="center" className="space-x-4">
    <Link
      className="MuiTypography-root MuiTypography-body"
      href={`${TWITTER_APP_URL}/${get(record, source)}`}
      color="green.600"
      textDecoration="underline"
      target="_blank"
    >
      Go to tweet
    </Link>
  </Box>
);
export default TweetField;
