import React, { useState } from 'react';
import { DynamicForm } from './DynamicForm';
import { objectSchemas } from "../../models/schemas";

export const Editor: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('ground');

  return (
    <div>
      <h1>Create Game Object</h1>
        <select
          onChange={(e) => setSelectedType(e.target.value)}
          value={selectedType}
        >
          {objectSchemas.map((schema) => (
            <option key={schema.type} value={schema.type}>
              {schema.type}
            </option>
          ))}
        </select>
      <DynamicForm objectType={selectedType} />
    </div>
  );
};
