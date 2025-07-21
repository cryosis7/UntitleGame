import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('./react/components/Game', () => ({
  Game: () => <div>Mocked Game Component</div>,
}));

describe('App', () => {
  it('should render the Game component for the root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Mocked Game Component/i)).toBeInTheDocument();
  });

  it('should render "No Route Match" for an unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/no route match/i)).toBeInTheDocument();
  });
});
