import * as fs from "node:fs";

import Maze from "./../lib/common/maze-generator.ts";

const dayCount = 10;
const date = new Date();

for (let x = 0; x < dayCount; x++) {
    const maze1 = new Maze(null, 12, 9);
    maze1.init();

    const maze2 = new Maze(null, 16, 20);
    maze2.init();
    const dateKey = `${date.toISOString().split('T')[0]}`;
    const res = {
        mazes: [
            { date: date, mobile: maze1.mazeJsonOutput, desktop: maze2.mazeJsonOutput },
        ]
    };

    console.log(res);

    fs.writeFile(`data/${dateKey}_mazedata.json`, JSON.stringify(res), err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    });
    date.setDate(date.getDate() - 1);
}