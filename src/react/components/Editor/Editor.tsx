import React from 'react';
import { Game } from '../Game';
import { editorSystemConfig } from '../../../game/config/SystemConfigurations';
import { DebugPanel } from '../DebugPanel';

const Editor = () => {
  return (
    <>
      <Game systemConfig={editorSystemConfig} />
      <DebugPanel />
    </>
  );
};

export default Editor;
