import React, { ReactElement } from 'react';
import { useListContext } from 'react-admin';
import { Box, Button, Menu, MenuButton, MenuList, MenuItem, Text } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';

const Pagination = (): ReactElement => {
  const { page, perPage, total, setPage, setPerPage } = useListContext();
  const nbPages = Math.ceil(total / perPage) || 1;
  return (
    nbPages > 1 && (
      <Box className="w-full flex flex-row justify-start items-center space-x-3 my-4 px-3">
        <Button
          colorScheme="purple"
          key="prev"
          isDisabled={page <= 1}
          onClick={() => setPage(page - 1)}
          leftIcon={<ChevronLeftIcon />}
        >
          Prev
        </Button>
        {page !== 1 ? <Button onClick={() => setPage(1)}>1</Button> : null}
        {page > 2 ? <Button onClick={() => setPage(page - 1)}>{page - 1}</Button> : null}
        <Box
          data-test="pagination-current-page"
          className={`flex justify-center items-center px-4 h-10 border 
          border-gray-500 border-solid rounded-lg text-bold`}
        >
          {page}
        </Box>
        {page + 1 < nbPages ? <Button onClick={() => setPage(page + 1)}>{page + 1}</Button> : null}
        {page !== nbPages ? <Button onClick={() => setPage(nbPages)}>{nbPages}</Button> : null}
        <Button
          colorScheme="purple"
          key="next"
          isDisabled={page === nbPages}
          onClick={() => setPage(page + 1)}
          rightIcon={<ChevronRightIcon />}
        >
          Next
        </Button>
        <Menu id="per-page-menu">
          {({ isOpen }) => (
            <>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {perPage}
              </MenuButton>
              {isOpen ? (
                <MenuList>
                  <MenuItem onClick={() => setPerPage(10)}>10</MenuItem>
                  <MenuItem onClick={() => setPerPage(25)}>25</MenuItem>
                  <MenuItem onClick={() => setPerPage(50)}>50</MenuItem>
                  <MenuItem onClick={() => setPerPage(100)}>100</MenuItem>
                </MenuList>
              ) : null}
            </>
          )}
        </Menu>
        <Text>{`${perPage * (page - 1) + 1} - ${perPage * page > total ? total : perPage * page} of ${total}`}</Text>
      </Box>
    )
  );
};

export default Pagination;
