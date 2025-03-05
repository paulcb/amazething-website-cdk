
export const AppData: { data: any, constants: any } = {
    data: {

        maze: null,
        path: new Map(),
        winState: false,
        lastMapKey: null,
        lastElement: null,
        mazes: new Map<string, any>(),
    },
    constants: {
        pathColor: "#e9cbc5",
        winColor: "#a8e4b0",
        blinkClass: "blink"
    }
}
