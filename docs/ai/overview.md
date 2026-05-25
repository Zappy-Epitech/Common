---
title: AI Client
sidebar_position: 1
---

# AI Client

> **Language**: No constraint — Python, Rust, C, Go, anything that can open a TCP socket.

The AI client drives one player (drone) on the Trantor map. Once launched, it is fully autonomous — the user has no further influence. Multiple instances connect as separate players for the same team.

## Connection & Handshake

```text
Server → Client : WELCOME
Client → Server : TEAM-NAME
Server → Client : CLIENT-NUM    (available slots)
Server → Client : X Y           (world width × height)
```

`CLIENT-NUM` indicates how many more clients can still connect for this team. If ≥ 1, a new client may connect. The newly connected player hatches from a randomly selected egg and starts facing a random direction.

## Command Queue

The client can pipeline up to **10 commands** without waiting for responses. The server processes them in order. Commands beyond 10 are silently dropped.

All commands end with `\n`. Bad/unknown commands receive `ko`.

## Command Reference

| Command | Time | Response |
|---|---|---|
| `Forward` | 7/f | `ok` |
| `Right` | 7/f | `ok` |
| `Left` | 7/f | `ok` |
| `Look` | 7/f | `[tile1, tile2, ...]` |
| `Inventory` | 1/f | `[food n, linemate n, ...]` |
| `Broadcast text` | 7/f | `ok` |
| `Connect_nbr` | — | `value` |
| `Fork` | 42/f | `ok` |
| `Eject` | 7/f | `ok` / `ko` |
| `Take object` | 7/f | `ok` / `ko` |
| `Set object` | 7/f | `ok` / `ko` |
| `Incantation` | 300/f | `Elevation underway` → `Current level: k` / `ko` |

> `f` is the frequency set at server launch (`-f` flag). Default: `f = 100`.

## Survival

- Players start with **10 food** = 1 260 time units of life.
- 1 food unit = **126 time units**.
- Running out of food → server sends `dead\n` → client is disconnected.
- Food is found on tiles and picked up with `Take food`.

## Vision (Look)

The `Look` command returns a flat, comma-separated list of tile contents. The first element of tile 0 always contains `player` (the current player).

```text
[player, object1 object2, , object3, ...]
```

Vision range increases with elevation:

| Level | Tiles visible (lines in front) |
|---|---|
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| … | … |
| 8 | 8 |

Each new level adds one line in front and widens the cone by one tile on each side.

## Broadcast

```text
Broadcast text\n
```

The server relays it to **all clients** (including the sender):

```text
message K, text\n
```

`K` is the tile number indicating the direction the sound comes from. `K = 0` means the sender is on the same tile.

## Ejection

When another player ejects you:

```text
eject: K\n
```

`K` is the direction of the tile the push came from. Ejection also destroys any eggs on the tile.

## Reproduction (Fork)

`Fork` lays an egg, adding one available slot to the team. When a new client connects, it hatches from a random egg.

## Incantation (Elevation Ritual)

To level up, the initiating player calls `Incantation`. Requirements (stones + players of the same level) must be met on the tile at **both the start and the end** of the ritual (300/f seconds). Conditions checked:

- Correct number of players **of the same level** (not necessarily same team)
- Correct stones present

On success: all participating players level up, stones are consumed, server broadcasts the result. On failure: `ko`.

## API Reference

Since the AI has no language constraint, the doc generator depends on the language chosen by the team.
Add the appropriate tool call to `scripts/gen-docs.sh` once the language is decided.

Common options:

| Language | Tool | Command |
|---|---|---|
| Python | `pdoc` | `pdoc ./ai -o ../static/api/ai` |
| Go | `godoc` | `godoc -http :6060` then export |
| C/C++ | Doxygen | same approach as the GUI |
| Rust | `cargo doc` | same approach as the server |
| TypeScript | `typedoc` | `typedoc --out ../static/api/ai` |

Once configured, the reference will be served at [/api/ai/](pathname:///api/ai/).

---

### Elevation Table

| Transition | Players | linemate | deraumere | sibur | mendiane | phiras | thystame |
|---|---|---|---|---|---|---|---|
| 1 → 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 2 → 3 | 2 | 1 | 1 | 1 | 0 | 0 | 0 |
| 3 → 4 | 2 | 2 | 0 | 1 | 0 | 2 | 0 |
| 4 → 5 | 4 | 1 | 1 | 2 | 0 | 1 | 0 |
| 5 → 6 | 4 | 1 | 2 | 1 | 3 | 0 | 0 |
| 6 → 7 | 6 | 1 | 2 | 3 | 0 | 1 | 0 |
| 7 → 8 | 6 | 2 | 2 | 2 | 2 | 2 | 1 |
