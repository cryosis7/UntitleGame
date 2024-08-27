import { Game } from './components/Game';
import './App.scss';
import './utils/common.scss';
import { Route, Routes } from "react-router-dom";
import { Editor } from "./components/Editor/Editor";

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
      <Route path='/editor' element={<Editor />} />
      <Route path='*' element={<div>No Route Match</div>} />
    </Routes>
  );
};

export default App;
