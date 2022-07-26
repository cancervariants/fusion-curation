import { createContext } from 'react';

/* Provide hashmap keying gene IDs to associated domain options.
 * Updated via effect hook in main App component whenever new genes are added.
 * Values are DomainParams objects providing args that should be used to call
 * the functional domain constructor endpoint.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DomainOptionsContext = createContext({} as any);