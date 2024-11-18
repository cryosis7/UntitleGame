import type React from 'react';
import { useState } from 'react';
import { Box, Button, Paper, TextField } from '@mui/material';
import type { Component } from '../../../game/components/Components';
import { ComponentType } from '../../../game/components/Components';
import { ComponentSelector } from './ComponentSelector';
import { ComponentList } from './ComponentList';
import type { EntitiesComponentsSchema } from './ComponentSchemas';
import { DefaultComponentSchemas } from './ComponentSchemas';
import type { EntityTemplate } from '../../../game/utils/ecsUtils';

interface EntityFormProps {
  setEntityJson: (json: string | null) => void;
}

export const EntityForm: React.FC<EntityFormProps> = ({ setEntityJson }) => {
  const [entityTemplate, setEntityTemplate] =
    useState<EntitiesComponentsSchema>({});
  const [entityName, setEntityName] = useState<string>('');

  const handleAddComponent = (type: ComponentType) => {
    if (type in entityTemplate) {
      return;
    }

    const updatedComponents = { ...entityTemplate };
    updatedComponents[type] = DefaultComponentSchemas[type];
    setEntityTemplate({ ...updatedComponents });
  };

  const handleRemoveComponent = (type: string) => {
    if (!(type in entityTemplate)) {
      return;
    }

    const updatedComponents = { ...entityTemplate };
    delete updatedComponents[type];
    setEntityTemplate(updatedComponents);
  };

  const handleComponentChange = (
    type: string,
    field: string,
    value: string | number,
  ) => {
    const updatedComponents = { ...entityTemplate };
    const component = { ...updatedComponents[type] };

    component[field].default = value;
    updatedComponents[type] = component;

    setEntityTemplate(updatedComponents);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const components: { [type: string]: Component } = {};
    for (const [type, componentProperty] of Object.entries(entityTemplate)) {
      components[type] = {
        type: ComponentType[type as keyof typeof ComponentType],
        ...Object.fromEntries(
          Object.entries(componentProperty).map(
            ([key, { default: defaultValue }]) => [key, defaultValue],
          ),
        ),
      };
    }

    const entity: EntityTemplate = {
      name: entityName,
      components: components,
    };
    setEntityJson(JSON.stringify(entity, null, 2));
  };

  return (
    <Paper elevation={2} sx={{ padding: 2 }}>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <TextField
            label='Entity Name'
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            fullWidth
          />
        </Box>
        <ComponentSelector
          onAddComponent={handleAddComponent}
          entityTemplate={entityTemplate}
        />
        <ComponentList
          entityTemplate={entityTemplate}
          onRemoveComponent={handleRemoveComponent}
          onComponentChange={handleComponentChange}
        />
        <Box mt={2}>
          <Button type='submit' variant='contained' color='primary' fullWidth>
            Create Entity Template
          </Button>
        </Box>
      </form>
    </Paper>
  );
};
