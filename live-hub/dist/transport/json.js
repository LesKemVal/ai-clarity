export function sendJson(ws, message) {
    if (ws.readyState !== ws.OPEN)
        return;
    ws.send(JSON.stringify(message));
}
export function parseClientMessage(raw) {
    try {
        return JSON.parse(raw.toString());
    }
    catch {
        return null;
    }
}
