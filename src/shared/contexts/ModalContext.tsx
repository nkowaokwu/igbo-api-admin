import React from 'react';

const defaultValue: ModelContextParam = {
  component: null,
  render: false,
};

export type ModelContextParam = {
  render: boolean;
  component: React.ReactNode;
};

export const ModalContext = React.createContext<{
  component: React.ReactNode;
  render: boolean;
  onOpen: (p: ModelContextParam) => void;
  onClose: () => void;
}>({
  component: null,
  render: false,
  onOpen: () => {},
  onClose: () => {},
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [{ component, render }, setRender] = React.useState<ModelContextParam>(defaultValue);

  const contextValue = {
    component,
    onClose: () => {
      setRender({ component: null, render: false });
    },
    onOpen: setRender,
    render,
  };

  return <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>;
};
