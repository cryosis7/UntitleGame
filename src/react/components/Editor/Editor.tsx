import { useState } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { EntityForm } from './EntityForm';

export const Editor = () => {
  const [entityJson, setEntityJson] = useState<string | null>(null);

  const handleCopyToClipboard = () => {
    if (entityJson) {
      navigator.clipboard.writeText(entityJson);
    }
  };

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
          <EntityForm setEntityJson={setEntityJson} />
        </Box>
        {entityJson && (
          <Box width='45%' p={2}>
            <Paper elevation={2} sx={{ padding: 2 }}>
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
          </Box>
        )}
      </Box>
    </Box>
  );
};
