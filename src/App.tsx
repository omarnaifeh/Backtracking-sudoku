import React, { useState } from "react";
import "./App.css";

const initialBoard = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const isValidPlacement = (
  board: number[][],
  row: number,
  col: number,
  num: number
): boolean => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + (i % 3);
    if (board[boxRow][boxCol] === num) return false;
  }
  return true;
};

const generateSudokuBoard = (): number[][] => {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  const fillRandomCells = (count: number) => {
    let filled = 0;
    while (filled < count) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (board[row][col] === 0) {
        const num = Math.floor(Math.random() * 9) + 1;
        if (isValidPlacement(board, row, col, num)) {
          board[row][col] = num;
          filled++;
        }
      }
    }
  };

  fillRandomCells(20);
  return board;
};

const App: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(initialBoard);
  const [delay, setDelay] = useState<number>(300);
  const [solving, setSolving] = useState<boolean>(false);
  const [currentCell, setCurrentCell] = useState<[number, number]>([-1, -1]);
  const [completionTime, setCompletionTime] = useState<number | null>(null);

  const solveSudoku = async (
    board: number[][],
    row: number = 0,
    col: number = 0
  ): Promise<boolean> => {
    if (row === 9) return true;

    if (col === 9) return await solveSudoku(board, row + 1, 0);

    if (board[row][col] !== 0) return await solveSudoku(board, row, col + 1);

    for (let num = 1; num <= 9; num++) {
      if (isValidPlacement(board, row, col, num)) {
        board[row][col] = num;
        setCurrentCell([row, col]);
        setBoard([...board.map((r) => [...r])]);

        await new Promise((resolve) => setTimeout(resolve, delay));

        if (await solveSudoku(board, row, col + 1)) return true;

        board[row][col] = 0;
        setCurrentCell([row, col]);
        setBoard([...board.map((r) => [...r])]);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return false;
  };

  const startSolving = async () => {
    setSolving(true);
    setCompletionTime(null);
    const boardCopy = board.map((row) => [...row]);
    const startTime = performance.now();
    await solveSudoku(boardCopy);
    const endTime = performance.now();
    setCompletionTime(endTime - startTime);
    setSolving(false);
  };

  const generateNewBoard = () => {
    setBoard(generateSudokuBoard());
    setCompletionTime(null);
  };

  const handleSpeedChange = (value: number) => {
    setDelay(value);
  };

  return (
    <div className="App p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Sudoku solver med backtracking algoritme
      </h1>
      <p className="mb-6 mt-6">
        En backtracking algoritme er en rekursiv metode, der prøver at løse
        problemer ved at bygge en løsning trin for trin. Hvis algoritmen på et
        tidspunkt opdager, at en del af løsningen ikke kan føre til et gyldigt
        resultat, "backtracker" den, dvs. går tilbage til det forrige trin og
        prøver en anden mulighed. Dette fortsætter, indtil en løsning er fundet,
        eller alle muligheder er blevet prøvet.
      </p>
      <p className="mb-6">
        Dette program er udviklet af Omar Naifeh | omar1907
      </p>
      <div className="sudoku-board grid grid-cols-9 bg-gray-800 gap-0 rounded-md p-1">
        {board.map((row, rowIdx) => (
          <React.Fragment key={rowIdx}>
            {row.map((cell, colIdx) => (
              <input
                key={colIdx}
                type="text"
                value={cell || ""}
                readOnly
                className={`sudoku-cell w-12 h-12 text-center border border-gray-700 text-black focus:outline-none ${
                  rowIdx % 3 === 0 && rowIdx !== 0
                    ? "border-t-2 border-gray-500"
                    : ""
                } ${
                  colIdx % 3 === 0 && colIdx !== 0
                    ? "border-l-2 border-gray-500"
                    : ""
                } ${
                  currentCell[0] === rowIdx && currentCell[1] === colIdx
                    ? "bg-yellow-300"
                    : ""
                }`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <button
        onClick={startSolving}
        disabled={solving}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Løs Sudoku
      </button>
      <button
        onClick={generateNewBoard}
        disabled={solving}
        className="mt-6 ml-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Generer et nyt Sudoku-bræt
      </button>
      <div className="mt-4 flex flex-col items-start">
        <label htmlFor="speed" className="font-medium mb-2">
          Animation Hastighed:
        </label>
        <input
          id="speed"
          type="range"
          min="10"
          max="1000"
          value={delay}
          onChange={(e) => handleSpeedChange(Number(e.target.value))}
          className="w-full"
          disabled={solving}
        />
        <span className="text-sm mt-2">{delay} ms</span>
      </div>
      {completionTime !== null && (
        <div className="mt-4 text-lg font-semibold text-green-400">
          Sudoku blev løst på {completionTime.toFixed(2)} millisekunder.
        </div>
      )}
    </div>
  );
};

export default App;