interface StreamingTextResponse extends Response {}

class StreamingTextResponse {
  constructor(res: ReadableStream, init?: ResponseInit) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = typeof chunk === 'string' 
          ? chunk 
          : chunk instanceof Uint8Array 
            ? decoder.decode(chunk)
            : JSON.stringify(chunk);
            
        controller.enqueue(encoder.encode(`data: ${text}\n\n`));
      }
    });

    const responseStream = res.pipeThrough(transformStream);
    const response = new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...init?.headers,
      },
      ...init,
    });

    return response;
  }
}

export { StreamingTextResponse };