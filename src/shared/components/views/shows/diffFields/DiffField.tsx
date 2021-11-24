import React, { ReactElement } from 'react';
import {
  find,
  isEqual,
  split,
  map,
  isNaN,
} from 'lodash';

/* Ignores depth and instantly matches to the following keys */
const QUICK_MATCH_KEYS = ['definitions', 'variations', 'examples', 'synonyms', 'antonyms'];
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
    const diff = find(diffRecord, ({ path, index }) => {
      if (!path) {
        return null;
      };
      return (
        isEqual(path, keys)
        // quick match for definitions, variations, or examples indexes
        || (isEqual(path, keys.slice(0, keys.length - 1))
          && keys[keys.length - 1] === index
          && QUICK_MATCH_KEYS.includes(path[0]))
      );
    });
    return diff;
  };

  const diffFromPath = findDiffInRecord(path);

  const renderValue = (value, hasChanged) => (
    renderNestedObject ? renderNestedObject(value, hasChanged) : value
  );

  return diffFromPath ? (
    diffFromPath.kind === DIFF_KEYS.Edit ? (
      <div className="flex flex-col" data-test={`${path}-diff-field`}>
        <h2 className={`text-xl text-gray-600 ${className}`}>
          {'Old: '}
          <span className="deletion-change">
            {renderValue(diffFromPath.lhs, true)}
          </span>
        </h2>
        <h2 className={`text-xl text-gray-600 ${className}`}>
          {'New: '}
          <span className="addition-change">
            {renderValue(diffFromPath.rhs, true)}
          </span>
        </h2>
      </div>
    ) : diffFromPath.kind === DIFF_KEYS.Array && diffFromPath.item.kind === DIFF_KEYS.New ? (
      <h2 className={`text-xl text-gray-600 ${className}`}>
        {'New: '}
        <span className="addition-change">
          {renderValue(diffFromPath.item.rhs, true)}
        </span>
      </h2>
    ) : diffFromPath.kind === DIFF_KEYS.Array && diffFromPath.item.kind === DIFF_KEYS.Deletion ? (
      <h2 className={`text-xl text-gray-600 ${className}`}>
        {'Deleting: '}
        <span className="deletion-change line-through">
          {renderValue(diffFromPath.item.lhs, true)}
        </span>
      </h2>
    ) : diffFromPath.kind === DIFF_KEYS.New ? (
      <h2 className={`text-xl text-gray-600 ${className}`}>
        {'New: '}
        <span className="addition-change">
          {renderValue(diffFromPath.rhs, true)}
        </span>
      </h2>
    ) : (
      <h2 className="warning-change">{`[NEED TO HANDLE ${diffFromPath.kind} for ${path}]`}</h2>
    )) : (
      <h2 className={`text-xl text-gray-800 ${className}`}>{renderValue(fallbackValue, false)}</h2>
  );
};

DiffField.defaultProps = {
  renderNestedObject: null,
  className: '',
};

export default DiffField;
