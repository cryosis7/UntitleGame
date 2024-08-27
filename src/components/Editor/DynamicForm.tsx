import React, { useState } from "react";
import { objectSchemas } from "../../models/schemas";

interface DynamicFormProps {
  objectType: string
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ objectType}) => {
  const schema = objectSchemas.find(schema => schema.type === objectType);
  const [formData, setFormData] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    // Handle form submission logic here
  };

  if (!schema) {
    return <div>Invalid object type</div>;
  }

  const inputType = {
    boolean: 'checkbox',
    string: 'text',
    number: 'number',
  }

  return (
    <form onSubmit={handleSubmit}>
      {schema.properties.map(prop => (
        <div key={prop.name}>
          <label>
            {prop.name} {prop.required && prop.type !== 'boolean' && <span>*</span>}
            <input
              type={inputType[prop.type]}
              name={prop.name}
              required={prop.required && prop.type !== 'boolean'}
              onChange={handleChange}
            />
          </label>
        </div>
      ))}
      <button type="submit">Create Object</button>
    </form>
  );
};