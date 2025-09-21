import {
  editorComponentPropertiesAtom,
  updateEditorComponentPropertiesAtom,
} from '../../../game/atoms/editorComponentPropertiesAtom';
import { useAtomValue, useSetAtom } from 'jotai';
import { asTitle } from '../../../game/utils/UtilityFunctions';

export const EditorConfig = () => {
  const editorComponentProperties = useAtomValue(editorComponentPropertiesAtom);
  const updateEditorComponentProperties = useSetAtom(
    updateEditorComponentPropertiesAtom,
  );

  const booleanProperties = Object.entries(editorComponentProperties).filter(
    ([_, value]) => typeof value === 'boolean',
  );

  return (
    <div>
      {booleanProperties.map(([key, value]) => (
        <div key={key}>
          <label>
            <input
              type='checkbox'
              checked={value}
              onChange={(e) =>
                updateEditorComponentProperties({ [key]: e.target.checked })
              }
            />
            <span>{asTitle(key)}</span>
          </label>
        </div>
      ))}
    </div>
  );
};
