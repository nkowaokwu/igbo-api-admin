import nanoid from 'nanoid';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { assignUserRole, generateId } from '../utils';

const mockGeneratedId = 'EFABDQ';
const customAlphabetMock = jest.spyOn(nanoid, 'customAlphabet');

describe('utils', () => {
  describe('assignUserRole', () => {
    it('assigns the user role of admin', () => {
      const user = { email: 'admin@example.com' };

      expect(assignUserRole(user)).toEqual({ role: UserRoles.ADMIN });
    });
  });

  describe('generateId', () => {
    // arrange
    const characters = 'ABCDEF';
    customAlphabetMock.mockImplementation(() => () => mockGeneratedId);

    it('should generate a random id with the default length', () => {
      // act and assert
      expect(generateId(characters)).toMatch(mockGeneratedId);
      expect(customAlphabetMock).toHaveBeenCalledWith(characters, 6);
    });

    it.each([4, 8, 16, 21, 13])('should generate a random id for the given sizes', (size) => {
      // act and assert
      expect(generateId(characters, size)).toMatch(mockGeneratedId);
      expect(customAlphabetMock).toHaveBeenCalledWith(characters, size);
    });
  });
});
