import { Constants } from "./constants";

import { ChangeEvent, useEffect, useState, useCallback } from 'react';

// import './App.css';
import Maze, { MazeJson } from './../../lib/common/maze-generator';
import { addMaze, byDifficulty, MazesJson, MAZE_DIFFICULTIES, MazeContainer } from './../../lib/common/maze-data';
import MazeGrid from "./MazeGrid";


const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function rowColFromString(key: string) {
  const split = key.split(" ");
  const row = Number.parseInt(split[0]);
  const col = Number.parseInt(split[1]);
  return [row, col]
}

function App() {
  const [data, setData] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<any>(null);
  const [reset, setReset] = useState(0);
  const [selected, setSelected] = useState<boolean>(false);
  const [currentMazeDate, setCurrentMazeDate] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>(MAZE_DIFFICULTIES.medium);
  const [currMaze, setCurrMaze] = useState<Maze | null>(null);
  const [mazes, setMazes] = useState<Map<string, MazeContainer>>(new Map<string, MazeContainer>());

  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState<boolean>(false);

  const [blockCount, setBlockCount] = useState(0);

  const [win, setWin] = useState<boolean>(false);

  const [grid, setGrid] = useState<any[][] | null>(null);
  const [path, setPath] = useState<Map<string, any>>(new Map<string, any>());
  const [lastSquare, setLastSquare] = useState<string>("");
  const [currSquare, setCurrSquare] = useState<string>("");

  const [previousGames, setPreviousGames] = useState<any[]>([]);
  const [randCount, setRandCount] = useState(0);

  const updateGrid = useCallback((key: string) => {
    setCurrSquare(key);
  }, [])

  useEffect(() => {
    if (!currMaze) return;

    const rowCount = currMaze.board.length;
    const colCount = currMaze.board[0].length;
    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        if (currMaze.maxPath.source === currMaze.board[row][col].key) {
          currMaze.board[row][col].color = Constants.sourceDestColor;
          currMaze.board[row][col].className = Constants.blinkClass;
        }

        if (currMaze.maxPath.dest === currMaze.board[row][col].key) {
          currMaze.board[row][col].color = Constants.sourceDestColor;
        }

      }
    }

    setGrid(currMaze.board);

  }, [currMaze]);

  useEffect(() => {

    if (!currMaze || win) return;

    if (!active) {
      path.clear();
      setPath(path);
      if (currSquare !== currMaze.maxPath.source) return;

      setLastSquare(currSquare);
      path.set(currSquare, null);
      setPath(path);
      setActive(true);
      setSeconds(0);
      setBlockCount(0);
      return;
    }

    if (currSquare === lastSquare) return;

    if (win) return;

    if (lastSquare.length !== 0) {
      const node = currMaze.graph.get(lastSquare);
      if (node && !node.has(currSquare)) {
        return;
      }
    }

    if (!grid) return;

    const [lrow, lcol] = rowColFromString(lastSquare);
    grid[lrow][lcol].className = "square";

    const [crow, ccol] = rowColFromString(currSquare);
    if (currSquare !== currMaze.maxPath.dest && currSquare !== currMaze.maxPath.source) {
      grid[crow][ccol].color = Constants.pathColor;
    }
    grid[crow][ccol].className = Constants.blinkClass;
    path.set(currSquare, null);
    setPath(path);

    if (currSquare === currMaze.maxPath.dest) {
      setWin(true);
      setActive(false);
      setBlockCount(path.size);
      previousGames.push({ currentMazeDate: currentMazeDate, blockCount: blockCount, seconds: seconds, difficulty: difficulty });
      setPreviousGames(previousGames);
      for (const [key,] of path) {
        const [row, col] = rowColFromString(key);
        grid[row][col].color = Constants.winColor;
        grid[row][col].className = Constants.blinkClass;
      }
      return;
    }

    setLastSquare(currSquare);
    setActive(true);
    setBlockCount(path.size);
    setGrid(grid);

  }, [currSquare]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (active) {
      interval = setInterval(() => {
        setSeconds(seconds + 1);
      }, 1000);
    } else {
      // setSeconds(0);
      // setBlockCount(0);
    }

    return () => clearInterval(interval);
  }, [active, seconds]);

  const fetchData = async () => {
    try {
      const response = await fetch("/mazes.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const mazesInit = new Map<string, MazeContainer>();
      for (const d of json.mazes) {
        const date = new Date(d.date);
        const dateKey = `${date.toISOString().split('T')[0]}`;
        mazesInit.set(dateKey, d);
      }
      setMazes(mazesInit);
    } catch (error) {
      setError(error);
      if (error instanceof SyntaxError) {
        // console.log("SyntaxError dateKey", dateKey);
      }
      else {
        console.log(error);
      }
    } finally {
      // clearTimeout(timeoutId);
    }
  };


  useEffect(() => {
    if (reset) {
      setWin(false);
      // generate single maze
      const mazesJson: MazesJson = addMaze(null, null);
      const mazeJson: MazeContainer = mazesJson.mazes[0];
      if (mazesJson.mazes.length < 1) return;

      const mazeName = "random-" + randCount;
      setRandCount(randCount + 1);

      setCurrentMazeDate(mazeName);
      mazes.set(mazeName, mazesJson.mazes[0]);
      setMazes(mazes);
      const mazeByDiff = byDifficulty(difficulty, isMobile, mazeJson);
      setCurrMaze(new Maze(mazeByDiff));
      setActive(false);
      setReset(0);
    }


  }, [reset]);


  useEffect(() => {
    if (loading) {
      fetchData().then(() => {
        setData(true);
        setLoading(false);
      });

    }
  }, [loading]);

  useEffect(() => {
    if (data) {
      let maze = null;
      let date = null;
      let dateKey: string | null = null;

      date = null;
      for (const key of mazes.keys()) {
        if (date === null) {
          date = new Date(key);
          dateKey = key;
        }
        const tempDate = new Date(key);
        if (tempDate > date) {
          date = tempDate;
          dateKey = key;
        }
      }

      if (!dateKey) return;

      if (!mazes.has(dateKey)) return;

      maze = mazes.get(dateKey);

      if (!maze) return;

      const mazeData: MazeJson = isMobile ? maze.mobile.medium : maze.desktop.medium;
      if (mazeData == null) return;
      setCurrMaze(new Maze(mazeData));
      setCurrentMazeDate(dateKey);
      setDifficulty(difficulty);

    }
  }, [data, loading]);

  function startNewMaze() {
    setReset(1);
  }

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    if (event == null) return;
    setCurrentMazeDate(event.target.value);
    setSelected(true);
  }

  function onChangeDiffculty(event: ChangeEvent<HTMLSelectElement>) {
    if (event == null) return;
    setDifficulty(event.target.value);
    setSelected(true);
  }

  useEffect(() => {
    if (!selected) return;
    if (!mazes.has(currentMazeDate)) return;

    const mazeData: MazeContainer | undefined = mazes.get(currentMazeDate);
    if (!mazeData) return;

    setWin(false);
    const mazeJson = byDifficulty(difficulty, isMobile, mazeData);
    setCurrMaze(new Maze(mazeJson));
    setSelected(false);
    setActive(false);
  }, [selected]);

  if (loading) {
    return (<>Loading...</>);
  }

  return (
    <>
      <MazeGrid grid={grid} updateGrid={updateGrid} />
      {/* <Controls></Controls> */}
      <div style={{ float: "left" }}>
        <button className="controls" onClick={startNewMaze}> New </button>
        <select className="controls" name="difficulty" id="maze-diff-select" onChange={onChangeDiffculty} value={difficulty} >
          {Object.entries(MAZE_DIFFICULTIES).map(([key, value]) => (
            <option key={`difficulty-${key}`} className="controls" value={value}>{value}</option>
          ))}
        </select>
        <select className="controls controls-date" name="mazes" id="maze-select" onChange={onChange} value={currentMazeDate} >
          {[...mazes.keys()].sort().reverse().map((row, i) => (
            <option key={row + " " + i} className="controls" value={row}>{row}</option>
          ))}
        </select>
        <div>Duration (sec): {seconds.toString()}</div>
        <div>Block Count: {blockCount.toString()}</div>
        <div>
          <table>
            <tbody>
              <tr>
                <th>Game</th>
                <th>Level</th>
                <th>Duration (sec)</th>
                <th>Blocks</th>
              </tr>
              {[...previousGames].map((row, i) => (
                <tr key={i}>
                  <th>{row.currentMazeDate}</th>
                  <th>{row.difficulty}</th>
                  <th>{row.seconds}</th>
                  <th>{row.blockCount}</th>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </>
  );

}

export default App;
