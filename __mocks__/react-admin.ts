import * as ReactAdmin from '../node_modules/react-admin';
// Fake, mocked features
export const useListContext = jest.fn(() => ({
  basePath: '/',
  filterValues: {},
  setFilters: jest.fn(() => ({})),
}));
export const fetchUtils = {
  fetchJson: jest.fn(async () => ({})),
};

// Real, non-mocked features
export const {
  AppBar,
  AdminUI,
  AdminContext,
  Layout,
  Resource,
  sanitizeListRestProps,
  TopToolbar,
  DataProviderContext,
  Title,
  MenuItemLink,
  MenuProps,
  useNotify,
  useListFilterContext,
  useRedirect,
  useRefresh,
  useShowController,
  useCreateController,
  useGetOne,
  usePermissions,
} = ReactAdmin;

export default ReactAdmin;