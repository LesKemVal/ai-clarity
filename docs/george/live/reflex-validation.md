# GEORGE LIVE Reflex Validation

Branch: `live-deepgram-runtime`

## Buy-time steering

- [ ] "one second" opens a short buy-time window.
- [ ] "give me a second" opens a moderate buy-time window.
- [ ] "hold on" opens a moderate buy-time window.
- [ ] "let me think" opens a longer buy-time window.
- [ ] "give me a moment" opens the longest buy-time window.
- [ ] Resumed speech cancels buy-time immediately.
- [ ] Buy-time expiry logs when no resumed speech occurs.

## Repeat-line steering

- [ ] "line" replays the last spoken LIVE line.
- [ ] "repeat that" replays the last spoken LIVE line.
- [ ] "say that again" replays the last spoken LIVE line.
- [ ] Empty last-line state does not crash.

## Compression steering

- [ ] "shorter" compresses the last spoken LIVE line.
- [ ] "make it shorter" compresses the last spoken LIVE line.
- [ ] Multi-sentence line returns first sentence.
- [ ] Long single sentence returns shortened version.
- [ ] Already-short sentence remains stable.

## Suppression

- [ ] Transcript is ignored while GEORGE is speaking.
- [ ] Transcript is ignored while GEORGE is thinking.
- [ ] Duplicate final transcript within 1800ms is ignored.
- [ ] Empty final transcript is ignored.

## Expected console signals

- [ ] `[GEORGE LIVE LOCAL] buy_time`
- [ ] `[GEORGE LIVE LOCAL] buy_time_expired`
- [ ] `[GEORGE LIVE LOCAL] buy_time_cancelled`
- [ ] `[GEORGE LIVE LOCAL] repeat_last_line`
- [ ] `[GEORGE LIVE LOCAL] compress_last_line`
