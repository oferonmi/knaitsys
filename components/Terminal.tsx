"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

// This component initializes a terminal using xterm.js and connects to a WebSocket server.

export default function TerminalComponent() {
    const terminalRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (terminalRef.current) {
        // Initialize xterm.js
        termRef.current = new Terminal({
            cursorBlink: true,
            theme: { background: "#000000", foreground: "#FFFFFF" },
        });
        termRef.current.open(terminalRef.current);
        termRef.current.write("$ ");

        // Initialize WebSocket
        socketRef.current = new WebSocket("ws://localhost:3000/api/terminal");
        socketRef.current.onopen = () => {
            termRef.current?.write("Connected to terminal server\n");
        };
        socketRef.current.onmessage = (event) => {
            termRef.current?.write(event.data);
        };

        // Handle terminal input
        termRef.current.onData((data) => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(data);
            }
            termRef.current?.write(data); // Echo input
        });

        return () => {
            termRef.current?.dispose();
            socketRef.current?.close();
        };
        }
    }, []);

    return <div ref={terminalRef} className="h-full" />;
}
