import type React from 'react';

interface DynamicFormProps {
}

// interface FormData {
//   [key: string]: string;
// }

export const DynamicForm: React.FC<DynamicFormProps> = ({}) => {
  // const [formData, setFormData] = useState<FormData>({});

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev: FormData) => ({ ...prev, [name]: value }));
  // };

  const handleSubmit = (e: React.FormEvent) => {
    // e.preventDefault();
    //
    // const mandatoryKeys: (keyof GameObjectMandatoryProperties)[] = ['name', 'isCollidable', 'isInteractable'];
    //
    // for (const key of mandatoryKeys) {
    //   if (!(key in formData)) {
    //     console.error(`Missing mandatory property: ${key}`);
    //     return;
    //   }
    // }
    //
    // const gameObject: GameObject = {
    //   id: crypto.randomUUID(),
    //   properties: {
    //     ...formData as GameObjectMandatoryProperties & CustomProperties
    //   }
    // };
    // console.log('New GameObject Created:', gameObject);
  };

  // const renderProperty = useMemo(() => (name: string, propertyConfig: ValueSchema): React.ReactNode => {
  //   const inputType = {
  //     boolean: 'checkbox',
  //     string: 'text',
  //     number: 'number'
  //   };
  //
  //   return (
  //     <label key={name}>
  //       {name} {propertyConfig.required && propertyConfig.type !== 'boolean' && <span>*</span>}
  //       <input
  //         type={inputType[propertyConfig.type]}
  //         name={name}
  //         autoComplete="off"
  //         required={propertyConfig.required && propertyConfig.type !== 'boolean'}
  //         onChange={handleChange}
  //       />
  //     </label>
  //   );
  // }, []);

  // const renderSection = useMemo(() => (name: string, sectionProperties: PropertySection) => {
  //   return (
  //     <div>
  //       Section: {name}
  //       <div>
  //         {Object.entries(sectionProperties).map(([name, propertyConfig]) => renderProperty(name, propertyConfig))}
  //       </div>
  //     </div>);
  // }, [renderProperty]);


  return (
    <form onSubmit={handleSubmit}>
      {/*{Object.entries(baseObject.properties).map(([name, value]) => (*/}
      {/*  <div key={name}>*/}
      {/*    {isValueSchema(value) ? renderProperty(name, value) : renderSection(name, value)}*/}
      {/*  </div>*/}
      {/*))}*/}
      <button type="submit">Create Object</button>
    </form>
  );
};