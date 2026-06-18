import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { sendJson } from '../transport/json.js';
import { resolveLocalCue } from '../george/local-cue-engine.js';
export function createDeepgramStream(params) {
    const deepgram = createClient(params.apiKey);
    const dg = deepgram.listen.live({
        model: 'nova-2',
        smart_format: true,
        interim_results: true,
        endpointing: 350,
    });
    dg.on(LiveTranscriptionEvents.Transcript, (payload) => {
        const transcript = payload?.channel?.alternatives?.[0]?.transcript?.trim() || '';
        if (!transcript)
            return;
        const isFinal = Boolean(payload?.is_final || payload?.speech_final);
        sendJson(params.ws, {
            type: isFinal ? 'TRANSCRIPT_FINAL' : 'TRANSCRIPT_PARTIAL',
            text: transcript,
            at: Date.now(),
        });
        const cue = resolveLocalCue({
            transcript,
            context: params.getContext(),
        });
        if (cue) {
            sendJson(params.ws, {
                type: 'LOCAL_CUE',
                cue: cue.cue,
                reason: cue.reason,
                at: Date.now(),
            });
        }
    });
    dg.on(LiveTranscriptionEvents.Error, (error) => {
        sendJson(params.ws, {
            type: 'ERROR',
            error: error instanceof Error ? error.message : 'Deepgram stream error.',
            at: Date.now(),
        });
    });
    return {
        sendAudio(chunk) {
            const audio = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
            dg.send(audio);
        },
        close() {
            try {
                dg.finish();
            }
            catch { }
        },
    };
}
