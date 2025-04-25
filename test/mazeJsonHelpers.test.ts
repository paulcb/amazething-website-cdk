import { addMaze, MAX_MAXES } from '../lib/lambda/mazeJsonHelpers';

test('Empty Mazes Json Tests', () => {

    const res = addMaze(null);
    expect(res.mazes.length).toBe(1);

});

test('Add Mazes Json Tests', () => {

    let res = addMaze(null);
    res = addMaze(res);
    expect(res.mazes.length).toBe(2);

});

test('Add Max Mazes Json Tests', () => {

    expect(MAX_MAXES).toBeGreaterThan(0);
    let res = null;
    for (let x = 0; x < MAX_MAXES; x++) {
        res = addMaze(res);
    }
    expect(res).not.toBeNull();
    if (res)
        expect(res.mazes.length).toBe(MAX_MAXES);
    // console.log(res);

});

test('Add One More Mazes Json Tests', () => {

    expect(MAX_MAXES).toBeGreaterThan(0);
    let res = null;
    for (let x = 0; x < MAX_MAXES + 1; x++) {
        res = addMaze(res);
    }
    expect(res).not.toBeNull();
    if (res)
        expect(res.mazes.length).toBe(MAX_MAXES);
    // console.log(res);

});
