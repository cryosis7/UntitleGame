import { Game } from './react/components/Game';
import './App.scss';
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <div className='root'>
            <div className='game-container'>
              <Game />
            </div>
          </div>
        }
      />
      <Route path='*' element={<div>No Route Match</div>} />
    </Routes>
  );
};

export default App;
