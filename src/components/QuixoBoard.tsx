import React, { useState } from 'react';
import { SimpleGrid, Center } from '@mantine/core';
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

    const isBorder = (row: number, col: number) => row === 0 || row === 4 || col === 0 || col === 4;

    const canSelect = (row: number, col: number) => {
        if (!isBorder(row, col)) return false;
        const value = board[row][col];
        return value === null || value === mySide;
    };

    const getPushTargets = (row: number, col: number) => {
        const targets: { row: number; col: number }[] = [];
        if (row === 0) targets.push({ row: 4, col });
        if (row === 4) targets.push({ row: 0, col });
        if (col === 0) targets.push({ row, col: 4 });
        if (col === 4) targets.push({ row, col: 0 });
        return targets;
    };

    const handleClick = (row: number, col: number) => {
        if (currentPlayer !== mySide) return;

        if (!selected) {
            if (!canSelect(row, col)) return;
            setSelected({ row, col });
        } else {
            const validTargets = getPushTargets(selected.row, selected.col);
            if (!validTargets.some(t => t.row === row && t.col === col)) return;

            const direction = getDirection(selected, { row, col });
            const newBoard = applyMove(board, selected.row, selected.col, direction, mySide);
            setSelected(null);
            onMove(newBoard);
        }
    };

    const getDirection = (from: { row: number; col: number }, to: { row: number; col: number }): 'up' | 'down' | 'left' | 'right' => {
        if (from.row === 0 && to.row === 4) return 'down';
        if (from.row === 4 && to.row === 0) return 'up';
        if (from.col === 0 && to.col === 4) return 'right';
        if (from.col === 4 && to.col === 0) return 'left';
        throw new Error('Invalid direction');
    };

    const applyMove = (board: QuixoCell[][], row: number, col: number, dir: 'up' | 'down' | 'left' | 'right', side: 'X' | 'O') => {
        const newBoard = board.map(r => [...r]);
        if (dir === 'up' || dir === 'down') {
            const column = newBoard.map(r => r[col]);
            if (dir === 'up') {
                column.pop();
                column.unshift(side);
            } else {
                column.shift();
                column.push(side);
            }
            column.forEach((val, i) => newBoard[i][col] = val);
        } else {
            const rowArr = [...newBoard[row]];
            if (dir === 'left') {
                rowArr.pop();
                rowArr.unshift(side);
            } else {
                rowArr.shift();
                rowArr.push(side);
            }
            newBoard[row] = rowArr;
        }
        return newBoard;
    };

    return (
        <Center>
            <SimpleGrid cols={7} spacing={2}>
                {[-1, 0, 1, 2, 3, 4, 5].map(r =>
                    [-1, 0, 1, 2, 3, 4, 5].map(c => {
                        const row = r;
                        const col = c;
                        if (row < 0 || row > 4 || col < 0 || col > 4) {
                            const logicalRow = Math.max(0, Math.min(row, 4));
                            const logicalCol = Math.max(0, Math.min(col, 4));
                            const isTarget = selected && getPushTargets(selected.row, selected.col)
                                .some(t => t.row === logicalRow && t.col === logicalCol);
                            return (
                                <QuixoTile
                                    key={`${row}-${col}`}
                                    value={null}
                                    onClick={() => handleClick(logicalRow, logicalCol)}
                                    disabled={!isTarget}
                                />
                            );
                        } else {
                            return (
                                <QuixoTile
                                    key={`${row}-${col}`}
                                    value={board[row][col]}
                                    onClick={() => handleClick(row, col)}
                                    disabled={
                                        currentPlayer !== mySide ||
                                        (!!selected && !(selected.row === row && selected.col === col)) ||
                                        (!selected && !canSelect(row, col))
                                    }
                                />
                            );
                        }
                    })
                )}
            </SimpleGrid>
        </Center>
    );
}