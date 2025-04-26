import * as fs from "node:fs";

import { addMaze } from "../lib/common/maze-data";

const dayCount = 10;
const date = new Date();
let mazes = null;
for (let x = 0; x < dayCount; x++) {
    mazes = addMaze(mazes, new Date(date.getTime()));
    date.setDate(date.getDate() - 1);
}

fs.writeFile("utils/data/mazes.json", JSON.stringify(mazes), err => {
    if (err) {
        console.error(err);
    } else {
        // file written successfully
    }
});