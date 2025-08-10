import type React from 'react';
import { TextField } from '@mui/material';
import { capitaliseSentence } from '../../../utils';
import type { PropertyValueSchema } from './ComponentSchemas';

interface ComponentFieldProps {
  field: string;
  propertyValue: PropertyValueSchema;
  setValue: (_value: string | number) => void;
}

export const ComponentField: React.FC<ComponentFieldProps> = ({
  field,
  propertyValue,
  setValue,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      propertyValue.type === 'number'
        ? parseInt(e.target.value, 10)
        : e.target.value;
    setValue(newValue);
  };

  return (
    <TextField
      label={capitaliseSentence(field)}
      value={
        propertyValue.default !== undefined && propertyValue.default !== null
          ? propertyValue.default
          : ''
      }
      onChange={handleChange}
      fullWidth
      margin='normal'
    />
  );
};
