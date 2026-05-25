---
title: Server
sidebar_position: 1
---

# Server

> **Language**: Rust (spec allows C, C++ or Rust)  
> **Architecture**: single process, single thread — uses `poll()` for socket multiplexing

The server simulates the world of **Trantor**, handles all client connections (AI and GUI), enforces game rules, manages time, and determines the winner.

## Launch

```bash
./zappy_server -p port -x width -y height -n name1 name2 ... -c clientsNb -f freq
```

| Flag | Description |
|---|---|
| `-p port` | TCP port to listen on |
| `-x width` | Map width (number of tiles) |
| `-y height` | Map height (number of tiles) |
| `-n name1 name2 …` | Team names (space-separated) |
| `-c clientsNb` | Max authorized clients per team |
| `-f freq` | Reciprocal of the time unit (actions per second) |

## The World — Trantor

Trantor is a **zero-relief, toroidal map**: exiting through the right edge brings you back through the left; same for top/bottom.

### Resource Spawning

Resources spawn at startup and **every 20 time units**. Quantity formula:

```
quantity = map_width × map_height × density
```

| Resource | Density | Example (10×10) |
|---|---|---|
| food | 0.5 | 50 |
| linemate | 0.3 | 30 |
| deraumere | 0.15 | 15 |
| sibur | 0.1 | 10 |
| mendiane | 0.1 | 10 |
| phiras | 0.08 | 8 |
| thystame | 0.05 | 5 |

Resources are spread evenly. There is always at least one of each resource and food on the floor.

## Time System

Action execution time = `action_cost / f` seconds.

| `f` value | `Forward` duration |
|---|---|
| 1 | 7 s |
| 100 (default) | 70 ms |

The server must **never actively wait**: `poll()` must only unblock when a socket event occurs or a timed action is due.

## Teams & Eggs

- Each team starts with `clientsNb` egg(s) on the map.
- When a client connects, it hatches from a random available egg.
- `Fork` adds one egg (and one available slot) to the team.
- `Connect_nbr` returns the number of available slots.

## Authentication

- AI clients send their **team name** during the handshake.
- GUI clients send **`GRAPHIC`** as team name. The server then switches to the GUI protocol for that connection.

## Handshake

```text
Server → Client : WELCOME\n
Client → Server : TEAM-NAME\n
Server → Client : CLIENT-NUM\n
Server → Client : X Y\n
```

## Command Queue

Each client can have up to **10 pending commands** buffered. Commands beyond 10 are silently dropped. The server executes them in order; only the current player's execution is blocked during a timed action.

## Winner Detection

The server declares the winner when a team has **at least 6 players simultaneously at elevation level 8**.

## Push (Eject) Notification

When a player ejects all others from their tile, all displaced clients receive:

```text
eject: K\n
```

`K` is the direction they came from. Eggs on the tile are destroyed.

## Broadcast Relay

```text
Server → all clients : message K, text\n
```

`K` is the directional tile number relative to each receiving player.

## API Reference

The full API reference is generated from Rust doc comments (`///`) using `cargo doc`.

:::info Generate the docs first
Run `bun run docs:api` from the `Common/` directory, then rebuild the site.
The reference will be available at [/api/server/](pathname:///api/server/).
:::

```bash
# From Common/
bun run docs:api   # runs cargo doc + doxygen
bun run build      # rebuild Docusaurus
```

Doc comments in the source use the standard Rust `///` syntax:

```rust
/// Handles a new TCP connection from a client.
///
/// # Arguments
/// * `stream` - The TCP stream for the new connection.
/// * `state`  - Shared game state protected by a Mutex.
///
/// # Errors
/// Returns an error if the handshake fails or the team is full.
pub fn handle_connection(stream: TcpStream, state: Arc<Mutex<GameState>>) -> Result<()> {
    // ...
}
```
