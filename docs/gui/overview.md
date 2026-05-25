---
title: GUI
sidebar_position: 1
---

# GUI

> **Language**: C++ (mandatory)  
> **Library**: SFML (recommended) — you should already know it

The graphical client is a **passive observer**: it connects to the server, receives a continuous stream of world state updates, and renders the game in real-time. Once launched, it runs autonomously.

## Launch

```bash
./zappy_gui -p port -h machine
```

| Flag | Description |
|---|---|
| `-p port` | TCP port of the server |
| `-h machine` | Hostname / IP of the server |

## Authentication

The GUI authenticates by sending **`GRAPHIC`** as team name during the standard handshake:

```text
Server → GUI : WELCOME\n
GUI → Server : GRAPHIC\n
Server → GUI : (world state begins)
```

The server then switches to the **GUI protocol** for this connection and starts streaming map state, player positions, resource counts, and events.

## What to Display

### Mandatory (2D)
- The full Trantor tile map with resource icons on each tile
- All players: position, orientation, level, team colour
- Ongoing incantation events (highlight tiles/players)
- Death notifications
- Team scores / player counts

### Bonus (3D or enhanced)
- 3D render of the map and players
- Animated movements, broadcasts, and elevation rituals
- Game stats panel (resources over time, elevation history…)

## Optimised Update Model

The server pushes **incremental updates**:
- **Tile change not caused by a player** (e.g. resource respawn) → only that tile's new state is sent.
- **Player pick-up / drop** → a dedicated player-action event is sent (no redundant tile notification).

This avoids flooding the GUI with full-map snapshots on every change.

## Buffering

Incoming data must be properly **buffered**: TCP does not guarantee packet boundaries. The GUI must accumulate data and parse complete messages, exactly as the server does on its side.

## GUI Protocol

The full GUI ↔ Server protocol is defined in the official protocol document distributed alongside the subject. Use it to know exactly which messages to send/receive.

The reference server implements this protocol, so you can test your GUI against it independently of your own server implementation.

## API Reference

The full API reference is generated from C++ doc comments using **Doxygen**. The `Doxyfile` is already configured at `gui/Doxyfile`.

:::info Generate the docs first
Run `bun run docs:api` from the `Common/` directory, then rebuild the site.
The reference will be available at [/api/gui/](pathname:///api/gui/).
:::

```bash
# From Common/
bun run docs:api   # runs cargo doc + doxygen
bun run build      # rebuild Docusaurus
```

Doc comments in the source use the Javadoc `/** */` style (supported by default in the Doxyfile):

```cpp
/**
 * @brief Renders a single tile of the Trantor map.
 *
 * @param tile   Tile data (resources, players present).
 * @param x      Tile X position in screen space.
 * @param y      Tile Y position in screen space.
 * @param zoom   Current zoom level.
 */
void renderTile(const Tile& tile, float x, float y, float zoom);
```

To enable class diagrams and call graphs, install **Graphviz** and uncomment the `HAVE_DOT` section in `gui/Doxyfile`.
