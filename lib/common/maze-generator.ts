
/**
 * Creates a boarder keys object for a given row and column.
 * @param {number} row The row number.
 * @param {number} col The column number.
 * @param {number} rowsLen The length of the rows.
 * @param {number} colsLen The length of the columns.
 * @returns {Object} A boarder keys object with up, down, left, and right properties.
 */
function createBoarderKeys(row: number, col: number, rowsLen: number, colsLen: number): any {
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

class MaxPath {
    path: Map<string, string>;
    source: string;
    dest: string;
    distance: number;

    constructor(path: Map<string, string>, source: string, dest: string, distance: number) {
        this.path = path;
        this.source = source;
        this.dest = dest;
        this.distance = distance;
    }
}
/**
 * Represents a maze with the following properties:
 *  - board: A 2D array representing the maze.
 *  - graph: A map of nodes to their adjacent nodes.
 *  - maxPath: The longest path in the maze.
 *  - debug: A boolean flag for debugging purposes.
 *  - inputMaze: The input maze data (optional).
 *  - rowsLen: The length of the rows in the maze.
 *  - colsLen: The length of the columns in the maze.
 *  - mazeJsonOutput: The JSON output of the maze data (optional).
 */
export default class Maze {
    static EXP_KEY_MSG: string = "Expected key";

    board: any[][];
    graph: Map<string, Set<string>>;
    maxPath: any;
    debug: boolean;
    inputMaze: any;
    rowsLen: number;
    colsLen: number;
    mazeJsonOutput: any;

    /**
     * Constructs a new Maze instance.
     * @param {any} inputMaze The input maze data (optional).
     * @param {number} [rowsLen=16] The length of the rows (default: 16).
     * @param {number} [colsLen=6] The length of the columns (default: 6).
     * @param {boolean} [isInit=false] Whether to initialize the maze (default: false).
     * @param {boolean} [debug=false] Whether to enable debugging (default: false).
     */
    constructor(inputMaze: any,
        rowsLen: number = 16,
        colsLen: number = 6,
        isInit: boolean = false,
        debug: boolean = false) {
        this.board = [];
        this.graph = new Map<string, Set<string>>();
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

    // getOrThrow(map: Map<string, unknown>, key: string) {
    //     const value = map.get(key);
    //     if (value === undefined) {
    //         throw new Error("Expected key")
    //     }
    //     return value
    // }

    rowColFromString(key: string) {
        const split = key.split(" ");
        const row = Number.parseInt(split[0]);
        const col = Number.parseInt(split[1]);
        return [row, col]
    }

    isEdgeNode(key: string) {
        const [row, col] = this.rowColFromString(key);

        if ((row - 1 < 0) ||
            (row + 1 >= this.rowsLen) ||
            (col + 1 >= this.colsLen) ||
            (col - 1 < 0)) {
            return true;
        }
        return false;
    }

    /**
     * Initializes the maze data.
     */
    init() {
        if (!this.inputMaze) {
            this.generateMaze();
        }
        else {

            for (const entry of this.inputMaze.nodes) {
                this.graph.set(entry[0], new Set<string>());
                for (const edge of entry[1]) {
                    const nodeSet = this.graph.get(entry[0]);
                    if (nodeSet !== undefined)
                        nodeSet.add(edge);
                }
            }
        }

        this.findLongestEdgePath();
        this.buildBoard();
    }

    /**
     * Builds the maze board data.
     */
    buildBoard() {
        if (this.debug) console.log("buildBoard");
        if (this.maxPath === null) {
            return;
        }
        for (let i = 0; i < this.rowsLen; i++) {
            const boardRow: any[] = [];
            for (let j = 0; j < this.colsLen; j++) {
                const bs = createBoarderKeys(i, j, this.rowsLen, this.colsLen);
                const inPath = this.maxPath.path.has(bs.key);
                const nodeSet = this.graph.get(bs.key);
                if (nodeSet === undefined) continue;
                const borders = {
                    up: nodeSet.has(bs.up) ? 0 : 1,
                    down: nodeSet.has(bs.down) ? 0 : 1,
                    left: nodeSet.has(bs.left) ? 0 : 1,
                    right: nodeSet.has(bs.right) ? 0 : 1,
                    key: bs.key,
                    inPath: inPath
                };
                boardRow.push(borders);
            }
            this.board.push(boardRow);
        }
    }

    /**
     * Performs a breadth-first search to find the longest path in the maze.
     * @param {string} source The source node.
     * @param {string} [dest=null] The destination node (optional).
     * @param {boolean} [findMax=false] Whether to find the longest path (default: false).
     * @returns {Object} The longest path in the maze.
     */
    breadthFirstSearch(source: string, dest: string | null = null, findMax: boolean = false) {
        if (this.debug) console.log("breadthFirstSearch");
        const visited = new Set<string>();
        const dist = new Map<string, number>();
        const paths = new Map<string, string>();
        for (const key of this.graph.keys()) {
            dist.set(key, Infinity);
        }

        dist.set(source, 0);
        paths.set(source, source);
        const queue: string[] = [source];
        let found = false;
        while (queue.length !== 0 || found) {
            const node = queue.shift();
            if (node == null) break;

            visited.add(node);
            const neighbors = this.graph.get(node);
            if (neighbors === undefined) {
                throw new Error(Maze.EXP_KEY_MSG)
            }
            for (const neighbor of neighbors) {
                const distance = dist.get(node);
                if (distance === undefined) {
                    throw new Error(Maze.EXP_KEY_MSG)
                }
                const neighborDistance = dist.get(neighbor);
                if (neighborDistance === undefined) {
                    throw new Error(Maze.EXP_KEY_MSG)
                }
                if (!visited.has(neighbor) && (distance + 1 < neighborDistance)) {
                    dist.set(neighbor, distance + 1);
                    paths.set(neighbor, node);

                    if (dest !== null && neighbor === dest) {
                        found = true;
                        break;
                    }

                    queue.push(neighbor);
                }
            }
        }
        let maxPath: MaxPath | null = null;
        if (findMax) {
            for (const dest_i of dist.keys()) {
                const distance = dist.get(dest_i);
                if (distance === undefined) {
                    throw new Error(Maze.EXP_KEY_MSG);
                }

                if (distance === Infinity) continue;

                if (maxPath === null || distance > maxPath.distance) {
                    if (!this.isEdgeNode(dest_i)) continue;

                    maxPath = new MaxPath(
                        new Map<string, string>(),
                        source,
                        dest_i,
                        distance);
                }
            }
        }
        if (dest !== null) {
            maxPath = new MaxPath(
                new Map<string, string>(),
                source,
                dest,
                Infinity);
        }
        return maxPath;
    }

    findLongestEdgePath() {
        if (this.debug) console.log("findLongestEdgePath");
        let lsp: MaxPath | null = null;
        for (const entry of this.graph.keys()) {
            if (!this.isEdgeNode(entry)) continue;
            const maxPath: MaxPath | null = this.breadthFirstSearch(entry, null, true);
            if (!lsp || (maxPath && lsp && lsp.distance < maxPath.distance)) {
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

                const nodes = new Set<string>();
                const bs = createBoarderKeys(i, j, this.rowsLen, this.colsLen);
                this.graph.set(bs.key, nodes);
            }
        }
        const visited = new Set();
        const stack: any[] = [];
        stack.push(start);
        visited.add(start);

        while (stack.length !== 0) {

            const node = stack.pop();
            if (node === undefined) break;

            const neighbors: any[] = [];
            const [row, col] = this.rowColFromString(node);
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

                const parentValue = this.graph.get(randN.parent);
                if (parentValue === undefined) {
                    throw Error(Maze.EXP_KEY_MSG);
                }
                parentValue.add(randN.neighbor);

                const neighborValue = this.graph.get(randN.neighbor);
                if (neighborValue === undefined) {
                    throw Error(Maze.EXP_KEY_MSG);
                }
                neighborValue.add(randN.parent);

                visited.add(randN.neighbor);
                stack.push(randN.neighbor);
            }
        }

        const mazeData: { data: any } = { data: { dims: { rowsLen: this.rowsLen, colsLen: this.colsLen }, nodes: null } };
        const nodes: any[] = [];
        for (const key of this.graph.keys()) {
            const value = this.graph.get(key);
            if (value === undefined) {
                throw Error(Maze.EXP_KEY_MSG);
            }
            nodes.push([key, [...value.values()]]);

        }
        mazeData.data.nodes = nodes;
        this.mazeJsonOutput = mazeData;

    }

}