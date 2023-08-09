import React, { ReactElement, useState } from 'react';
import { times } from 'lodash';
import { Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark, Tooltip } from '@chakra-ui/react';

const FrequencySlider = ({
  onChange,
  defaultValue,
}: {
  onChange: (value: any) => void;
  defaultValue: number;
}): ReactElement => {
  const [sliderValue, setSliderValue] = useState(5);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleOnChange = (value) => {
    setSliderValue(value);
    onChange(value);
  };

  return (
    <Box className="px-4">
      <Slider
        data-test="word-frequency-slider"
        id="slider"
        defaultValue={defaultValue}
        min={1}
        max={5}
        colorScheme="teal"
        onChange={handleOnChange}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {times(5, (index) => (
          <SliderMark key={index} value={index + 1} mt="2" ml="-2.5" fontSize="sm" fontWeight="bold">
            {index + 1}
          </SliderMark>
        ))}
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip hasArrow bg="teal.500" color="white" placement="top" isOpen={showTooltip} label={sliderValue}>
          <SliderThumb />
        </Tooltip>
      </Slider>
    </Box>
  );
};

export default FrequencySlider;
