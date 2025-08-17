import './App.scss';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'jotai';
import { Slide, ToastContainer } from 'react-toastify';
import { store } from './game/utils/Atoms';
import { lazy, Suspense } from 'react';

const Game = lazy(() =>
  import('./react/components/Game').then((module) => ({
    default: module.Game,
  })),
);
const Editor = lazy(() =>
  import('./react/components/Editor/Editor').then((module) => ({
    default: module.Editor,
  })),
);
const DebugPanel = lazy(() =>
  import('./react/components/DebugPanel').then((module) => ({
    default: module.DebugPanel,
  })),
);
const AtomsDevTools = lazy(() =>
  import('./react/components/AtomsDevTools').then((module) => ({
    default: module.AtomsDevTools,
  })),
);

const App = () => {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <Provider store={store}>
            <Suspense fallback={<div>Loading...</div>}>
              <AtomsDevTools />
            </Suspense>
            <ToastContainer
              pauseOnFocusLoss
              pauseOnHover
              position='top-center'
              transition={Slide}
              autoClose={2000}
            />
            <div className='root'>
              <div className='game-container'>
                <Suspense fallback={<div>Loading game...</div>}>
                  <Game />
                </Suspense>
              </div>
              <Suspense fallback={<div>Loading debug panel...</div>}>
                <DebugPanel />
              </Suspense>
            </div>
          </Provider>
        }
      />
      <Route
        path='/editor'
        element={
          <Suspense fallback={<div>Loading editor...</div>}>
            <Editor />
          </Suspense>
        }
      />
      <Route path='*' element={<div>No Route Match</div>} />
    </Routes>
  );
};

export default App;
