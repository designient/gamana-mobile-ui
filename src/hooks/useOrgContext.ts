import { useContext } from 'react';
import { OrgContext, type OrgContextValue } from '../contexts/OrgContext';

export function useOrgContext(): OrgContextValue {
  return useContext(OrgContext);
}
