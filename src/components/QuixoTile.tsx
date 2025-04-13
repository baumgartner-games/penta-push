import React from 'react';
import { Button, ActionIcon, Tooltip } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

interface QuixoTileProps {
    value: 'X' | 'O' | null;
    onClick: () => void;
    onCancel?: () => void;
    disabled?: boolean;
    isSelected?: boolean;
    isCorner?: boolean;
}

export function QuixoTile({
                              value,
                              onClick,
                              onCancel,
                              disabled = false,
                              isSelected = false,
                              isCorner = false,
                          }: QuixoTileProps) {
    if (isCorner) return <div style={{ width: '100%', height: '100%' }} />;

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                flexShrink: 0,
            }}
        >
            <Button
                onClick={onClick}
                disabled={disabled}
                color={value === 'X' ? 'blue' : value === 'O' ? 'red' : 'gray'}
                variant="outline"
                fullWidth
                h="100%"
                sx={{
                    width: '100%',
                    height: '100%',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.15s ease',
                    '&:hover': { opacity: 0.85 },
                }}
            >
                <span style={{ fontSize: '2rem' }}>{value ?? ''}</span>
            </Button>

            {isSelected && onCancel && (
                <Tooltip label="Auswahl abbrechen" position="top" withArrow>
                    <ActionIcon
                        onClick={onCancel}
                        variant="light"
                        color="gray"
                        size="sm"
                        style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'white',
                            zIndex: 1,
                        }}
                    >
                        <IconX size="1rem" />
                    </ActionIcon>
                </Tooltip>
            )}
        </div>
    );
}
