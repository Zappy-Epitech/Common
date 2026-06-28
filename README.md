# Zappy

> Epitech — B-YEP-400

Zappy is a networked multi-player game in which teams of autonomous AI agents compete on a toroidal world called **Trantor**. Agents gather resources, perform elevation rituals to level up, and the first team to get **6 players simultaneously at level 8** wins.

The project is split into three independent components, each living in its own repository and assembled here as git submodules.

---

## Architecture

```
┌─────────────┐        TCP        ┌───────────────┐
│  zappy_ai   │ ◄────────────────►│               │
│  (C++)      │  AI protocol      │  zappy_server │
└─────────────┘                   │  (Rust)       │
                                  │               │
┌─────────────┐        TCP        │               │
│  zappy_gui  │ ◄────────────────►│               │
│  (C++)      │  GUI protocol     └───────────────┘
└─────────────┘
```

| Component | Language | Build system | Binary |
|---|---|---|---|
| Server | Rust | Cargo | `zappy_server` |
| AI client | C++ | CMake | `zappy_ai` |
| GUI | C++ (Raylib) | Make | `zappy_gui` |

---

## Repository layout

```
Common/
├── server/          # submodule — Rust server
├── ai/              # submodule — C++ AI client
├── gui/             # submodule — C++ graphical client
├── docs/            # component overviews (Docusaurus)
├── website/         # Docusaurus site configuration
└── Makefile         # top-level build
```

---

## Prerequisites

| Tool | Purpose |
|---|---|
| `cargo` + Rust stable | Build the server |
| `clang++` | Build the AI and GUI |
| `cmake` | Configure the AI project |
| `raylib` (`pkg-config --libs raylib`) | GUI rendering library |

---

## Building

Clone with submodules, then run `make` from this directory:

```bash
git clone --recurse-submodules <repo-url>
cd Common
make
```

This produces three binaries in the current directory:

| Binary | Description |
|---|---|
| `zappy_server` | Game server |
| `zappy_ai` | Autonomous AI client |
| `zappy_gui` | Graphical observer |

### Individual targets

```bash
make zappy_server   # Rust server only
make zappy_ai       # C++ AI only
make zappy_gui      # C++ GUI only
```

### Cleaning

```bash
make clean    # Remove build artifacts (keeps binaries)
make fclean   # Remove build artifacts and binaries
make re       # fclean + all
```

---

## Running the game

**1 — Start the server**

```bash
./zappy_server -p <port> -x <width> -y <height> -n <team1> <team2> ... -c <slots> -f <freq>
```

| Flag | Description |
|---|---|
| `-p port` | TCP port to listen on |
| `-x width` | Map width in tiles |
| `-y height` | Map height in tiles |
| `-n name…` | Team names (space-separated) |
| `-c clientsNb` | Max clients per team at start |
| `-f freq` | Time units per second (default: 100) |

**2 — Launch the GUI**

```bash
./zappy_gui -p <port> -h <host>
```

**3 — Connect AI clients**

```bash
./zappy_ai -p <port> -h <host> -n <team-name>
```

Run as many instances as needed — they connect to the same server and team.

---

## Game rules

### World — Trantor

Trantor is a **zero-relief, toroidal map**: walking off one edge wraps around to the opposite side. Resources respawn **every 20 time units** according to fixed density ratios (food 0.5, linemate 0.3, deraumere 0.15, …).

### Players

- Each player starts at level 1 with 10 food units (= 1 260 time units of life).
- Losing all food triggers death (`dead\n`).
- Up to **10 commands** can be pipelined without waiting for responses.

### Elevation

Players level up via **Incantation** rituals. All participants on the tile must be at the same level and the correct stones must be present. On success every participant advances one level; the stones are consumed.

| Transition | Players | linemate | deraumere | sibur | mendiane | phiras | thystame |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 → 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 2 → 3 | 2 | 1 | 1 | 1 | 0 | 0 | 0 |
| 3 → 4 | 2 | 2 | 0 | 1 | 0 | 2 | 0 |
| 4 → 5 | 4 | 1 | 1 | 2 | 0 | 1 | 0 |
| 5 → 6 | 4 | 1 | 2 | 1 | 3 | 0 | 0 |
| 6 → 7 | 6 | 1 | 2 | 3 | 0 | 1 | 0 |
| 7 → 8 | 6 | 2 | 2 | 2 | 2 | 2 | 1 |

### Win condition

The game ends when a team has **at least 6 players simultaneously at level 8**. The server announces the winning team.

---

## Documentation

Component overviews live under `docs/`:

- [`docs/server/overview.md`](docs/server/overview.md) — Server architecture, protocol, and API reference guide
- [`docs/ai/overview.md`](docs/ai/overview.md) — AI command reference, vision model, elevation table
- [`docs/gui/overview.md`](docs/gui/overview.md) — GUI protocol, display requirements, Doxygen setup

A Docusaurus site is configured in `website/`. To build and serve it locally:

```bash
cd website
bun install
bun run start
```
