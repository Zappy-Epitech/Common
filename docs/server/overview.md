---
title: Server
sidebar_position: 1
---

# Server

> **Language**: Rust — workspace crates `zappy_server` + `zappy_network`  
> **Architecture**: event-driven, poll-based (`NetworkServer` in `zappy_network`)

The server simulates the world of **Trantor**, handles all client connections (AI and GUI), enforces game rules, manages time, and determines the winner.

## Launch

```bash
./zappy_server -p port -x width -y height -n name1 name2 ... -c clientsNb -f freq [-b]
```

| Flag | Default | Description |
|---|---|---|
| `-p` | `4242` | TCP port to listen on |
| `-x` | `10` | Map width (tiles) |
| `-y` | `10` | Map height (tiles) |
| `-n` | `Team1 Team2` | Team names (one or more, space-separated) |
| `-c` | `3` | Max clients per team at startup |
| `-f` | `100` | Frequency — time units per second |
| `-b` / `--bonus` | `false` | Enable the Ratatui TUI dashboard |

### Validation

`width`, `height`, `clients_nb`, and `freq` must all be **> 0**, and at least one team name must be provided. The process exits with code **84** on invalid input.

## Architecture

```
main.rs
 ├─ parse ServerConfig (clap)
 ├─ [--bonus] spawn server thread + launch TUI in main thread (mpsc::channel)
 └─ [default]  run server directly

zappy_server
 ├─ Server          World + HashMap<usize, ClientState> + optional TUI channel
 ├─ World           Vec<Tile>, HashMap<usize, Player>, team_slots, eggs, resource state
 └─ Player          id, x, y, direction, level, inventory, command queue, death_time, notifications

zappy_network
 └─ NetworkServer   poll-based event loop
```

`ClientState` is one of three variants:
| Variant | Description |
|---|---|
| `Authenticating` | Waiting for team name or `"GRAPHIC"` |
| `InGame(player_id)` | Active AI player |
| `Graphic` | GUI client |

## Handshake

### AI client

```text
Server → Client : WELCOME\n
Client → Server : TEAM-NAME\n
Server → Client : CLIENT-NUM\n    (remaining slots + team eggs)
Server → Client : X Y\n           (map dimensions)
```

`CLIENT-NUM` counts both free slots and available team eggs.

### GUI client

```text
Server → Client : WELCOME\n
Client → Server : GRAPHIC\n
```

The server immediately sends the full world state:

```text
smg   msz   sgt
bct   (one per tile)
tna   (one per team)
pnw + pin   (one pair per connected player)
enw   (one per egg)
```

## The World — Trantor

Trantor is a **toroidal map**: moving past an edge wraps around to the opposite side. The map is represented as a flat `Vec<Tile>` of size `width × height`.

### Resource spawning

Resources are re-evaluated **every 20 time units**. Only missing items are added — totals never decrease. The target quantity per resource type is:

```
target = ceil(width × height × density)
```

| Resource | Density | Target on 10×10 |
|---|---|---|
| food | 0.5 | 50 |
| linemate | 0.3 | 30 |
| deraumere | 0.15 | 15 |
| sibur | 0.1 | 10 |
| mendiane | 0.1 | 10 |
| phiras | 0.08 | 8 |
| thystame | 0.05 | 5 |

## Time System

All durations are expressed in **time units** and converted to real time as `units / f` seconds.

### Player lifetime (food)

Each player holds a `death_time: Instant` computed at connection from 10 initial food units:

```
initial lifetime = 1260 / f  seconds   (= 10 × 126/f)
add_food()       → death_time += 126 / f  seconds
get_food_count() → ceil(remaining_seconds / (126/f))
```

### Poll timeout

The event loop wakes at the **earliest** of:
- Next pending command `end_time`
- Next player `death_time`
- Next egg expiry
- Next resource spawn (`next_spawn_time`)

## Tick — `on_tick`

Each poll cycle executes the following steps in order:

1. **Resource spawn** — if `now >= next_spawn_time`: call `spawn_resources()`, then `next_spawn_time += 20 / f`
2. **Death check** — for every `InGame` player: if `now >= death_time` → send `dead\n` + GUI event `pdi #id`
3. **Command execution** — run all pending commands whose `end_time <= now`
4. **Egg cleanup** — remove expired eggs → GUI event `edi #id`
5. **GUI flush** — send buffered `world.gui_events` to all `Graphic` clients
6. **Notification flush** — send buffered `player.notifications`
7. **Victory check** — `check_victory()`: if any team has **≥ 6 players simultaneously at level 8** → broadcast `seg TEAM-NAME`

## AI Commands

Commands are queued in a `VecDeque<PendingCommand>` capped at **10**. Unknown commands respond immediately with `ko\n`.

| Command | Duration (units) | Notes |
|---|---|---|
| `Forward` | 7 | Toroidal move one tile |
| `Right` | 7 | Rotate 90° clockwise |
| `Left` | 7 | Rotate 90° counter-clockwise |
| `Look` | 7 | Returns visible tiles |
| `Broadcast text` | 7 | Relayed to all clients with direction K |
| `Eject` | 7 | Pushes players + destroys eggs on tile |
| `Take object` | 7 | Pick up a resource |
| `Set object` | 7 | Drop a resource |
| `Inventory` | 1 | Returns current inventory |
| `Fork` | 42 | Immediate GUI event `pfk #id`; lays an egg at end |
| `Incantation` | 300 | Conditions checked at start **and** at end |
| `Connect_nbr` | 0 | Immediate reply: free slots + team eggs |

### Command modules

| Module | Commands |
|---|---|
| `game/commands/movement` | `Forward`, `Right`, `Left`, `Eject` |
| `game/commands/interaction` | `Look`, `Inventory`, `Take`, `Set`, `Fork` |
| `game/commands/social` | `Broadcast` |
| `game/commands/incantation` | `Incantation` |

## Broadcast Direction (K)

Direction is computed using the **Minimum Image Convention**:

1. Compute `dx`, `dy` with toroidal wrapping.
2. `angle = atan2(dx, -dy)` — angle in radians.
3. Normalize to `[0, 2π)`.
4. Adjust by the receiver's current orientation.
5. Divide into 8 sectors of 45° → K ranges from 1 to 8.
6. K = 0 if sender and receiver are on the **same tile**.

## Bonus — TUI Dashboard

When `--bonus` is passed, the server thread and TUI run concurrently:

- **Server** runs in a background `std::thread`.
- **TUI** runs in the main thread (Ratatui + crossterm).
- Communication via `std::sync::mpsc::channel<ServerEvent>`.

### ServerEvent variants

| Event | Payload |
|---|---|
| `ClientConnected` | — |
| `ClientDisconnected` | — |
| `PlayerJoinedTeam` | team name |
| `PlayerDied` | team name |
| `FreqChanged` | new frequency |
| `GameOver` | winning team name |
| `MapSnapshot` | player positions |
| `Log` | message string |

### Dashboard features

- Tabbed interface
- Canvas showing live player positions on the map
- Per-team player counters
- Colored log panel
- Current frequency display

## API Reference

Doc comments in the source use the standard Rust `///` syntax. Generate the reference with:

```bash
cargo doc
```

:::info Generate the docs first
Run `bun run docs:api` from the `Common/` directory, then rebuild the site.
The reference will be available at [/api/server/](pathname:///api/server/).
:::
