import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ComponentField } from './ComponentField';
import { capitaliseSentence } from '../../../utils';
import type { EntitiesComponentsSchema } from './ComponentSchemas';

interface ComponentListProps {
  entityTemplate: EntitiesComponentsSchema;
  onRemoveComponent: (type: string) => void;
  onComponentChange: (
    type: string,
    field: string,
    value: string | number,
  ) => void;
}

export const ComponentList: React.FC<ComponentListProps> = ({
  entityTemplate,
  onRemoveComponent,
  onComponentChange,
}) => {
  return (
    <Box mt={2}>
      <Typography variant='h6'>Components</Typography>
      {Object.entries(entityTemplate).map(([type, properties]) => (
        <React.Fragment key={type}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Typography variant='body1' fontWeight='bold'>
              {capitaliseSentence(type)}
            </Typography>
            <IconButton
              edge='end'
              aria-label='delete'
              onClick={() => onRemoveComponent(type)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
          <Box
            gap={2}
            justifyContent={'space-evenly'}
            width={'100%'}
            display={'flex'}
          >
            {Object.entries(properties).map(([field, value]) => (
              <Box key={field} flexGrow={1}>
                <ComponentField
                  key={field}
                  field={field}
                  propertyValue={value}
                  setValue={(newValue) =>
                    onComponentChange(type, field, newValue)
                  }
                />
              </Box>
            ))}
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
};
