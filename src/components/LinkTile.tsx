// src/components/LinkTile.tsx
import React, { useState } from 'react';
import { Button, Stack, Text, TextInput, Group, ActionIcon, Tooltip, Container, Center } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import ReactDOM from "react-dom";
import QRCode from "react-qr-code";

interface LinkTileProps {
    title: string;
    roomId: string;
    defaultSpan?: number;
    onSpanChange?: (span: number) => void;
}

export function LinkTile({ title, roomId }: LinkTileProps) {
    const [revealed, setRevealed] = useState(false);
    const roomUrl = `${window.location.origin}?roomId=${roomId}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomUrl);
    };

    return (
        <Container size="xs" mt="xl">
            <Center>
                <Stack align="center" gap="md">
                    <Text size="lg" fw={700}>{title}</Text>
                    {!revealed ? (
                        <Button onClick={() => setRevealed(true)}>Raum-Link anzeigen</Button>
                    ) : (
                        <Stack align="center" gap="sm">
                            <TextInput value={roomUrl} readOnly style={{ width: 280 }} />
                            <Tooltip label="In Zwischenablage kopieren">
                                <ActionIcon onClick={copyToClipboard} variant="light">
                                    <IconCopy size={18} />
                                </ActionIcon>
                            </Tooltip>
                            <div style={{height: "auto", margin: "0 auto", maxWidth: 64, width: "100%"}}>
                                <QRCode
                                    size={256}
                                    style={{height: "auto", maxWidth: "100%", width: "100%"}}
                                    value={roomUrl}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </Stack>
                    )}
                </Stack>
            </Center>
        </Container>
    );
}