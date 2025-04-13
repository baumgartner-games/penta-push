// src/App.tsx
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import {
    AppShell,
    SimpleGrid,
    Container,
    Title,
    Stack,
    Text,
    TextInput,
    Button,
    Divider,
    Loader,
    Center,
} from '@mantine/core';
import { TileWrapper } from './components/TileWrapper';
import { BooleanTile } from './components/BooleanTile';
import { TimerTile } from './components/TimerTile';
import { LinkTile } from './components/LinkTile';
import { StatusTile } from './components/StatusTile';
import { ChatTile, ChatMessage } from './components/ChatTile';
import { QuixoStatus, checkWin } from './components/QuixoStatus';
import {QuixoBoard} from "./components/QuixoBoard";

function App() {
    const [nickname, setNickname] = useState('Anonym');
    const [roomIdInput, setRoomIdInput] = useState('');
    const [roomId, setRoomId] = useState('');
    const [joined, setJoined] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('');
    const [toilet, setToilet] = useState(false);
    const [examEnd, setExamEnd] = useState<Date | null>(null);
    const [tiles, setTiles] = useState<any>({});
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
    const [gameReady, setGameReady] = useState(false);

    const [quixoBoard, setQuixoBoard] = useState<(null | 'X' | 'O')[][]>(Array(5).fill(null).map(() => Array(5).fill(null)));
    const [quixoCurrentPlayer, setQuixoCurrentPlayer] = useState<'X' | 'O'>('X');
    const [quixoScores, setQuixoScores] = useState<{ X: number; O: number }>({ X: 0, O: 0 });
    const [quixoReady, setQuixoReady] = useState<{ X: boolean; O: boolean }>({ X: false, O: false });

    const peerRef = useRef<Peer | null>(null);
    const connections = useRef<Record<string, Peer.DataConnection>>({});
    const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const mySide: 'X' | 'O' = roomId === peerRef.current?.id ? 'X' : 'O';
    const playerNames = {
        X: mySide === 'X' ? nickname : 'Gegner',
        O: mySide === 'O' ? nickname : 'Gegner'
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const peerId = params.get('peerId');
        if (peerId) {
            setRoomIdInput(peerId);
        }
    }, []);

    const broadcast = (type: string, data: any) => {
        const msg = JSON.stringify({ type, data });
        Object.values(connections.current).forEach((conn) => {
            if (conn.open) conn.send(msg);
        });
    };

    const connectToPeer = (peerId: string) => {
        if (peerRef.current && !connections.current[peerId]) {
            const conn = peerRef.current.connect(peerId);
            connections.current[peerId] = conn;
            setupConnection(conn);
        }
    };

    const handleJoin = (connectToId?: string) => {
        const myPeerId = `${Date.now()}`;
        const peer = new Peer(myPeerId);
        peerRef.current = peer;

        if (connectToId) {
            setConnecting(true);
            setConnectionStatus(`Verbindung mit Peer ${connectToId} wird aufgebaut...`);
            connectionTimeoutRef.current = setTimeout(() => {
                setConnecting(false);
                setConnectionStatus('');
                setRoomIdInput('');
                alert('Der Peer ist offline oder antwortet nicht.');
                peer.disconnect();
                peer.destroy();
                peerRef.current = null;
            }, 10000);
        }

        peer.on('open', (id) => {
            setRoomId(id);
            if (!connectToId) {
                setJoined(true);
                window.history.replaceState({}, document.title, window.location.pathname);
            } else if (connectToId !== id) {
                connectToPeer(connectToId);
            }
        });

        peer.on('connection', (conn) => {
            setupConnection(conn);
            conn.on('open', () => {
                conn.send(JSON.stringify({ type: 'welcome' }));
            });
        });
    };

    const setupConnection = (conn: Peer.DataConnection) => {
        conn.on('open', () => {
            setConnectedPeers(Object.keys(connections.current));
            const myId = peerRef.current?.id;
            if (myId) {
                const allPeers = Object.keys(connections.current).concat(myId);
                conn.send(JSON.stringify({ type: 'known-peers', data: allPeers }));
            }
            broadcast('new-peer', conn.peer);
            broadcast('toilet', toilet);
            broadcast('examEnd', examEnd);
            broadcast('tiles', tiles);
            if (Object.keys(connections.current).length > 0) {
                setGameReady(true);
            }
        });

        conn.on('data', (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.type === 'toilet') setToilet(msg.data);
                if (msg.type === 'examEnd') setExamEnd(new Date(msg.data));
                if (msg.type === 'tiles') setTiles(msg.data);
                if (msg.type === 'chat') setMessages((prev) => [...prev, msg.data]);
                if (msg.type === 'quixo-state') {
                    setQuixoBoard(msg.data.board);
                    setQuixoCurrentPlayer(msg.data.currentPlayer);
                    setQuixoScores(msg.data.scores);
                    setQuixoReady(msg.data.ready);
                }
                if (msg.type === 'known-peers') {
                    const peerIds: string[] = msg.data;
                    peerIds.forEach((pid) => {
                        if (pid && pid !== peerRef.current?.id && !connections.current[pid]) {
                            connectToPeer(pid);
                        }
                    });
                }
                if (msg.type === 'new-peer') {
                    const newPeerId = msg.data;
                    if (newPeerId && newPeerId !== peerRef.current?.id && !connections.current[newPeerId]) {
                        connectToPeer(newPeerId);
                    }
                }
                if (msg.type === 'welcome') {
                    clearTimeout(connectionTimeoutRef.current!);
                    setConnecting(false);
                    setJoined(true);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (e) {
                console.warn('Fehler beim Parsen:', e);
            }
        });

        conn.on('close', () => {
            delete connections.current[conn.peer];
            setConnectedPeers(Object.keys(connections.current));
        });
    };

    if (connecting) {
        return (
            <Container size="xs" mt="xl">
                <Center>
                    <Stack align="center">
                        <Loader size="xl" />
                        <Text>{connectionStatus}</Text>
                        <Button
                            variant="light"
                            color="red"
                            onClick={() => {
                                clearTimeout(connectionTimeoutRef.current!);
                                setConnecting(false);
                                setConnectionStatus('');
                                setRoomIdInput('');
                                peerRef.current?.disconnect();
                                peerRef.current?.destroy();
                                peerRef.current = null;
                            }}
                        >
                            Verbindung abbrechen
                        </Button>
                    </Stack>
                </Center>
            </Container>
        );
    }

    if (!joined) {
        return (
            <Container size="xs" mt="xl">
                <Title order={2} mb="md">Prüfungsaufsichts-Dashboard</Title>
                <Stack>
                    <Text>Gib deinen Namen ein:</Text>
                    <TextInput value={nickname} onChange={(e) => setNickname(e.currentTarget.value)} />

                    <Divider my="sm" label="Raum beitreten" labelPosition="center" />

                    <TextInput
                        placeholder="Peer-ID eingeben"
                        value={roomIdInput}
                        onChange={(e) => setRoomIdInput(e.currentTarget.value)}
                    />
                    <Button onClick={() => handleJoin(roomIdInput)}>Beitreten</Button>

                    <Divider my="sm" label="Oder neuen Link erstellen" labelPosition="center" />
                    <Button onClick={() => handleJoin()}>Eigenen Link erstellen</Button>
                </Stack>
            </Container>
        );
    }

    return (
        <AppShell padding="md">
            <SimpleGrid cols={6} spacing="md">
                {!gameReady ? (
                    <TileWrapper title="Warte auf zweiten Spieler ..." defaultSpan={6}>
                        <Stack align="center" gap="sm">
                            <Text>Ein weiterer Spieler muss dem Spiel beitreten.</Text>
                            <LinkTile title="Raum-Link teilen" roomId={roomId} />
                        </Stack>
                    </TileWrapper>
                ) : (
                    <>
                        <QuixoStatus
                            currentPlayer={quixoCurrentPlayer}
                            nickname={nickname}
                            scores={quixoScores}
                            ready={quixoReady}
                            onToggleReady={() => {
                                const newReady = { ...quixoReady, [mySide]: !quixoReady[mySide] };
                                setQuixoReady(newReady);
                                broadcast('quixo-state', {
                                    board: quixoBoard,
                                    currentPlayer: quixoCurrentPlayer,
                                    scores: quixoScores,
                                    ready: newReady
                                });
                            }}
                            mySide={mySide}
                            playerNames={playerNames}
                        />
                        <QuixoBoard
                            board={quixoBoard}
                            currentPlayer={quixoCurrentPlayer}
                            mySide={mySide}
                            onMove={(newBoard) => {
                                const nextPlayer = quixoCurrentPlayer === 'X' ? 'O' : 'X';
                                const winner = checkWin(newBoard);

                                if (winner) {
                                    const newScores = { ...quixoScores, [winner]: quixoScores[winner] + 1 };
                                    const resetBoard = Array(5).fill(null).map(() => Array(5).fill(null));
                                    setQuixoScores(newScores);
                                    setQuixoBoard(resetBoard);
                                    setQuixoCurrentPlayer('X');
                                    setQuixoReady({ X: false, O: false });
                                    broadcast('quixo-state', {
                                        board: resetBoard,
                                        currentPlayer: 'X',
                                        scores: newScores,
                                        ready: { X: false, O: false }
                                    });
                                } else {
                                    setQuixoBoard(newBoard);
                                    setQuixoCurrentPlayer(nextPlayer);
                                    broadcast('quixo-state', {
                                        board: newBoard,
                                        currentPlayer: nextPlayer,
                                        scores: quixoScores,
                                        ready: { X: false, O: false }
                                    });
                                }
                            }}
                        />
                    </>
                )}
            </SimpleGrid>
        </AppShell>
    );
}

export default App;