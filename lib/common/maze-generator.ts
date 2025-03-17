
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

function compareNumbers(a: Set<string>, b: Set<string>) {
    return a.size - b.size;
}

export default class Maze {
    board: any[];
    graph: Map<any, any>;
    graphGroups: Set<string>[] | null;
    maxPath: any | null;
    debug: boolean;
    groupRate: number;
    inputMaze: any;
    rowsLen: any;
    colsLen: any;
    maxMazeSize: number;
    edgeRate: number;
    mazeJsonOutput: any;
    constructor(inputMaze: any,
        rowsLen: number = 16,
        colsLen: number = 6,
        edgeRate: number = .4,
        groupRate: number = .95, isInit: boolean = false, debug: boolean = false) {

        this.board = [];
        this.graph = new Map();
        this.graphGroups = null;
        this.maxPath = null;
        this.debug = debug;
        this.groupRate = groupRate;

        this.edgeRate = edgeRate;
        this.rowsLen = rowsLen;
        this.colsLen = colsLen;

        this.inputMaze = inputMaze;

        if (inputMaze) {
            this.rowsLen = inputMaze.dims.rowsLen;
            this.colsLen = inputMaze.dims.colsLen;
            this.maxMazeSize = Math.floor((this.colsLen * this.rowsLen) * this.groupRate);
            this.init();
            return;
        }


        this.maxMazeSize = Math.floor((this.colsLen * this.rowsLen) * this.groupRate);

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
            this.findGroups();
            const graphGroups = this.findGroups();
            this.graphGroups = graphGroups;

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
        for (let i = 0; i < this.rowsLen; i++) {
            for (let j = 0; j < this.colsLen; j++) {
                const nodes = new Set();
                const bs = createBoarderKeys(i, j, this.rowsLen, this.colsLen);
                // nodes.add(bs.up);
                // nodes.add(bs.down);
                // nodes.add(bs.right);
                // nodes.add(bs.left);
                this.graph.set(bs.key, nodes);
            }
        }

        const visited = new Set();
        const stack: any[] = [];
        stack.push('0 0');
        visited.add('0 0');

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
                    
                    neighbors.push({position: key, neighbor: value, parent: node});
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

    }

    findGroups() {
        if (this.debug) console.log("findGroups");
        const graphGroups: Set<string>[] = [];
        const globalVisited = new Set<string>();
        for (const key of this.graph.keys()) {
            if (globalVisited.has(key)) continue;
            const visited = new Set<string>();
            const stack: string[] = [key];
            while (stack.length !== 0) {
                const node = stack.pop();
                if (node === undefined) break;
                if (!visited.has(node)) {
                    visited.add(node);
                    globalVisited.add(node);
                    const nodes = this.graph.get(node);
                    for (const entry of nodes) {
                        if (!visited.has(entry)) {
                            stack.push(entry);
                        }
                    }
                }
            }
            graphGroups.push(visited);
        }
        graphGroups.sort(compareNumbers).reverse();
        return graphGroups;
    }

    generateMazeBk() {
        if (this.debug) console.log("generateMaze");
        for (let i = 0; i < this.rowsLen; i++) {
            for (let j = 0; j < this.colsLen; j++) {
                const bs = createBoarderKeys(i, j, this.rowsLen, this.colsLen);

                const nodes = new Set();

                const bsRand = {
                    up: Math.random() > this.edgeRate ? 1 : 0,
                    down: Math.random() > this.edgeRate ? 1 : 0,
                    left: Math.random() > this.edgeRate ? 1 : 0,
                    right: Math.random() > this.edgeRate ? 1 : 0,
                    key: bs.key
                };

                if (i - 1 < 0) {
                    bsRand.up = 1;
                } else {
                    if (bsRand.up === 1 && this.graph.get(bs.up).has(bs.key)) {
                        this.graph.get(bs.up).delete(bs.key);
                    }

                    if (bsRand.up === 0 && !this.graph.get(bs.up).has(bs.key)) {
                        this.graph.get(bs.up).add(bs.key);
                    }
                }

                if (i + 1 >= this.rowsLen) {
                    bsRand.down = 1;
                }

                if (j + 1 >= this.colsLen) {
                    bsRand.right = 1;
                }

                if (j - 1 < 0) {
                    bsRand.left = 1;
                } else {
                    if (bsRand.left === 1 && this.graph.get(bs.left).has(bs.key)) {
                        this.graph.get(bs.left).delete(bs.key);
                    }

                    if (bsRand.left === 0 && !this.graph.get(bs.left).has(bs.key)) {
                        this.graph.get(bs.left).add(bs.key);
                    }
                }


                if (bsRand.up === 0) nodes.add(bs.up);
                if (bsRand.down === 0) nodes.add(bs.down);
                if (bsRand.right === 0) nodes.add(bs.right);
                if (bsRand.left === 0) nodes.add(bs.left);


                this.graph.set(bs.key, nodes);
            }
        }

        let graphGroups = this.findGroups();

        if (this.debug) console.log("connect large groups");
        let largestGroup = graphGroups[0];
        while (largestGroup.size < this.maxMazeSize) {
            const sourceGroup = graphGroups[1];
            if (this.debug) console.log(`connect large groups largestGroup ${sourceGroup.size}`);
            const sourceGroupSize = sourceGroup.size;
            let iteration = 0;
            if (this.debug) console.log(`this.maxMazeSize ${this.maxMazeSize}`);
            if (this.debug) console.log(`connect large groups iteration ${iteration}`);
            if (this.debug) console.log(`sourceGroupSize ${sourceGroupSize}`);
            for (const tempGroup of graphGroups) {
                if (tempGroup === sourceGroup) continue;
                for (const entry of sourceGroup) {
                    const split = entry.split(" ");
                    const row = Number.parseInt(split[0]);
                    const col = Number.parseInt(split[1]);

                    const bs = createBoarderKeys(row, col, this.rowsLen, this.colsLen);

                    if (this.addAdjacentNode(tempGroup, entry, bs.up)) {
                        graphGroups = this.findGroups();
                        break;
                    }
                    if (this.addAdjacentNode(tempGroup, entry, bs.down)) {
                        graphGroups = this.findGroups();
                        break;
                    }
                    if (this.addAdjacentNode(tempGroup, entry, bs.right)) {
                        graphGroups = this.findGroups();
                        break;
                    }
                    if (this.addAdjacentNode(tempGroup, entry, bs.left)) {
                        graphGroups = this.findGroups();
                        break;
                    }
                }
                largestGroup = graphGroups[0];
                iteration += 1;
            }
        }

        this.graphGroups = graphGroups;
        const mazeData: { data: any } = { data: { dims: { rowsLen: this.rowsLen, colsLen: this.colsLen }, nodes: null } };
        const nodes: any[] = [];
        for (const key of this.graph.keys()) {
            nodes.push([key, [...this.graph.get(key).values()]]);

        }
        mazeData.data.nodes = nodes;
        this.mazeJsonOutput = mazeData;
    }

}