import { useEffect, useRef, useCallback } from "react";

function useWebSocket(url: string) {
	const onErrorRef = useRef<((e: Event) => void) | null>(null);
	const onMessageRef = useRef<((e: MessageEvent) => void) | null>(null);
	const onOpenRef = useRef<(() => void) | null>(null);
	const onCloseRef = useRef<(() => void) | null>(null);
	const wsRef = useRef<WebSocket | null>(null);

	const connect = useCallback(async () => {
		if (wsRef.current) return; // Prevent multiple connections

		const ws = new WebSocket(`${import.meta.env.VITE_SERVER_URL}/${url}`);
		wsRef.current = ws;

		ws.onerror = (e) => {
			if (onErrorRef.current) {
				onErrorRef.current(e);
			}
		};

		ws.onmessage = (e) => {
			if (onMessageRef.current) {
				onMessageRef.current(e);
			}
		};

		ws.onopen = () => {
			if (onOpenRef.current) {
				onOpenRef.current();
			}
		};
	}, [url]);

	const disconnect = useCallback(async () => {
		if (onCloseRef.current) {
			onCloseRef.current();
		}
		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}
	}, []);

	useEffect(() => {
		return () => {
			disconnect();
		};
	}, [disconnect]);

	const onError = (handler: (e: Event) => void) => {
		onErrorRef.current = handler;
	};

	const onMessage = (handler: (e: MessageEvent) => void) => {
		onMessageRef.current = handler;
	};

	const onOpen = (handler: () => void) => {
		onOpenRef.current = handler;
	};

	const onClose = (handler: () => void) => {
		onCloseRef.current = handler;
	};

	const send = async (message: string) => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(message);
		} else {
			// console.error("WebSocket is not open");
		}
	};

	return { onOpen, onClose, onError, onMessage, send, connect, disconnect };
}

export default useWebSocket;
