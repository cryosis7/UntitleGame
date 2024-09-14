import type React from 'react';
import { DynamicForm } from './DynamicForm';

export const Editor: React.FC = () => {

  const handleClick = () => {
    alert('Not implemented');
  }

  return (
    <div>
      <h1>Level Editor</h1>
      <button onClick={handleClick}>Create a new GameObject</button>
      <DynamicForm/>
    </div>
  );
};
