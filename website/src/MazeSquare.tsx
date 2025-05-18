
const squareWidth = 1;
const squareColor = "#999";
export default function MazeSquare({ className, borders, mapKey, color }: { className: string, borders: any, mapKey: string, color: string }) {
    // console.log(mapKey, blink, color );
    return (
        <>
            <div
                id={`${mapKey}`}
                className={className}
                style={{
                    borderTop: `${borders.up * squareWidth}px solid ${squareColor}`,
                    borderBottom: `${borders.down * squareWidth}px solid ${squareColor}`,
                    borderLeft: `${borders.left * squareWidth}px solid ${squareColor}`,
                    borderRight: `${borders.right * squareWidth}px solid ${squareColor}`,
                    fontSize: 8,
                    backgroundColor: color,
                    touchAction: 'none',

                }}
            >
            </div>
        </>
    );
}
