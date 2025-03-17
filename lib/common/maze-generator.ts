
function createBoarderKeys(row: number, col: number, rowsLen: number, colsLen: number) {
    return {
        key: `${row} ${col}`,
        up: !(row - 1 < 0) ? `${row - 1} ${col}` : null,
        down: !(row + 1 >= rowsLen) ? `${row + 1} ${col}` : null,
        left: !(col - 1 < 0) ? `${row} ${col - 1}` : null,
        right: !(col + 1 >= colsLen) ? `${row} ${col + 1}` : null
    };
}

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function compareNumbers(a: Set<string>, b: Set<string>) {
// return a.size - b.size;
// }

export default class Maze {
    board: any[];
    graph: Map<any, any>;
    maxPath: any | null;
    debug: boolean;
    inputMaze: any;
    rowsLen: any;
    colsLen: any;
    mazeJsonOutput: any;
    constructor(inputMaze: any,
        rowsLen: number = 16,
        colsLen: number = 6,
        isInit: boolean = false, debug: boolean = false) {

        this.board = [];
        this.graph = new Map();
        this.maxPath = null;
        this.debug = debug;

        this.rowsLen = rowsLen;
        this.colsLen = colsLen;

        this.inputMaze = inputMaze;

        if (inputMaze) {
            this.rowsLen = inputMaze.dims.rowsLen;
            this.colsLen = inputMaze.dims.colsLen;
            this.init();
            return;
        }

        if (isInit) {
            this.init();
        }
    }

    init() {
        if (!this.inputMaze) {
            this.generateMaze();
        }
        else {

            for (const entry of this.inputMaze.nodes) {
                this.graph.set(entry[0], new Set<string>());
                for (const edge of entry[1]) {
                    this.graph.get(entry[0]).add(edge);
                }
            }
        }

        this.findLongestEdgePath();
        this.buildBoard();
    }

    // neighbors(node) {
    //     const split = node.split(" ");
    //     const row = Number.parseInt(split[0]);
    //     const col = Number.parseInt(split[1]);
    //     // if (!((row - 1 < 0) || (row + 1 >= this.rowsLen) || (col + 1 >= this.colsLen) || (col - 1 < 0))) continue;

    //     const upKey = `${row - 1} ${col}`;
    //     const downKey = `${row + 1} ${col}`;
    //     const rightKey = `${row} ${col + 1}`;
    //     const leftKey = `${row} ${col - 1}`;
    //     return { up: upKey, down: downKey, right: rightKey, left: leftKey }
    // }

    addAdjacentNode(set: Set<string>, key1: string | null, key2: string | null) {
        if (key2 === null || key1 === null) return false;
        if (set.has(key2)) {
            this.graph.get(key2).add(key1);
            this.graph.get(key1).add(key2);
            return true;
        }
        return false;
    }

    buildBoard() {
        if (this.debug) console.log("buildBoard");
        if (this.maxPath == null) {
            console.log("Error: max path is null");
            return
        }
        for (let i = 0; i < this.rowsLen; i++) {
            const boardRow: any[] = [];
            for (let j = 0; j < this.colsLen; j++) {
                const bs = createBoarderKeys(i, j, this.rowsLen, this.colsLen);
                const inPath = this.maxPath.path.has(bs.key);
                const borders = {
                    up: this.graph.get(bs.key).has(bs.up) ? 0 : 1,
                    down: this.graph.get(bs.key).has(bs.down) ? 0 : 1,
                    left: this.graph.get(bs.key).has(bs.left) ? 0 : 1,
                    right: this.graph.get(bs.key).has(bs.right) ? 0 : 1,
                    key: bs.key,
                    inPath: inPath
                };
                boardRow.push(borders);
            }
            this.board.push(boardRow);
        }
    }

    breadthFirstSearch(source: string, dest: string | null = null, findMax = false) {
        if (this.debug) console.log("breadthFirstSearch");
        const visited = new Set();
        const dist = new Map();
        const paths = new Map();
        for (const entry of this.graph.keys()) {
            dist.set(entry, Infinity);
        }

        dist.set(source, 0);
        paths.set(source, source);
        const queue: any[] = [];
        queue.push(source);
        let found = false;
        while (queue.length !== 0 || found) {

            const node = queue.shift();
            if (node === undefined) break;

            visited.add(node);
            for (const n of this.graph.get(node)) {
                if (!visited.has(n) && dist.get(node) + 1 < dist.get(n)) {
                    dist.set(n, dist.get(node) + 1);
                    paths.set(n, node);

                    if (dest !== null && n === dest) {
                        found = true;
                        break;
                    }

                    queue.push(n);
                }
            }
        }
        let maxPath: any = null;
        if (findMax) {
            for (const dest_i of dist.keys()) {

                if (dist.get(dest_i) === Infinity) continue;
                if (maxPath == null) {
                    maxPath = {
                        path: new Map(), source: source, dest: dest_i, distance: dist.get(dest_i)
                    };
                }

                if (dist.get(dest_i) > maxPath.distance) {
                    maxPath = {
                        path: new Map(), source: source, dest: dest_i, distance: dist.get(dest_i)
                    };
                }

            }
        }
        if (dest !== null) {
            maxPath = {
                path: new Map(), source: source, dest: dest, distance: dist.get(dest)
            };
            let p = paths.get(dest);
            maxPath.path.set(dest, p);
            while (p !== source) {
                const save = p;
                p = paths.get(p);
                maxPath.path.set(save, p);
            }
        }
        return maxPath;
    }

    findLongestEdgePath() {
        if (this.debug) console.log("findLongestEdgePath");
        let lsp = null;
        for (const entry of this.graph.keys()) {
            const split = entry.split(" ");
            const row = Number.parseInt(split[0]);
            const col = Number.parseInt(split[1]);

            if (!((row - 1 < 0) ||
                (row + 1 >= this.rowsLen) ||
                (col + 1 >= this.colsLen) ||
                (col - 1 < 0))) continue;

            const maxPath = this.breadthFirstSearch(entry, null, true);
            if (lsp == null) lsp = maxPath;
            if (lsp.distance < maxPath.distance) {
                lsp = maxPath;
            }
        }
        if (lsp == null) {
            console.log("lsp is null!");
            return;
        }
        const maxPath = this.breadthFirstSearch(lsp.source, lsp.dest);
        this.maxPath = maxPath;

    }

    generateMaze() {
        const randEdge = getRandomInt(0, 3);
        let start = null;
        if (randEdge === 0)
            start = `0 ${getRandomInt(0, this.colsLen - 1)}`;
        else if (randEdge === 1)
            start = `${this.rowsLen - 1} ${getRandomInt(0, this.colsLen - 1)}`;
        else if (randEdge === 2)
            start = `${this.rowsLen - 1} 0`;
        else if (randEdge === 3)
            start = `${this.rowsLen - 1} ${this.colsLen - 1}`;

        for (let i = 0; i < this.rowsLen; i++) {
            for (let j = 0; j < this.colsLen; j++) {
                // if ((i === 0) ||
                //     (i === this.rowsLen - 1) ||
                //     (j === this.colsLen - 1) ||
                //     (j === 0)) {

                // }

                const nodes = new Set();
                const bs = createBoarderKeys(i, j, this.rowsLen, this.colsLen);
                this.graph.set(bs.key, nodes);
            }
        }
        console.log('start', start);
        const visited = new Set();
        const stack: any[] = [];
        stack.push(start);
        visited.add(start);

        while (stack.length !== 0) {

            const node = stack.pop();
            if (node === undefined) break;

            const neighbors: any[] = [];

            const split = node.split(" ");
            const row = Number.parseInt(split[0]);
            const col = Number.parseInt(split[1]);
            const bs = createBoarderKeys(row, col, this.rowsLen, this.colsLen);
            for (const [key, value] of Object.entries(bs)) {
                if (value === null || value === node) continue;

                if (!visited.has(value)) {

                    neighbors.push({ position: key, neighbor: value, parent: node });
                }
            }

            if (neighbors.length > 0) {

                const randIndex = getRandomInt(0, neighbors.length - 1);
                const randN = neighbors[randIndex];
                stack.push(randN.parent);
                this.graph.get(randN.parent).add(randN.neighbor);
                this.graph.get(randN.neighbor).add(randN.parent);

                visited.add(randN.neighbor);
                stack.push(randN.neighbor);
            }
        }

        const mazeData: { data: any } = { data: { dims: { rowsLen: this.rowsLen, colsLen: this.colsLen }, nodes: null } };
        const nodes: any[] = [];
        for (const key of this.graph.keys()) {
            nodes.push([key, [...this.graph.get(key).values()]]);

        }
        mazeData.data.nodes = nodes;
        this.mazeJsonOutput = mazeData;

    }

}