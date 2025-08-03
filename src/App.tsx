import { Game } from './react/components/Game';
import './App.scss';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'jotai';
import { Editor } from './react/components/Editor/Editor';
import { Slide, ToastContainer } from 'react-toastify';
import { store } from './game/utils/Atoms';
import { DebugPanel } from './react/components/DebugPanel';
import { AtomsDevTools } from './react/components/AtomsDevTools';

const App = () => {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <Provider store={store}>
            <AtomsDevTools />
            <ToastContainer
              pauseOnFocusLoss
              pauseOnHover
              position='top-center'
              transition={Slide}
              autoClose={2000}
            />
            <div className='root'>
              <div className='game-container'>
                <Game />
              </div>
              <DebugPanel />
            </div>
          </Provider>
        }
      />
      <Route path='/editor' element={<Editor />} />
      <Route path='*' element={<div>No Route Match</div>} />
    </Routes>
  );
};

export default App;
