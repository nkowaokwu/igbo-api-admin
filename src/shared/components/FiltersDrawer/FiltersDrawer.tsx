import React, { useEffect, useState } from 'react';
import { useListContext } from 'react-admin';
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { FiChevronRight } from 'react-icons/fi';

interface FilterCategory {
  label: string;
  options: { value: string; label: string }[];
}

/**
 * The filter props comes from parsing the URL
 * we want to set the default filters on first load
 * */
const getDefaultFilters = (filters): string[] =>
  Object.entries(filters).reduce((allFilters, [key, value]) => {
    if (value) {
      allFilters.push(key);
    }
    return allFilters;
  }, []);

/**
 * The filter props comes from parsing the URL for parts of speech
 * we want to set the default filters on first load
 * */
const getDefaultPartOfSpeechFilters = (filters): string[] =>
  Object.keys(filters).reduce((allFilters, key) => {
    if (key === 'wordClass') {
      allFilters.push(key);
    }
    return allFilters;
  }, []);

const FiltersDrawer = ({
  isOpen,
  header,
  onClose,
  filterCategories,
}: {
  isOpen: boolean;
  header: string;
  onClose: () => void;
  filterCategories: FilterCategory[];
}): React.ReactElement => {
  const { filterValues, setFilters } = useListContext();
  const [filterCategory, setFilterCategory] = useState<FilterCategory | null>(null);
  const [currentFilters, setCurrentFilters] = useState(getDefaultFilters(filterValues));
  const [currentPartOfSpeechFilter, setCurrentPartOfSpeechFilter] = useState(
    getDefaultPartOfSpeechFilters(filterValues),
  );
  const placement = useBreakpointValue({ base: 'bottom', md: 'right' });

  const handleFilterCategoryClick = (filterCategory: FilterCategory) => {
    setFilterCategory(filterCategory);
  };

  const goBack = () => {
    if (filterCategory) {
      setFilterCategory(null);
    }
  };

  const handleCheck = (value: string[]) => {
    if (!filterCategory) return;
    if (filterCategory.label === 'Parts of Speech') {
      setCurrentPartOfSpeechFilter(value);
    } else if (filterCategory.label === 'Word Attributes' || filterCategory.label === 'Example Attributes') {
      setCurrentFilters(value);
    }
  };

  const handleClearFilters = () => {
    if (!filterCategory) return;
    if (filterCategory.label === 'Parts of Speech') {
      setCurrentPartOfSpeechFilter([]);
    } else if (filterCategory.label === 'Word Attributes' || filterCategory.label === 'Example Attributes') {
      setCurrentFilters([]);
    }
  };

  const handleShowAllMatches = () => {
    const updatedFilters: { wordClass?: string[] } = currentFilters.reduce((allFilters, filter) => {
      if (filter === 'noNsibidi') {
        // @ts-expect-error nsibidi
        allFilters.nsibidi = false;
      } else if (filter === 'noPronunciation') {
        // @ts-expect-error pronunciation
        allFilters.pronunciation = false;
      } else if (filter !== 'word' && filter !== 'example') {
        allFilters[filter] = true;
      }
      return allFilters;
    }, {});
    if (currentPartOfSpeechFilter.length) {
      updatedFilters.wordClass = currentPartOfSpeechFilter;
    }
    setFilters(updatedFilters, []);
    onClose();
  };

  useEffect(() => {
    setFilterCategory(null);
  }, [isOpen]);

  return (
    // @ts-expect-error string vs. placement enum
    <Drawer onClose={onClose} isOpen={isOpen} placement={placement} size="sm">
      <DrawerOverlay />
      <DrawerContent bgColor="gray.200" borderTopRadius="lg">
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
          <DrawerCloseButton onClick={onClose} />
        </Box>
        <DrawerHeader textAlign="center">{filterCategory?.label || header}</DrawerHeader>
        <DrawerBody className="space-y-4">
          {!filterCategory ? (
            filterCategories.map((filterCategory) => (
              <Button
                key={filterCategory.label}
                rightIcon={<FiChevronRight />}
                borderRadius="lg"
                width="full"
                backgroundColor="white"
                height="16"
                padding="4"
                className="flex flex-row justify-between items-center"
                _hover={{ backgroundColor: 'white' }}
                _active={{ backgroundColor: 'white' }}
                _focus={{ backgroundColor: 'white' }}
                onClick={() => handleFilterCategoryClick(filterCategory)}
              >
                <Text fontWeight="bold">{filterCategory.label}</Text>
              </Button>
            ))
          ) : (
            <Box backgroundColor="white" borderRadius="lg" padding="4">
              <CheckboxGroup onChange={handleCheck} defaultValue={currentFilters.concat(currentPartOfSpeechFilter)}>
                {filterCategory.options.map(({ value, label }) => (
                  <Box key={value} className="flex flex-row justify-between items-center" margin="4">
                    <Text>{label}</Text>
                    <Checkbox value={value} borderColor="gray.500" />
                  </Box>
                ))}
              </CheckboxGroup>
            </Box>
          )}
        </DrawerBody>
        {filterCategory ? (
          <DrawerFooter className="flex flex-row justify-between items-center">
            <Button flex={1} variant="ghost" onClick={handleClearFilters}>
              Clear filters
            </Button>
            <Button
              flex={1}
              colorScheme="purple"
              isDisabled={!currentFilters.length && !currentPartOfSpeechFilter.length}
              onClick={handleShowAllMatches}
            >
              Show all matches
            </Button>
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
};
export default FiltersDrawer;
