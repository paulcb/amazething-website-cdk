import { AppData } from "./globals";

import { ChangeEvent, useEffect, useState } from 'react';
// import './App.css';
import Board from './Board';
import Maze from './../../lib/common/maze-generator'

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

function App() {
  const [data, setData] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<any>(null);
  const [reset, setReset] = useState(0);
  const [selected, setSelected] = useState<boolean>(false);
  const [currentMaze, setCurrentMaze] = useState<string>("");
  const [mazesDates, setMazesDates] = useState<Set<string>>(new Set<string>());

  const fetchData = async (dateKey: string) => {
    try {
      const response = await fetch(`/${dateKey}_mazedata.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      // mazesDates.add("Select");
      for (const d of json.mazes) {
        const date = new Date(d.date);
        const dateKey = `${date.toISOString().split('T')[0]}`;
        mazesDates.add(dateKey);

        AppData.data.mazes.set(dateKey, d);
        setMazesDates(mazesDates);
      }
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
      AppData.data.winState = false;
      for (const [, value] of AppData.data.path) {
        value.style.backgroundColor = "#fff";
        value.className = `square`;
      }
      AppData.data.path.clear();
      AppData.data.lastElement = null;
      AppData.data.lastMapKey = null;
      if (isMobile) {
        AppData.data.maze = new Maze(null, 12, 8);
        AppData.data.maze.init();
      } else {
        AppData.data.maze = new Maze(null, 16, 20);
        AppData.data.maze.init();
      }
      setReset(0);
    }


  }, [reset]);


  useEffect(() => {
    if (loading) {
      const date = new Date();
      const fetchList = [];
      for (let x = 0; x < 10; x++) {
        if (x !== 0)
          date.setDate(date.getDate() - 1);
        let dateKey = `${date.toISOString().split('T')[0]}`;
        fetchList.push(fetchData(dateKey));
      }

      Promise.all(fetchList).then(() => {
        setData(true);
        setLoading(false);
      });

    }
  }, [loading]);

  useEffect(() => {
    if (data) {
      let maze = null;
      let date = null;
      let dateKey = null;

      date = null;
      for (const key of AppData.data.mazes.keys()) {
        if (date == null) {
          date = new Date(key);
          dateKey = key;
        }
        const tempDate = new Date(key);
        if (tempDate > date) {
          date = tempDate;
          dateKey = key;
        }
      }
      maze = AppData.data.mazes.get(dateKey);
      if (!AppData.data.mazes.has(dateKey)) return;
      const mazeData = isMobile ? maze.mobile.data : maze.desktop.data;
      if (mazeData == null) return;
      AppData.data.maze = new Maze(mazeData);
      setCurrentMaze(dateKey);
    }
  }, [data, loading]);

  function onClick() {
    setReset(1);
  }

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    if (event == null) return;
    setCurrentMaze(event.target.value);
    setSelected(true);
  }

  useEffect(() => {
    if (!AppData.data.mazes.has(currentMaze)) return;
    if (!selected) return;

    const maze = AppData.data.mazes.get(currentMaze);
    AppData.data.winState = false;
    for (const [, value] of AppData.data.path) {
      value.style.backgroundColor = "#fff";
      value.className = `square`;
    }
    AppData.data.path.clear();
    AppData.data.lastElement = null;
    AppData.data.lastMapKey = null;

    const mazeData = isMobile ? maze.mobile.data : maze.desktop.data;
    if (mazeData == null) return;
    AppData.data.maze = new Maze(mazeData);
    setSelected(false);
  }, [selected]);

  if (loading) {
    return (<>Loading...</>);
  }
  return (
    <>
      <Board />
      {/* <Controls></Controls> */}
      <div style={{ float: "left" }}>
        <button className="controls" onClick={onClick}> New </button>
        <select className="controls" name="mazes" id="maze-select" onChange={onChange} value={currentMaze} >
          {[...mazesDates].sort().reverse().map((row, i) => (
            <option key={row + " " + i} className="controls" value={row}>{row}</option>
          ))}
        </select>
      </div>
      <p >(v1.9.1)</p>
    </>
  );

}

export default App;
