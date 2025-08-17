import { ComponentType } from '../ComponentTypes';

export class HoverHighlightComponent {
  type = ComponentType.HoverHighlight;
  isVisible: boolean;

  constructor({ isVisible }: { isVisible: boolean }) {
    this.isVisible = isVisible;
  }
}