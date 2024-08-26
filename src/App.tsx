import { Game } from "./components/Game";
import "./App.scss";
import './utils/common.scss';
import { setTile } from "./redux/slices/mapSlice";
import { TileModel } from "./models/TileModel";
import { useAppDispatch } from "./redux/hooks";

const App = () => {
  const dispatch = useAppDispatch();

  const tileModel = new TileModel(false);
  console.log(tileModel);
  return (
    <div className="root">
      <div className="game-container">
        <Game />
      </div>
      <button onClick={() => dispatch(setTile({tile: tileModel, index: 50}))}>Click</button>
    </div>
  );
};

export default App;
