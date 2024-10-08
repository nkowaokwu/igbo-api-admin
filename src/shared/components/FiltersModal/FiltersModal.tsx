import React, { useEffect, useState } from 'react';
import { useListContext } from 'react-admin';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Text,
  useBreakpointValue,
  Heading,
  VStack,
  HStack,
  Tag,
  chakra,
} from '@chakra-ui/react';
import { ChevronLeftIcon, CloseIcon } from '@chakra-ui/icons';
import Collection from 'src/shared/constants/Collection';
import { FiFilter } from 'react-icons/fi';
import { FilterConfig } from 'src/shared/components/FiltersModal/configs/filterConfigInterfaces';
import RenderConfigOption from 'src/shared/components/FiltersModal/RenderConfigOption';
import RenderConfigPanel from 'src/shared/components/FiltersModal/RenderConfigPanel';

export enum FilterCategoryType {
  WORD_ATTRIBUTES = 'Word Attributes',
  EXAMPLE_ATTRIBUTES = 'Sentence Attributes',
  PART_OF_SPEECH = 'Parts of Speech',
  CONTRIBUTORS = 'Contributors',
}

interface FilterCategory {
  label: string;
  options: { value: string; label: string }[];
}

const ResourceFilterLabel = {
  [Collection.WORDS]: 'Words',
  [Collection.WORD_SUGGESTIONS]: 'Word drafts',
  [Collection.EXAMPLES]: 'Sentences',
  [Collection.EXAMPLE_SUGGESTIONS]: 'Sentence drafts',
};

const FiltersModal = ({
  resource,
  config,
  isOpen,
  onClose,
}: {
  resource: Collection;
  config: FilterConfig[];
  isOpen: boolean;
  onClose: () => void;
}): React.ReactElement => {
  const { filterValues, setFilters } = useListContext();
  const [localFilter, setLocalFilter] = useState({});
  const [filterCategory, setFilterCategory] = useState<FilterCategory | null>(null);
  const [filterView, setFilterView] = useState<string>(null);
  const size = useBreakpointValue({ base: 'full', sm: '2xl' });

  const goBack = () => {
    if (filterCategory) {
      setFilterCategory(null);
    }
  };

  const handleOnChange = ({ key, value }: { key: string; value: any }) => {
    let finalValue = value;
    if (Array.isArray(finalValue)) {
      finalValue = finalValue.map(({ value }) => value);
    }
    setLocalFilter({ ...localFilter, [key]: finalValue });
  };

  const onClearFilters = () => {
    setLocalFilter({});
  };

  const handleApplyFilters = () => {
    setFilters(localFilter, []);
    onClose();
  };

  useEffect(() => {
    setLocalFilter(filterValues);
  }, [isOpen]);

  return (
    <Modal onClose={onClose} isOpen={isOpen} size={size} isCentered onEsc={onClose}>
      <ModalOverlay />
      <ModalContent backgroundColor="white" borderTopRadius="lg" position="relative">
        <Box className="flex flex-row justify-between items-center">
          {filterCategory ? (
            <IconButton
              aria-label="Go back button"
              icon={<ChevronLeftIcon boxSize={6} />}
              onClick={goBack}
              position="absolute"
              top="2"
              left="3"
              backgroundColor="transparent"
            />
          ) : null}
          <ModalCloseButton onClick={onClose} />
        </Box>
        <VStack width="full" alignItems="start" borderBottomColor="gray.300" borderBottomWidth="1px" p={4}>
          <Heading textAlign="left" fontSize="xl">
            Filters for: {ResourceFilterLabel[resource]}
          </Heading>
          <Text fontSize="md" color="gray.500">
            See results in your view based on the filters you select here.
          </Text>
        </VStack>
        <ModalBody p={0}>
          <HStack width="full" justifyContent="space-between" spacing={0} height="xl">
            <VStack
              width="full"
              height="full"
              flex={4}
              p={4}
              gap={2}
              borderRightColor="gray.300"
              borderRightWidth="1px"
              justifyContent="flex-start"
            >
              <HStack justifyContent="space-between" width="full">
                <Heading fontSize="xl" fontFamily="body">
                  Filters
                </Heading>
                {Object.keys(localFilter).length ? (
                  <Tag backgroundColor="gray.200" borderRadius="full" gap={2}>
                    <chakra.span>{Object.keys(localFilter).length} applied</chakra.span>
                    <IconButton
                      icon={<CloseIcon />}
                      onClick={onClearFilters}
                      size="xs"
                      color="gray.700"
                      aria-label="Applied filters"
                      variant="ghost"
                      width="fit-content"
                      minWidth="auto"
                      _hover={{ backgroundColor: 'transparent' }}
                      _active={{ backgroundColor: 'transparent' }}
                      _focus={{ backgroundColor: 'transparent' }}
                    />
                  </Tag>
                ) : null}
              </HStack>
              <VStack width="full" alignItems="start" gap={2}>
                {config.map((c) => (
                  <RenderConfigOption config={c} onClick={setFilterView} isCurrentOption={c.title === filterView} />
                ))}
              </VStack>
            </VStack>
            <VStack p={4} flex={6} width="full" height="full" backgroundColor="gray.50">
              {!filterView ? (
                <VStack width="full" alignItems="center" pt={6}>
                  <FiFilter size="36px" />
                  <Heading fontSize="xl" fontFamily="body">
                    Select filter
                  </Heading>
                  <Text>Select a filter in the left panel to see it</Text>
                </VStack>
              ) : (
                <RenderConfigPanel config={config} view={filterView} onChange={handleOnChange} values={localFilter} />
              )}
            </VStack>
          </HStack>
        </ModalBody>
        <ModalFooter
          backgroundColor="white"
          width="full"
          p={0}
          borderBottomRadius="2xl"
          borderTopColor="gray.300"
          borderTopWidth="1px"
        >
          <HStack width="full" justifyContent="flex-end" p={4}>
            <HStack gap={4}>
              <Button>Cancel</Button>
              <Button variant="primary" onClick={handleApplyFilters}>
                Apply filters
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default FiltersModal;
