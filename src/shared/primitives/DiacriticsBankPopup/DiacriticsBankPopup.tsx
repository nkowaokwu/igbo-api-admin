import React from 'react';
import PropTypes from 'prop-types';
import { isMobile } from 'react-device-detect';
import Draggable from 'react-draggable';
import { Box } from '@chakra-ui/react';
import DiacriticsBank from './DiacriticsBank';

const DiacriticsBankPopup = React.forwardRef((
  { positionRect, isVisible, inputRef }
  : { positionRect: any, isVisible: boolean, inputRef: any },
  ref,
) => {
  const renderPopup = () => (
    <Box
      ref={ref}
      style={{
        width: isMobile ? positionRect.width : 365,
        minWidth: isMobile ? '80vw' : 0,
        top: positionRect.top,
        left: positionRect.left,
      }}
      className={`transition-opacity duration-300 border 
      border-gray-300 rounded-lg absolute z-20 
      bg-white py-2 px-0 lg:px-3`}
      data-test="accented-letter-popup"
    >
      {!isMobile && (
        <Box
          className={`handle w-full h-3 border-dashed border 
          border-gray-400 hover:bg-gray-200 transition-all duration-300`}
          style={{ cursor: 'move' }}
        />
      )}
      <DiacriticsBank inputRef={inputRef} />
    </Box>
  );

  // Don't render DiacriticsBankPopup in Cypress
  return isVisible && !window.Cypress
    ? isMobile
      ? renderPopup()
      : (
        <Draggable handle=".handle">
          {renderPopup()}
        </Draggable>
      )
    : null;
});

DiacriticsBankPopup.propTypes = {
  positionRect: PropTypes.shape({
    width: PropTypes.number,
    top: PropTypes.number,
    left: PropTypes.number,
  }).isRequired,
  isVisible: PropTypes.bool,
  inputRef: PropTypes.shape({}).isRequired,
};

DiacriticsBankPopup.defaultProps = {
  isVisible: false,
};

export default DiacriticsBankPopup;
