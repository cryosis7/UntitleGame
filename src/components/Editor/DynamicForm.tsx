import type React from 'react';
import { useMemo, useState } from 'react';
import type {
  BaseObjectSchema,
  PropertySection,
  ValueSchema,
} from '../../models/schemas/coreSchemas';
import { isValueSchema } from '../../utils/schemaUtils';
import type { GameObject, MandatoryProperties } from '../../models/GameObject';
import Box from '@mui/material/Box/Box';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import Checkbox from '@mui/material/Checkbox/Checkbox';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography/Typography';
import { Button } from '@mui/material';

interface DynamicFormProps {
  baseObject: BaseObjectSchema;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ baseObject }) => {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const gameObject: GameObject = {
      id: crypto.randomUUID(),
      properties: {
        ...formData,
      },
    };
    console.log('New GameObject Created:', gameObject);
  };

  const renderProperty = useMemo(
    () =>
      (name: string, propertyConfig: ValueSchema): React.ReactNode => {
        const inputType = {
          boolean: 'checkbox',
          string: 'text',
          number: 'number',
        };

        return (
          <Box key={name} mb={1}>
            {propertyConfig.type === 'boolean' ? (
              <FormControlLabel
                control={
                  <Checkbox
                    name={name}
                    onChange={handleChange}
                    required={propertyConfig.required}
                  />
                }
                label={name}
              />
            ) : (
              <TextField
                type={inputType[propertyConfig.type]}
                name={name}
                label={name}
                variant='outlined'
                fullWidth
                required={propertyConfig.required}
                onChange={handleChange}
              />
            )}
          </Box>
        );
      },
    [],
  );

  const renderSection = useMemo(
    () => (name: string, sectionProperties: PropertySection) => {
      return (
        <Box key={name} mb={3}>
          <Typography variant='h6'>Section: {name}</Typography>
          <Box>
            {Object.entries(sectionProperties).map(([name, propertyConfig]) =>
              renderProperty(name, propertyConfig),
            )}
          </Box>
        </Box>
      );
    },
    [renderProperty],
  );

  return (
    <form onSubmit={handleSubmit}>
      <Box display='flex' flexDirection='column' justifyContent='center'>
        {Object.entries(baseObject.properties).map(([name, value]) => (
          <Box key={name} mb={2}>
            {isValueSchema(value)
              ? renderProperty(name, value)
              : renderSection(name, value)}
          </Box>
        ))}
        <Button type='submit' variant='contained'>
          Create Object
        </Button>
      </Box>
    </form>
  );
};
