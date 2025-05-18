import Maze, { MazeJson } from "../common/maze-generator";

export const DESKTOP_ROW_SIZE = 12;
export const DESKTOP_COL_SIZE = 10;

export const MOBILE_ROW_SIZE = 9;
export const MOBILE_COL_SIZE = 9;

export const ROW_SCALE = 2;
export const COL_SCAL = 0;

export const MAX_MAXES = 10;

export const MAZE_DIFFICULTIES = { easy: "Easy", medium: "Medium", hard: "Hard" };
export type MazeContainer = {
    date: Date;
    mobile: { easy: MazeJson, medium: MazeJson, hard: MazeJson };
    desktop: { easy: MazeJson, medium: MazeJson, hard: MazeJson };
};
export type MazesJson = { mazes: MazeContainer[] };

export function addMaze(mazesJson: MazesJson | null, date: Date | null) {

    if (!mazesJson) {
        mazesJson = { mazes: [] };
    }

    if (mazesJson.mazes.length >= MAX_MAXES) {
        // Send to some long term storage?
        mazesJson.mazes.shift();
    }

    if (!date)
        date = new Date();

    // for (const [key, value] of Object.entries(MAZE_DIFFICULTIES)) {
    //     console.log(`${key}: ${value.desktop.colLength}`);
    //     const mobileMaze = new Maze(null, value.mobile.rowLength, value.mobile.colLength, true);
    //     const desktopMaze = new Maze(null, value.desktop.rowLength, value.desktop.colLength, true);
    // }

    const mobile = new Maze(null, MOBILE_ROW_SIZE, MOBILE_COL_SIZE, true);
    const desktop = new Maze(null, DESKTOP_ROW_SIZE, DESKTOP_COL_SIZE, true);
    const mobileEasy = new Maze(null, MOBILE_ROW_SIZE - ROW_SCALE, MOBILE_COL_SIZE - COL_SCAL, true);
    const desktopEasy = new Maze(null, DESKTOP_ROW_SIZE - ROW_SCALE, DESKTOP_COL_SIZE - COL_SCAL, true);
    const mobileHard = new Maze(null, MOBILE_ROW_SIZE + ROW_SCALE, MOBILE_COL_SIZE + COL_SCAL, true);
    const desktopHard = new Maze(null, DESKTOP_ROW_SIZE + ROW_SCALE, DESKTOP_COL_SIZE + COL_SCAL, true);

    mazesJson.mazes.push({
        date: date,
        mobile: { easy: mobileEasy.json, medium: mobile.json, hard: mobileHard.json },
        desktop: { easy: desktopEasy.json, medium: desktop.json, hard: desktopHard.json }
    })

    return mazesJson;
}

export function byDifficulty(difficulty: string, isMobile: boolean, mazeData: MazeContainer) {
    let mazeJson = null;
    if (isMobile) {
        if (difficulty === MAZE_DIFFICULTIES.easy) {
            mazeJson = mazeData.mobile.easy;
        } else if (difficulty === MAZE_DIFFICULTIES.medium) {
            mazeJson = mazeData.mobile.medium;
        }
        else if (difficulty === MAZE_DIFFICULTIES.hard) {
            mazeJson = mazeData.mobile.hard;
        }
    } else {
        if (difficulty === MAZE_DIFFICULTIES.easy) {
            mazeJson = mazeData.desktop.easy;
        } else if (difficulty === MAZE_DIFFICULTIES.medium) {
            mazeJson = mazeData.desktop.medium;
        }
        else if (difficulty === MAZE_DIFFICULTIES.hard) {
            mazeJson = mazeData.desktop.hard;
        }
    }
    return mazeJson;
}