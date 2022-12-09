import React, { ReactElement } from 'react';
import { Box, chakra } from '@chakra-ui/react';
import {
  find,
  isEqual,
  split,
  map,
  isNaN,
} from 'lodash';

/* Ignores depth and instantly matches to the following keys */
const QUICK_MATCH_KEYS = ['definitions', 'variations', 'examples', 'relatedTerms'];
const DiffField = ({
  path,
  diffRecord,
  fallbackValue,
  renderNestedObject,
  className,
} : {
  path: string,
  diffRecord: any,
  fallbackValue: any,
  renderNestedObject?: ((value: any, hasChanged: boolean) => ReactElement | ReactElement[]),
  className?: string,
  akagu?: boolean
}): ReactElement => {
  const DIFF_KEYS = {
    Deletion: 'D',
    Edit: 'E',
    New: 'N',
    Array: 'A',
  };

  /* Returns diffs that are edits */
  const findDiffInRecord = (key) => {
    const keys = map(split(key, '.'), (splitKey) => {
      // Converting all stringified numbers to raw numbers
      const parsedKey = parseInt(splitKey, 10);
      return isNaN(parsedKey) ? splitKey : parsedKey;
    });
    const diff = find(diffRecord, ({ path: diffRecordPath, index }) => {
      if (!diffRecordPath) {
        return null;
      };
      return (
        isEqual(diffRecordPath, keys)
        // quick match for definitions, variations, or examples indexes
        || (isEqual(diffRecordPath, keys.slice(0, keys.length - 1))
          && keys[keys.length - 1] === index
          && QUICK_MATCH_KEYS.includes(diffRecordPath[0]))
      );
    });
    return diff;
  };

  const diffFromPath = findDiffInRecord(path);

  const renderValue = (value, hasChanged) => (
    renderNestedObject ? renderNestedObject(value, hasChanged) : value
  );

  const ValueLabel = ({ children } : { children: any }) => (
    typeof fallbackValue === 'boolean' ? (
      <code className={`text-lg text-gray-800 ${className}`}>{children}</code>
    ) : (
      <h2 className={`text-xl text-gray-800 ${className}`} style={{ whiteSpace: 'pre-wrap' }}>{children}</h2>
    ));

  return diffFromPath ? (
    diffFromPath.kind === DIFF_KEYS.Edit ? (
      <Box className="flex flex-col" data-test={`${path}-diff-field`}>
        <ValueLabel>
          {'Old: '}
          <chakra.span className="deletion-change">
            {renderValue(diffFromPath.lhs, true)}
          </chakra.span>
        </ValueLabel>
        <ValueLabel>
          {'New: '}
          <chakra.span className="addition-change">
            {renderValue(diffFromPath.rhs, true)}
          </chakra.span>
        </ValueLabel>
      </Box>
    ) : diffFromPath.kind === DIFF_KEYS.Array && diffFromPath.item.kind === DIFF_KEYS.New ? (
      <ValueLabel>
        {'New: '}
        <chakra.span className="addition-change">
          {renderValue(diffFromPath.item.rhs, true)}
        </chakra.span>
      </ValueLabel>
    ) : diffFromPath.kind === DIFF_KEYS.Array && diffFromPath.item.kind === DIFF_KEYS.Deletion ? (
      <ValueLabel>
        {'Deleting: '}
        <chakra.span className="deletion-change line-through">
          {renderValue(diffFromPath.item.lhs, true)}
        </chakra.span>
      </ValueLabel>
    ) : diffFromPath.kind === DIFF_KEYS.New ? (
      <ValueLabel>
        {'New: '}
        <chakra.span className="addition-change">
          {renderValue(diffFromPath.rhs, true)}
        </chakra.span>
      </ValueLabel>
    ) : (
      <h2 className="warning-change">{`[NEED TO HANDLE ${diffFromPath.kind} for ${path}]`}</h2>
    )) : <ValueLabel>{renderValue(fallbackValue, false)}</ValueLabel>;
};

DiffField.defaultProps = {
  renderNestedObject: null,
  className: '',
};

export default DiffField;
