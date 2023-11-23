import React from 'react';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import useFetchSpeakers from 'src/hooks/useFetchSpeakers';
import { getUserProfile } from 'src/shared/UserAPI';

const permissions = { permissions: { role: UserRoles.ADMIN } };

describe('useFetchSpeakers', () => {
  it('fetches speakers', () => {
    const speakerIds = ['first-id', 'second-id'];
    const mockSetIsLoading = jest.fn();
    const TestingUseFetchSpeakers = () => {
      useFetchSpeakers({ permissions, setIsLoading: mockSetIsLoading, speakerIds });
      return <></>;
    };
    render(
      <TestContext>
        <TestingUseFetchSpeakers />
      </TestContext>,
    );
    expect(mockSetIsLoading).toBeCalledWith(true);
    expect(getUserProfile).toBeCalledWith(speakerIds[0], 0, speakerIds);
    expect(getUserProfile).toBeCalledWith(speakerIds[1], 1, speakerIds);
    expect(mockSetIsLoading).toBeCalledWith(true);
  });
});
