
export default function Square({ borders, mapKey, blink, color }: { borders: any, mapKey: string, blink: string, color: string }) {
    return (
        <>
            <div
                id={`${mapKey}`}
                className={`square ${blink}`}
                style={{
                    borderTop: `${borders.up}px solid #999`,
                    borderBottom: `${borders.down}px solid #999`,
                    borderLeft: `${borders.left}px solid #999`,
                    borderRight: `${borders.right}px solid #999`,
                    fontSize: 8,
                    backgroundColor: color,
                    touchAction: 'none',

                }}
            >
            </div>
        </>
    );
}
