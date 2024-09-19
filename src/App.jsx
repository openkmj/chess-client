import Logo from "./assets/capy-chess.png";
import "./App.css";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";
import { useState } from "react";

function App() {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState("start");
  const [history, setHistory] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState("");
  const [squareStyles, setSquareStyles] = useState({});

  const onSquareClick = (square) => {
    if (selectedSquare === "") {
      const moves = game.moves({ square: square, verbose: true });
      if (moves.length === 0) return;

      highlightSquare(
        square,
        moves.map((move) => move.to)
      );
      setSelectedSquare(square);
      return;
    }

    const moves = game.moves({ square: selectedSquare, verbose: true });
    const isValidMove = moves.some((move) => move.to === square);
    if (!isValidMove) {
      setSelectedSquare("");
      setSquareStyles(squareStyling(""));
      return;
    }

    game.move({
      from: selectedSquare,
      to: square,
      promotion: "q",
    });
    setFen(game.fen());
    setHistory(game.history({ verbose: true }));
    setSelectedSquare("");
    setSquareStyles(squareStyling(""));
  };
  const highlightSquare = (sourceSquare, squaresToHighlight) => {
    const highlightStyles = squaresToHighlight.reduce(
      (a, c) => ({
        ...a,
        [c]: {
          background: "rgba(255, 255, 0, 0.4)",
          cursor: "pointer",
        },
      }),
      squareStyling(sourceSquare)
    );
    setSquareStyles((prevStyles) => ({
      ...prevStyles,
      ...highlightStyles,
    }));
  };

  const resetBoard = () => {
    if (confirm("Are you sure you want to reset the board?")) {
      game.reset();
      setFen(game.fen());
      setHistory(game.history({ verbose: true }));
      setSelectedSquare("");
      setSquareStyles(squareStyling(""));
    }
  };
  const undoBoard = () => {
    game.undo();
    setFen(game.fen());
    setHistory(game.history({ verbose: true }));
    setSelectedSquare("");
    setSquareStyles(squareStyling(""));
  };
  const redoBoard = () => {
    game.move(history[history.length - 1]);
    setFen(game.fen());
    setHistory(game.history({ verbose: true }));
    setSelectedSquare("");
    setSquareStyles(squareStyling(""));
  };

  return (
    <>
      <div className="title">
        <img src={Logo} alt="Capy Chess" width={80} />
        <h1>Capybara Enigne</h1>
      </div>
      <h2>Play Chess with Capybara Engine.</h2>
      <div>
        <div className="buttons">
          <button onClick={undoBoard}>{"<"}</button>
          <button onClick={resetBoard}>Reset</button>
          <button onClick={redoBoard}>{">"}</button>
        </div>
        <Chessboard
          position={fen}
          draggable={false}
          onSquareClick={onSquareClick}
          squareStyles={squareStyles}
        />
      </div>
    </>
  );
}

export default App;

const squareStyling = (selectedSquare) => {
  return {
    [selectedSquare]: { backgroundColor: "rgba(255, 255, 0, 0.7)" },
  };
};
