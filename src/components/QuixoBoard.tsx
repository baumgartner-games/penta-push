import React, { useState } from 'react';
import { QuixoTile } from './QuixoTile';

export type QuixoCell = null | 'X' | 'O';

export interface QuixoBoardProps {
    board: QuixoCell[][];
    currentPlayer: 'X' | 'O';
    mySide: 'X' | 'O';
    onMove: (newBoard: QuixoCell[][]) => void;
}

export function QuixoBoard({ board, currentPlayer, mySide, onMove }: QuixoBoardProps) {
    const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
    const windowWidth = window.innerWidth;

    let numberValueRows = board.length;
    let numberValueCols = board[0].length || numberValueRows;

    let tileWidth = 100

    let numberRows = 1 + numberValueRows + 1;
    let numberCols = 1 + numberValueCols + 1;

    const GRID_INDICES = Array.from({ length: numberRows }, (_, i) => i);
    const GRID_INDICES_COLS = Array.from({ length: numberCols }, (_, i) => i);

    const handleClick = (row: number, col: number) => {
        let clickOnSameField = selected?.row === row && selected?.col === col;
        if(clickOnSameField) {
            setSelected(null);
            return;
        } else {
            if(selected){

            } else {
                setSelected({row, col});
            }
        }
    }

    const isOuterCorner = (row: number, col: number) => {
        return (
            (row === 0 && col === 0) ||
            (row === 0 && col === numberCols - 1) ||
            (row === numberRows - 1 && col === 0) ||
            (row === numberRows - 1 && col === numberCols - 1)
        );
    }

    const isOuterRing = (row: number, col: number) => {
        return (
            row === 0 || row === numberRows - 1 ||
            col === 0 || col === numberCols - 1
        );
    }

    return (
        <div style={{width: '100%', height: '100%', padding: 8 }}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                {GRID_INDICES.map(row => (
                    <div key={row} style={{display: 'flex', justifyContent: 'center', gap: 2}}>
                        {GRID_INDICES_COLS.map(col => {
                            let disabled = false;
                            let inBoard = true;
                            let isSelected = selected?.row === row && selected?.col === col;

                            const value = board?.[row]?.[col];
                            let content = <QuixoTile
                                value={value}
                                disabled={disabled}
                                onClick={() => handleClick(row, col)}
                                onCancel={isSelected ? () => setSelected(null) : undefined}
                                isSelected={isSelected}
                                isCorner={false}
                            />


                            let hidden = isOuterCorner(row, col);
                            if(!selected && isOuterRing(row, col)) {
                                hidden = true;
                            }

                            if (hidden) {
                                content = null
                            }

                            return (
                                <div key={`${row}-${col}`} style={{width: tileWidth, height: tileWidth}}>
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
