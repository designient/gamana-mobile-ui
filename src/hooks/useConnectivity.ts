import { useContext } from 'react';
import { ConnectivityContext, type ConnectivityContextValue } from '../contexts/ConnectivityContext';

export function useConnectivity(): ConnectivityContextValue {
  return useContext(ConnectivityContext);
}
