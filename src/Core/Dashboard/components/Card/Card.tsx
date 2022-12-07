import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  Heading,
  Link,
  Text,
  Skeleton,
} from '@chakra-ui/react';

const Card = ({
  icon,
  heading,
  description,
  onClick,
  link,
  buttonLabel,
  render,
  isLoaded,
} : {
  icon?: string,
  heading?: string,
  description?: string,
  onClick?: () => void,
  link?: string,
  buttonLabel?: string,
  render?: any,
  isLoaded?: boolean,
}): ReactElement => (
  <Skeleton isLoaded={isLoaded}>
    <Box
      className={`flex flex-col justify-center items-center h-72 w-full 
      bg-white px-10 py-10 text-gray-800 cursor-pointer transition-all 
      duration-300 hover:border-blue-400 hover:bg-gray-100 space-y-3
      rounded shadow-lg`}
    >
      {render || (
        <>
          <Text fontSize="4xl" textAlign="center">{icon}</Text>
          <Heading fontSize="2xl" textAlign="center" fontFamily="Silka">{heading}</Heading>
          <Text fontSize="lg" textAlign="center">{description}</Text>
          {onClick ? <Button colorScheme="green" onClick={onClick}>{buttonLabel}</Button> : null}
          {link ? (
            <Link href={link} isExternal style={{ textDecoration: 'none' }}>
              <Button colorScheme="green">{buttonLabel}</Button>
            </Link>
          ) : null}
        </>
      )}
    </Box>
  </Skeleton>
);

Card.defaultProps = {
  icon: '',
  heading: '',
  description: '',
  onClick: null,
  link: '',
  buttonLabel: '',
  render: null,
  isLoaded: true,
};

export default Card;
