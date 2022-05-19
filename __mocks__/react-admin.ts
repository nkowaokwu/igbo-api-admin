import * as ReactAdmin from '../node_modules/react-admin';

// Fake, mocked features
export const useListContext = jest.fn(() => ({
  basePath: '/',
  filterValues: {},
  setFilters: jest.fn(() => ({})),
}));

// Real, non-mocked features
export const {
  useListFilterContext,
  sanitizeListRestProps,
  TopToolbar,
} = ReactAdmin;

export default ReactAdmin;