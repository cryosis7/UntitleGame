import type React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { capitaliseSentence } from '../../../game/utils/UtilityFunctions';
import type { EntitiesComponentsSchema } from './ComponentSchemas';
import { ComponentType } from '../../../game/components';

interface ComponentSelectorProps {
  onAddComponent: (type: ComponentType) => void;
  entityTemplate: EntitiesComponentsSchema;
}

export const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  onAddComponent,
  entityTemplate,
}) => {
  const availableComponentTypes = Object.values(ComponentType).filter(
    (type) => !(type in entityTemplate),
  );

  return (
    <Box mb={2}>
      <FormControl fullWidth>
        <InputLabel>Select Component</InputLabel>
        <Select
          onChange={(e) => onAddComponent(e.target.value as ComponentType)}
          label='Select Component'
          value=''
        >
          <MenuItem value=''>Select Component</MenuItem>
          {availableComponentTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {capitaliseSentence(type)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
