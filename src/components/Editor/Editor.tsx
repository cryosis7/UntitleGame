import type React from 'react';
import { useState } from 'react';
import { DynamicForm } from './DynamicForm';
import { createGameObjectSchema } from '../../utils/schemaUtils';
import Typography from '@mui/material/Typography/Typography';
import Button from '@mui/material/Button/Button';
import type { BaseObjectSchema } from '../../models/schemas/coreSchemas';
import Box from '@mui/material/Box/Box';

export const Editor: React.FC = () => {
  const [baseObjects, setBaseObjects] = useState<BaseObjectSchema[]>([
    createGameObjectSchema(),
  ]);
  const [currentGameObjectIndex, setCurrentGameObjectIndex] =
    useState<number>(0);

  const handleClick = () => {
    const newBaseObjects = [...baseObjects, createGameObjectSchema()];
    setBaseObjects(baseObjects);
    setCurrentGameObjectIndex(newBaseObjects.length - 1);
  };

  return (
    <>
      <Typography variant='h1' sx={{ textAlign: 'center' }}>
        Create Game Object
      </Typography>
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flex: '60%', mx: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', m: 2, gap: 2 }}>
            <Button variant='contained' color='primary' onClick={handleClick}>
              Create a new GameObject
            </Button>
          </Box>
          <DynamicForm baseObject={baseObjects[currentGameObjectIndex]}/>
        </Box>
        <Box sx={{ flex: '40%' }}>
          GameObject #{currentGameObjectIndex}
          <pre>
            {JSON.stringify(baseObjects[currentGameObjectIndex], undefined, 2)}
          </pre>
        </Box>
      </Box>
    </>
  );
};
