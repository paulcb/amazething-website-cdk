import { TouchEvent } from "react";
import MazeSquare from './MazeSquare';

export default function MazeGrid({ grid, updateGrid }
    : { grid: any[][] | null, updateGrid: (key: string) => void }) {

    function squareEvent(element: any) {

        updateGrid(element.id);
    }

    function onTouchMove(event: TouchEvent<HTMLDivElement>) {
        const x = event.touches[0].clientX;
        const y = event.touches[0].clientY;
        const element = document.elementFromPoint(x, y);
        if (element === null) return;
        if (!element.className.startsWith("square")) return;
        squareEvent(element);
    }

    function onMouseMove(event: any) {
        if (!event.target.className.startsWith("square")) return;
        squareEvent(event.target);
    }

    if (grid !== null) {
        return (
            <>
                <div
                    onTouchMove={onTouchMove}
                    onMouseMove={onMouseMove}
                >
                    {grid.map((row: string[], i: number) => (
                        <div key={i + " board-row"} className="board-row">
                            {row.map((borders: any, j: number) =>
                                <MazeSquare
                                    key={borders.key}
                                    className={borders.className ? borders.className : 'square'}
                                    borders={borders}
                                    mapKey={`${i} ${j}`}
                                    color={borders.color}
                                />
                            )
                            }
                        </div>
                    ))}
                </div>

            </>
        );
    }

    return (<></>);
}

