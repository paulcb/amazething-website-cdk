
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
        pathColor: "#ccd1d1",
        sourceDestColor: "#99a3a4",
        winColor: "#a8e4b0",
        blinkClass: "blink"
    }
}
