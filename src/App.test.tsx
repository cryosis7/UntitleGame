import App from './App';
import { renderWithStoreAndRouter } from './utils/test-utils';

describe('App.tsx', () => {
  describe('Full app rendering/navigating', () => {
    it('renders Editor on first load', () => {
      const { getByRole } = renderWithStoreAndRouter(<App />);
      expect(getByRole('heading', { name: 'Level Editor' })).toBeInTheDocument();
    });

    it('renders Game on navigation', () => {
      const { getByText } = renderWithStoreAndRouter(<App />, { route: '/game' });

      expect(getByText('Side panel')).toBeInTheDocument();
    });

    it('renders No Route Match on bad navigation', () => {
      const { getByText } = renderWithStoreAndRouter(<App />, { route: '/random' });

      expect(getByText('No Route Match')).toBeInTheDocument();
    });
  });
});