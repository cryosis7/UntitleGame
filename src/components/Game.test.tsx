import { renderWithStore } from '../utils/test-utils';
import { screen } from '@testing-library/react';
import { Game } from './Game';
import * as reduxHooks from '../redux/hooks';
import * as mapSlice from '../redux/slices/mapSlice';
import { describe, it, expect, vi } from 'vitest';

describe('Game.tsx', () => {
  it.skip('renders GameMap and SidePanel components', () => {
    renderWithStore(<Game />);
    expect(screen.getByText(/Not implemented yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Side Panel/i)).toBeInTheDocument();
  });

  it('dispatches initialiseMap action on mount', () => {
    const dispatch = vi.fn();
    vi.spyOn(reduxHooks, 'useDispatch').mockReturnValue(dispatch);
    vi.spyOn(mapSlice, 'initialiseMap').mockReturnValue({ type: 'map/initialiseMap', payload: undefined });

    renderWithStore(<Game />);
    expect(dispatch).toHaveBeenCalledWith({ type: 'map/initialiseMap', payload: undefined });
  });
});