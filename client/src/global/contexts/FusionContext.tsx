// TODO: type annotation of context and uses elsewhere --
// currently uses empty object as default but might need to make it null
// or maybe Partial<ClientFusion> ?
import { createContext } from 'react';
import { ClientFusion } from '../../services/main';

// the object being built by the user

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FusionContext = createContext({} as any);