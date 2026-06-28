---
title: GUI
sidebar_position: 1
---

# GUI

> **Language**: C++23, compiled with `clang++`  
> **Rendering**: [Raylib](https://www.raylib.com/) (3D)  
> **Architecture**: [flecs](https://www.flecs.dev/) ECS  
> **UI widgets**: `raygui.h` (bundled in-repo)

The graphical client connects to the server, receives the world state stream, and renders the game in a Minecraft-like 3D environment using an Entity-Component-System architecture.

## Launch

```bash
./zappy_gui -p port -h machine
```

| Flag | Description |
|---|---|
| `-p port` | TCP port of the server (default: 4242) |
| `-h machine` | Hostname / IP of the server |

The connection parameters can also be entered interactively from the **Home** scene before connecting.

## Architecture

The application is built around a **flecs world**. Every subsystem is a module registered into that world at startup.

### Modules

| Module | Responsibility |
|---|---|
| `Core` | Entity lifetime systems (`Lifetime`), deferred cleanup |
| `Gui` | UI components: `Button`, `TextInput`, `ScreenMessage`, `OnClick`, `OnEnter`, `OnTextUpdate`, `HasInputActive` |
| `NetworkModule` | TCP connection management, threaded `ZappyClient` |
| `GamePlay` | Registry that wires together all gameplay modules |
| `Players` | Player rendering and animation |
| `Grid` | 3D tile grid (`GridCell`, `GridContainer`, `GridPosition`) |
| `Minecraft` | Minecraft-style skins and animations |
| `MinecraftRenderer` | 3D character and head drawing |

### Scenes

The GUI is organised into four scenes:

| Scene | Purpose |
|---|---|
| `Home` | Connection screen — enter host and port |
| `Game` | 3D world rendering and game logic |
| `Settings` | Application settings |
| `EndGame` | End-of-game result screen |

## Network Layer

The `NetworkModule` manages the server connection through three ECS components:

| Component | Contents |
|---|---|
| `NetworkConfig` | `host` (strdup'd string) + `port` (default 4242) |
| `NetworkState` | `ClientStatus` enum + status message |
| `NetworkClientHandle` | `shared_ptr<ZappyClient>` — the threaded client |

Three free functions drive the connection lifecycle:

```cpp
connectToServer(world, config);       // starts the threaded connection
disconnectFromServer(world);          // tears it down
sendServerCommand(world, command);    // sends a raw command string
```

### Handshake

```text
Server → GUI : WELCOME\n
GUI    → Server : GRAPHIC\n
Server → GUI : smg ...\n
                msz W H\n
                sgt F\n
                bct x y ...\n   (all tiles)
                tna team\n      (all teams)
                pnw ...\n
                pin ...\n       (all players)
                enw ...\n       (all eggs)
```

## Protocol Parser

`ZappyProtocol::parseLine(string_view)` parses one line at a time and returns an `std::optional<Event>`. `Event` is an `std::variant` over all known event types:

| Event type | Command | Key fields |
|---|---|---|
| `MapSize` | `msz` | width, height |
| `TileContent` | `bct` | x, y, `Resources` |
| `TeamName` | `tna` | name |
| `PlayerNew` | `pnw` | id, x, y, orientation, level, team |
| `PlayerPosition` | `ppo` | id, x, y, orientation |
| `PlayerLevel` | `plv` | id, level |
| `PlayerInventory` | `pin` | id, x, y, `Resources` |
| `PlayerExpelled` | `pex` | id |
| `PlayerBroadcast` | `pbc` | id, message |
| `IncantationStart` | `pic` | x, y, level, playerIds |
| `IncantationEnd` | `pie` | x, y, success |
| `PlayerEggLayStart` | `pfk` | id |
| `PlayerResourceDrop` | `pdr` | id, resource |
| `PlayerResourceCollect` | `pgt` | id, resource |
| `PlayerDeath` | `pdi` | id |
| `EggNew` | `enw` | id, playerId, x, y |
| `EggHatched` | `ebo` | id |
| `EggDeath` | `edi` | id |
| `TimeUnit` | `sgt` | frequency |
| `GameEnd` | `seg` | winner (team name) |
| `ServerMessage` | `smg` | message |
| `UnknownCommand` | `suc` | — |
| `BadParameter` | `sbp` | — |

## Gameplay Components

ECS components that represent in-game state:

| Component | Description |
|---|---|
| `Player` | `level` |
| `PlayerId` | Server-assigned numeric id |
| `PlayerSkin` | Skin index |
| `Incantating` | Tag — player is currently in a ritual |
| `PlayerBroadcastBubble` | Broadcast message + remaining display duration |
| `PlayerExpelAnimation` | `elapsed` / `duration` for the expel animation |
| `GridCell` / `GridContainer` / `GridPosition` | Tile grid entities |
| `SimulationTime` | Current `timeUnit` |
| `GameResult` | `finished` flag + `winner` team name |

## 3D Rendering

The world is rendered in a **Minecraft-like voxel style**:

- The map is a 3D grid of tiles; each tile can hold resources rendered as small blocks.
- Players are drawn as Minecraft-style characters using the `MinecraftRenderer` module.

Key rendering utilities:

| Symbol | Purpose |
|---|---|
| `DrawMinecraftHead` | Draws a 2D head icon (UI / HUD) |
| `DrawMinecraftPlayerPreview3D` | Draws a 3D player with mouse-tracking rotation |
| `MinecraftSkin` | Skin scale factor |
| `MinecraftAnimation` | Per-player animation state |
| `MinecraftCrowdLayout` | Layout helper for groups of players on the same tile |
| `MinecraftSkinRender` | Low-level skin draw call |
| `IncantationEffect` | Visual effect played during rituals |
| `CameraController` | Free 3D camera; `camera()` static accessor |

## In-Game UI (`GameUiState`)

A single `GameUiState` component tracks the interactive HUD:

| Field | Description |
|---|---|
| `openedTeam` | Which team panel is currently expanded |
| `selectedPlayer` | Focused player (resources, level, team name) |
| `hoveredTeam` | Team currently highlighted by mouse hover |
| `requestedFrequency` | Value currently set on the frequency slider |
| `confirmedFrequency` | Last value acknowledged by the server |
| `draggingFrequency` | Whether the slider is being dragged |

The frequency slider lets the user change the simulation speed live by sending an `sst` command to the server.

## Build

```bash
# From the GUI repo root
make
```

- Compiler: `clang++`, standard C++23
- Raylib linked via `pkg-config`
- flecs is vendored under `src/extern/`

## API Reference

Documentation is generated from Javadoc-style `/** */` comments using **Doxygen**. The `Doxyfile` is at the root of the GUI repository.

:::info Generate the docs first
Run `bun run docs:api` from the `Common/` directory, then rebuild the site.
The reference will be available at [/api/gui/](pathname:///api/gui/).
:::

```bash
# From Common/
bun run docs:api   # runs doxygen
bun run build      # rebuild Docusaurus
```

To enable class diagrams and call graphs, install **Graphviz** and enable `HAVE_DOT` in the `Doxyfile`.
