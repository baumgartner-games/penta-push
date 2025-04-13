import React from 'react';
import { Button } from '@mantine/core';

interface QuixoTileProps {
    value: 'X' | 'O' | null;
    onClick: () => void;
    disabled?: boolean;
}

export function QuixoTile({ value, onClick, disabled }: QuixoTileProps) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            color={value === 'X' ? 'blue' : value === 'O' ? 'red' : 'gray'}
            variant="outline"
            style={{ height: 50, width: 50, padding: 0 }}
        >
            <span style={{ fontSize: '1.5rem' }}>{value ?? ''}</span>
        </Button>
    );
}