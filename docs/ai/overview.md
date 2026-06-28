---
title: AI Client
sidebar_position: 1
---

# AI Client

The AI client is a C++ binary that drives a single player autonomously on the Trantor map. Multiple instances of the binary can connect for the same team simultaneously, each managing its own player independently.

## Usage

```sh
./zappy_ai -p port -n name -h machine [-c config.json]
```

| Flag | Required | Description |
|---|---|---|
| `-p` | yes | Server port |
| `-n` | yes | Team name |
| `-h` | yes | Server hostname (default: `localhost`) |
| `-c` | no | Path to a JSON configuration file |

Exits with `0` on success, `84` on error.

## Architecture

Two core classes handle all runtime logic:

- **`Network`** — owns the TCP socket (non-copyable). Manages a send queue, a receive buffer, and server-initiated message dispatch.
- **`Player`** — holds the game state machine and drives the main loop.

### Network

| Method | Description |
|---|---|
| `pollCheck(bool block)` | Polls the socket; flushes the send queue if writable, reads if data is available |
| `waitResponse()` | Blocks until a complete response line is available in the queue |
| `addToSendQueue()` / `processSendQueue()` | Enqueue and flush outgoing commands |
| `setServerMessageHandler()` | Register an async handler for server-initiated messages (`message K, ...`, `dead`). Returns `true` if the message was consumed, `false` to let it pass as a normal command response |
| `splitCompleteLines()` | Splits the receive buffer into complete lines; incomplete trailing bytes remain buffered |

### Player — State Machine

The `Player` class cycles through the following states (`PlayerState`):

| State | Trigger | Behaviour |
|---|---|---|
| `SURVIVE` | `food < foodSurviveMin` | Finds the nearest food tile via `Look`, moves to it and picks it up |
| `EXPLORE` | Default / not enough resources | Collects the stones required for the next elevation |
| `UPGRADE` | Has all required stones alone | Places the missing stones on the tile, then calls `Incantation` (solo ritual) |
| `COOP` | Needs teammates for the ritual | Broadcasts a rally, waits for enough players on the tile, then incants cooperatively |
| `HUNT` | Level 8 (max) | Roams looking for players to eject; sends a `ping` before ejecting to avoid hitting teammates (expects an `ack`) |
| `FORK` | Team slot count too low | Lays an egg with `Fork` |

### Game Loop

Each tick runs `processGameLogic()` in this order:

```
look() → inventory() → nextState() → action(state) → waitResponse() × nbCmds → flushBroadcasts()
```

## Internal Broadcast Protocol

Coordination between AI instances uses plain-text `Broadcast` messages. The messages are hookable for an encoding layer.

| Message | Direction | Meaning |
|---|---|---|
| `upgrade N [hostId] [target]` | Host → teammates | Invite players to a level-N ritual |
| `stop N [hostId]` | Host → teammates | Ritual over, stand down |
| `ping teamName` | Hunter → all | Challenge before ejecting (HUNT state) |
| `ack teamName` | Teammate → hunter | Confirms presence on the same tile; prevents ejection |

## Configuration (`Params`)

Parameters are loaded from a flat JSON file supplied via `-c`. All fields are optional; the defaults below apply when the file is absent or a key is missing.

| Parameter | Default | Description |
|---|---|---|
| `foodSurviveMin` | `14` | Food threshold below which the player enters `SURVIVE` |
| `minFoodToUpgrade` | `50` | Minimum food required before attempting an upgrade |
| `forkPatience` | `10` | Ticks to wait before forking |
| `huntAckWindow` | `2` | Ticks to wait for a teammate `ack` before ejecting |
| `coopTargetPlayers` | `6` | Target number of players for a `COOP` rally |
| `gatherPatience` | `30` | Patience ticks during resource collection |
| `grazeFoodMin` | `35` | Food threshold below which the player eats while waiting in `COOP` |
| `poolDeficitMax` | `0` | Maximum stone deficit allowed to attempt being the ritual host |
| `coopPatience` | `0` | Extra patience ticks in `COOP` state |

## Elevation Table

| Transition | Players | linemate | deraumere | sibur | mendiane | phiras | thystame |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 → 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 2 → 3 | 2 | 1 | 1 | 1 | 0 | 0 | 0 |
| 3 → 4 | 2 | 2 | 0 | 1 | 0 | 2 | 0 |
| 4 → 5 | 4 | 1 | 1 | 2 | 0 | 1 | 0 |
| 5 → 6 | 4 | 1 | 2 | 1 | 3 | 0 | 0 |
| 6 → 7 | 6 | 1 | 2 | 3 | 0 | 1 | 0 |
| 7 → 8 | 6 | 2 | 2 | 2 | 2 | 2 | 1 |

## Error Handling

Errors are reported through `ZappyException` with the following codes:

`SOCKET_ERROR` · `HOST_RESOLUTION_ERROR` · `CONNECTION_FAILED` · `POLL_ERROR` · `CONNECTION_LOST` · `NO_WELCOME` · `NO_REMAINING_SLOTS` · `INVALID_DIRECTION` · `INVALID_CONNECT_NBR` · `INVALID_BROADCAST`

## API Reference

The codebase is documented with Doxygen. A `Doxyfile` is located at the root of the AI source tree. Generated output is served at [/api/ai/](pathname:///api/ai/).
