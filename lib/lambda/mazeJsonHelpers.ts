import Maze from "../common/maze-generator";

export const DESKTOP_ROW_SIZE = 16;
export const DESKTOP_COL_SIZE = 12;

export const MOBILE_ROW_SIZE = 12;
export const MOBILE_COL_SIZE = 9;

export const MAX_MAXES = 10;

export type MazesJson = {
    mazes: { date: Date; mobile: any; desktop: any; }[]
};

export function addMaze(mazesJson: MazesJson | null) {

    if (!mazesJson) {
        mazesJson = { mazes: [] };
    }

    if (mazesJson.mazes.length >= MAX_MAXES) {
        // Send to some long term storage?
        mazesJson.mazes.shift();
    }

    const today = new Date();

    const mobileMaze = new Maze(null, MOBILE_ROW_SIZE, MOBILE_COL_SIZE);
    mobileMaze.init();

    const desktopMaze = new Maze(null, DESKTOP_ROW_SIZE, DESKTOP_COL_SIZE);
    desktopMaze.init();

    mazesJson.mazes.push({
        date: today,
        mobile: mobileMaze.mazeJsonOutput, desktop: desktopMaze.mazeJsonOutput
    })

    return mazesJson;
}