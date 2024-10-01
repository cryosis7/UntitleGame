import type React from 'react';

interface SidePanelProps {}

export const SidePanel: React.FC<SidePanelProps> = ({}) => {
  return (
    <div className='border-blue' style={{ flexGrow: '1' }}>
      <h2>Side Panel</h2>
    </div>
  );
};
