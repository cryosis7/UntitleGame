import React from 'react';
import { Game } from '../Game';
import { editorSystemConfig } from '../../../game/config/SystemConfigurations';
import { DebugPanel } from '../DebugPanel';
import { useAtomValue } from 'jotai';
import { entitiesDividedByRenderSectionAtom } from '../../../game/atoms';
import { EditorConfig } from './EditorConfig';
import { createTemplateFromEntity } from '../../../game/utils/EntityFactory';

const Editor = () => {
  const entities = useAtomValue(entitiesDividedByRenderSectionAtom);

  const handleClick = () => {
    const gameEntitiesTemplate = entities.game.map(createTemplateFromEntity);
    const mapEntitiesTemplate = entities.map.map(createTemplateFromEntity);
    console.dir([...mapEntitiesTemplate, ...gameEntitiesTemplate]);
  };

  return (
    <>
      <button onClick={handleClick}>Print entities</button>
      <EditorConfig />
      <Game systemConfig={editorSystemConfig} />
      <DebugPanel />
    </>
  );
};

export default Editor;
