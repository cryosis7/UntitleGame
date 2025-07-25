import { Game } from './react/components/Game';
import './App.scss';
import { Route, Routes } from 'react-router-dom';
import { DebugPanel } from './react/components/DebugPanel';
import { createStore, Provider } from 'jotai';
import { Editor } from './react/components/Editor/Editor';
import { Slide, ToastContainer } from 'react-toastify';

export const store = createStore();

const App = () => {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <div className='root'>
            <Provider store={store}>
              <ToastContainer
                pauseOnFocusLoss
                pauseOnHover
                position='top-center'
                transition={Slide}
                autoClose={2000}
              />
              <div className='game-container'>
                <Game />
              </div>
              <DebugPanel />
            </Provider>
          </div>
        }
      />
      <Route path='/editor' element={<Editor />} />
      <Route path='*' element={<div>No Route Match</div>} />
    </Routes>
  );
};

export default App;
