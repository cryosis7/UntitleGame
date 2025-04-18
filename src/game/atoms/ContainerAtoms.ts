import { atom } from 'jotai/index';
import type { Container } from 'pixi.js';
import type { PixiClickHandler } from '../systems/BaseClickSystem';

export const containerHandlersAtom = atom<Map<Container, PixiClickHandler[]>>(
  new Map(),
);
