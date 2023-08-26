import React, { ReactElement } from 'react';
import { Box, Heading } from '@chakra-ui/react';

const SummaryList = ({
  items,
  title,
  render,
}: {
  items: any[];
  title: string;
  render: (value: any, index: number) => any;
}): ReactElement =>
  items.length ? (
    <details className="mt-4 cursor-pointer">
      <summary role="menubar">
        <Heading display="inline" fontSize="lg" className="text-xl text-gray-600" ml={2}>
          {title}
        </Heading>
      </summary>
      <Box className="flex flex-col mt-5">
        {items.map((item, itemIndex) => (
          <Box key={`summary-list-${item.id}`} className="flex flex-row justify-start items-start" role="menuitem">
            {render(item, itemIndex)}
          </Box>
        ))}
      </Box>
    </details>
  ) : null;

export default SummaryList;
