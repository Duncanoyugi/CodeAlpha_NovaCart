import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);