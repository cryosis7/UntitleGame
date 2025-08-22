import { useAtomsDevtools } from 'jotai-devtools';
import { store } from '../../game/atoms';
import type React from 'react';

export const AtomsDevTools: React.FC = ({
  children,
}: React.PropsWithChildren) => {
  useAtomsDevtools('Untitled Game', {
    store: store,
  });

  return children;
};
