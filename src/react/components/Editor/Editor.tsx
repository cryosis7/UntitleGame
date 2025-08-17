import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { EntityForm } from './EntityForm';
import { initPixiApp, pixiApp, preload } from '../../../game/Pixi';
import { gameLoop, initializeGame } from '../../../game/GameSystem';
import { editorSystemConfig } from '../../../game/config/SystemConfigurations';

export const Editor = () => {
  const [entityJson, setEntityJson] = useState<string | null>(null);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const hasInitialised = useRef(false);

  const handleCopyToClipboard = async () => {
    if (entityJson) {
      await navigator.clipboard.writeText(entityJson);
    }
  };

  useEffect(() => {
    const gameContainer = gameContainerRef.current;
    if (!gameContainer || hasInitialised.current) {
      return;
    }

    (async () => {
      hasInitialised.current = true;
      await initPixiApp(gameContainer);
      await preload();

      await initializeGame(editorSystemConfig);

      pixiApp.ticker.add((time) => {
        gameLoop(time);
      });
    })();
  }, []);

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='start'
      minHeight='100vh'
      p={2}
    >
      <Typography variant='h4' gutterBottom>
        Editor
      </Typography>
      <Box
        display='flex'
        flexDirection='row'
        justifyContent='space-between'
        width='100%'
        maxWidth='lg'
        p={2}
      >
        <Box width='45%' p={2}>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <Typography variant='h6' gutterBottom>
              Level Editor
            </Typography>
            <div
              ref={gameContainerRef}
              style={{
                width: '400px',
                height: '400px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </Paper>
        </Box>

        <Box width='45%' p={2}>
          <EntityForm setEntityJson={setEntityJson} />
          {entityJson && (
            <Paper elevation={2} sx={{ padding: 2, mt: 2 }}>
              <Box
                display='flex'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography variant='h6'>Entity JSON</Typography>
                <IconButton onClick={handleCopyToClipboard}>
                  <ContentCopyIcon />
                </IconButton>
              </Box>
              <pre>
                <code>{entityJson}</code>
              </pre>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};
