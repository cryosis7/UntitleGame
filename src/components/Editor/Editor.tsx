import type React from 'react';
import { useState } from 'react';
import { DynamicForm } from './DynamicForm';
import type { GameObjectSchema } from '../../models/Schemas';
import { createGameObjectSchema } from '../../utils/schemaUtils';

export const Editor: React.FC = () => {
  const [gameObjects, setGameObjects] = useState<GameObjectSchema[]>([createGameObjectSchema()]);
  const [currentGameObjectIndex, setCurrentGameObjectIndex] = useState<number>(0);

  const handleClick = () => {
    const newGameObjects = [...gameObjects, createGameObjectSchema()];
    setGameObjects(gameObjects);
    setCurrentGameObjectIndex(newGameObjects.length - 1);
  }

  return (
    <div>
      <h1>Create Game Object</h1>
      <button onClick={handleClick}>Create a new GameObject</button>
      <button onClick={() => console.log(JSON.stringify(gameObjects, undefined, 2))}>Print All</button>
      <DynamicForm baseObject={gameObjects[currentGameObjectIndex]}/>
    </div>
  );
};
