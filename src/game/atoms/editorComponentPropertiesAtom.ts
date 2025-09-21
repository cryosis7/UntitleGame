import { atom } from 'jotai';

interface EditorComponentProperties {
  mapLayer: boolean;
  walkable: boolean;
}

export const editorComponentPropertiesAtom = atom<EditorComponentProperties>({
  mapLayer: true,
  walkable: true,
});

export const updateEditorComponentPropertiesAtom = atom(
  null,
  (get, set, update: Partial<EditorComponentProperties>) => {
    const currentProperties = get(editorComponentPropertiesAtom);
    set(editorComponentPropertiesAtom, {
      ...currentProperties,
      ...update,
    });
  },
);
