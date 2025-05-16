import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';

export async function GET(request: NextRequest) {
	if (request.headers.get('upgrade') !== 'websocket') {
		return new Response('Upgrade required', { status: 426 });
	}

	try {
		interface WebSocketSetup {
			socket: any;
			response: Response;
		}
		const { socket: rawSocket, response } = await new Promise<WebSocketSetup>((resolve, reject) => {
			const wss = new WebSocketServer({ noServer: true });
			
			wss.on('connection', (ws) => {
				ws.on('message', (message) => {
					// Echo back the command (replace with actual command execution)
					ws.send(`$ ${message}\n`);
				});
			});

			const upgrade = Reflect.get(request, 'socket')._handler.upgrade;
			
			if (!upgrade) {
				reject(new Error('Upgrade handler not found'));
				return;
			}

			upgrade(request, {
				complete: (res: Response, socket: any) => {
					resolve({ socket, response: res });
				},
			});
		});

		return response;
	} catch (err) {
		console.error('WebSocket setup failed:', err);
		return new Response('WebSocket setup failed', { status: 500 });
	}
}