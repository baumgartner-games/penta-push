// src/components/QuixoStatus.tsx
import React from 'react';
import { Group, Text, Card, Button, Stack } from '@mantine/core';

interface QuixoStatusProps {
    currentPlayer: 'X' | 'O';
    nickname: string;
    scores: { X: number; O: number };
    ready: { X: boolean; O: boolean };
    onToggleReady: () => void;
    mySide: 'X' | 'O';
    playerNames: { X: string; O: string };
}

export function QuixoStatus({ currentPlayer, nickname, scores, ready, onToggleReady, mySide, playerNames }: QuixoStatusProps) {
    return (
        <Stack gap="xs" mb="md" align="center">
            <Text size="lg" fw={700}>Aktueller Spieler: {playerNames[currentPlayer]} ({currentPlayer})</Text>
            <Group gap="md">
                <Card shadow="sm" padding="xs" radius="md" withBorder>
                    <Text fw={600}>{playerNames.X} (X)</Text>
                    <Text size="sm">Punkte: {scores.X}</Text>
                </Card>
                <Card shadow="sm" padding="xs" radius="md" withBorder>
                    <Text fw={600}>{playerNames.O} (O)</Text>
                    <Text size="sm">Punkte: {scores.O}</Text>
                </Card>
            </Group>
            <Text size="sm" c="dimmed">
                Du bist: {nickname} ({mySide})
            </Text>
            <Button onClick={onToggleReady} color={ready[mySide] ? 'green' : 'gray'} variant="outline">
                {ready[mySide] ? 'Bereit für neues Spiel ✔' : 'Bereit machen'}
            </Button>
        </Stack>
    );
}

export function checkWin(board: (null | 'X' | 'O')[][]): 'X' | 'O' | null {
    const lines: (null | 'X' | 'O')[][] = [];
    for (let i = 0; i < 5; i++) {
        lines.push(board[i]);
        lines.push(board.map(row => row[i]));
    }
    lines.push([0, 1, 2, 3, 4].map(i => board[i][i]));
    lines.push([0, 1, 2, 3, 4].map(i => board[i][4 - i]));

    for (const line of lines) {
        if (line.every(cell => cell === 'X')) return 'X';
        if (line.every(cell => cell === 'O')) return 'O';
    }

    return null;
}
