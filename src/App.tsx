import './App.scss';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'jotai';
import { Slide, ToastContainer } from 'react-toastify';
import { store } from './atoms';
import { gameSystemConfig } from './game/config/SystemConfigurations';
import { Game } from './react/components/Game';
import { DebugPanel } from './react/components/DebugPanel';
import Editor from './react/components/Editor/Editor';

const App = () => {
  return (
    <Provider store={store}>
      <Routes>
        <Route
          path='/'
          element={
            <>
              <ToastContainer
                pauseOnFocusLoss
                pauseOnHover
                position='top-center'
                transition={Slide}
                autoClose={2000}
              />
              <div className='root'>
                <div className='game-container'>
                  <Game systemConfig={gameSystemConfig} />
                </div>
                <DebugPanel />
              </div>
            </>
          }
        />
        <Route path='/editor' element={<Editor />} />
        <Route path='*' element={<div>No Route Match</div>} />
      </Routes>
    </Provider>
  );
};

export default App;
