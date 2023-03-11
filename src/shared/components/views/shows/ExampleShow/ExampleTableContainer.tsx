import React, { ReactElement } from 'react';
import {
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  chakra,
} from '@chakra-ui/react';
import SentenceType from 'src/backend/shared/constants/SentenceType';
import DiffField from '../diffFields/DiffField';

const ExampleTableContainer = ({
  diffRecord,
  english,
  igbo,
  meaning,
  nsibidi,
  style,
} : {
  diffRecord: any,
  english: string,
  igbo: string,
  meaning: string,
  nsibidi: string
  style: SentenceType | false,
}): ReactElement => (
  <TableContainer>
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Field</Th>
          <Th>Data</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>
            <Heading fontSize="lg" fontWeight="normal" className="text-gray-600">
              English
            </Heading>
          </Td>
          <Td>
            <DiffField
              path="english"
              diffRecord={diffRecord}
              fallbackValue={english}
              renderNestedObject={(value) => <span>{String(value || false)}</span>}
            />
          </Td>
        </Tr>
        <Tr>
          <Td>
            <Heading fontSize="lg" fontWeight="normal" className="text-gray-600">
              Igbo
            </Heading>
          </Td>
          <Td>
            <DiffField
              path="igbo"
              diffRecord={diffRecord}
              fallbackValue={igbo}
              renderNestedObject={(value) => <span>{String(value || false)}</span>}
            />
          </Td>
        </Tr>
        <Tr>
          <Td>
            <Heading fontSize="lg" fontWeight="normal" className="text-gray-600">
              Meaning
            </Heading>
          </Td>
          <Td>
            <DiffField
              path="meaning"
              diffRecord={diffRecord}
              fallbackValue={meaning}
              renderNestedObject={(value) => <chakra.span>{String(value || false)}</chakra.span>}
            />
          </Td>
        </Tr>
        <Tr>
          <Td>
            <Heading fontSize="lg" fontWeight="normal" className="text-gray-600">
              Nsịbịdị
            </Heading>
          </Td>
          <Td>
            <DiffField
              path="nsibidi"
              diffRecord={diffRecord}
              fallbackValue={nsibidi}
              renderNestedObject={(value) => (
                <chakra.span className="akagu">{String(value || false)}</chakra.span>
              )}
            />
          </Td>
        </Tr>
        <Tr>
          <Td>
            <Heading fontSize="lg" fontWeight="normal" className="text-gray-600">
              Sentence Style
            </Heading>
          </Td>
          <Td>
            <DiffField
              path="style"
              diffRecord={diffRecord}
              fallbackValue={style}
              renderNestedObject={(value) => (
                <chakra.span className={`${!value ? 'italic' : ''}`}>{String(value || 'No style')}</chakra.span>
              )}
            />
          </Td>
        </Tr>
      </Tbody>
    </Table>
  </TableContainer>
);

export default ExampleTableContainer;
