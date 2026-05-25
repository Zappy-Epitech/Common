import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const COMPONENTS = [
  {
    abbr: "AI",
    title: "AI Client",
    to: "/ai/overview",
    accent: "var(--zappy-ai)",
    description:
      "No language constraint — autonomous agents that explore Trantor, forage resources, communicate via broadcasts, and coordinate incantations. The player can send up to 10 commands ahead without waiting for responses.",
    tags: ["Any Language", "TCP", "Autonomous"],
  },
  {
    abbr: "SRV",
    title: "Server",
    to: "/server/overview",
    accent: "var(--zappy-server)",
    description:
      "Written in Rust (spec allows C, C++ or Rust). A single-process, single-thread server using poll() — manages the Trantor world simulation, enforces timing rules, and dispatches events to AI and GUI clients.",
    tags: ["Rust", "poll()", "TCP"],
  },
  {
    abbr: "GUI",
    title: "GUI",
    to: "/gui/overview",
    accent: "var(--zappy-gui)",
    description:
      "Written in C++ (SFML recommended). Connects to the server using the special GRAPHIC team name. Must include a 2D visualisation at minimum; 3D is a bonus.",
    tags: ["C++", "SFML", "2D / 3D"],
  },
];

const RESOURCES = [
  { name: "food", color: "#f59e0b", density: 0.5 },
  { name: "linemate", color: "#6ee7b7", density: 0.3 },
  { name: "deraumere", color: "#60a5fa", density: 0.15 },
  { name: "sibur", color: "#f472b6", density: 0.1 },
  { name: "mendiane", color: "#a78bfa", density: 0.1 },
  { name: "phiras", color: "#fb923c", density: 0.08 },
  { name: "thystame", color: "#34d399", density: 0.05 },
];

const COMMANDS = [
  { cmd: "Forward", desc: "Move one tile ahead", time: "7/f", response: "ok" },
  { cmd: "Right", desc: "Turn 90° clockwise", time: "7/f", response: "ok" },
  {
    cmd: "Left",
    desc: "Turn 90° counter-clockwise",
    time: "7/f",
    response: "ok",
  },
  {
    cmd: "Look",
    desc: "Observe surrounding tiles",
    time: "7/f",
    response: "[tile, ...]",
  },
  {
    cmd: "Inventory",
    desc: "List carried resources & food left",
    time: "1/f",
    response: "[linemate n, ...]",
  },
  {
    cmd: "Broadcast text",
    desc: "Directional message to all players",
    time: "7/f",
    response: "ok",
  },
  {
    cmd: "Connect_nbr",
    desc: "Query available team slots",
    time: "—",
    response: "value",
  },
  {
    cmd: "Fork",
    desc: "Lay an egg (new player slot)",
    time: "42/f",
    response: "ok",
  },
  {
    cmd: "Eject",
    desc: "Push all players off this tile",
    time: "7/f",
    response: "ok / ko",
  },
  {
    cmd: "Take object",
    desc: "Pick up an object from this tile",
    time: "7/f",
    response: "ok / ko",
  },
  {
    cmd: "Set object",
    desc: "Drop an object on this tile",
    time: "7/f",
    response: "ok / ko",
  },
  {
    cmd: "Incantation",
    desc: "Start elevation ritual (group action)",
    time: "300/f",
    response: "Elevation underway → level k",
  },
];

const ELEVATION_TABLE = [
  {
    level: 2,
    players: 1,
    linemate: 1,
    deraumere: 0,
    sibur: 0,
    mendiane: 0,
    phiras: 0,
    thystame: 0,
  },
  {
    level: 3,
    players: 2,
    linemate: 1,
    deraumere: 1,
    sibur: 1,
    mendiane: 0,
    phiras: 0,
    thystame: 0,
  },
  {
    level: 4,
    players: 2,
    linemate: 2,
    deraumere: 0,
    sibur: 1,
    mendiane: 0,
    phiras: 2,
    thystame: 0,
  },
  {
    level: 5,
    players: 4,
    linemate: 1,
    deraumere: 1,
    sibur: 2,
    mendiane: 0,
    phiras: 1,
    thystame: 0,
  },
  {
    level: 6,
    players: 4,
    linemate: 1,
    deraumere: 2,
    sibur: 1,
    mendiane: 3,
    phiras: 0,
    thystame: 0,
  },
  {
    level: 7,
    players: 6,
    linemate: 1,
    deraumere: 2,
    sibur: 3,
    mendiane: 0,
    phiras: 1,
    thystame: 0,
  },
  {
    level: 8,
    players: 6,
    linemate: 2,
    deraumere: 2,
    sibur: 2,
    mendiane: 2,
    phiras: 2,
    thystame: 1,
  },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className={styles.heroDots} aria-hidden />
      <div className="container">
        <img src="/img/logo.svg" alt="Zappy logo" className={styles.heroLogo} />
        <Heading as="h1" className={clsx("hero__title", styles.heroTitle)}>
          {siteConfig.title}
        </Heading>
        <p className={clsx("hero__subtitle", styles.heroSubtitle)}>
          {siteConfig.tagline}
        </p>
        <div className={styles.heroBadges}>
          <span className={styles.badge}>Epitech · G-YEP-400</span>
          <span className={styles.badge}>Rust / C++</span>
          <span className={styles.badge}>TCP Protocol</span>
          <span className={styles.badge}>Multi-player</span>
        </div>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/ai/overview"
          >
            AI Docs
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/server/overview"
          >
            Server Docs
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/gui/overview"
          >
            GUI Docs
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Component Cards ──────────────────────────────────────────────────────────

function ComponentCard({
  abbr,
  title,
  to,
  accent,
  description,
  tags,
}: (typeof COMPONENTS)[number]) {
  return (
    <div className={clsx("col col--4", styles.componentCol)}>
      <Link
        to={to}
        style={{ "--card-accent": accent } as React.CSSProperties}
        className={styles.componentCard}
      >
        <div className={styles.cardBadge}>{abbr}</div>
        <Heading as="h3" className={styles.cardTitle}>
          {title}
        </Heading>
        <p className={styles.cardDescription}>{description}</p>
        <div className={styles.cardTags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <span className={styles.cardArrow}>Read docs →</span>
      </Link>
    </div>
  );
}

function ProjectComponents() {
  return (
    <section className={styles.componentsSection}>
      <div className="container">
        <Heading as="h2" className={clsx("text--center", styles.sectionTitle)}>
          Project Components
        </Heading>
        <p className={clsx("text--center", styles.sectionSubtitle)}>
          Three independent modules communicating over TCP
        </p>
        <div className="row">
          {COMPONENTS.map((comp) => (
            <ComponentCard key={comp.title} {...comp} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── README Section ───────────────────────────────────────────────────────────

function ReadmeSection() {
  return (
    <section className={styles.readmeSection}>
      <div className="container">
        <div className={styles.readmeWindow}>
          {/* Window chrome */}
          <div className={styles.windowBar}>
            <span className={styles.dot} style={{ background: "#ff5f57" }} />
            <span className={styles.dot} style={{ background: "#ffbd2e" }} />
            <span className={styles.dot} style={{ background: "#28c840" }} />
            <span className={styles.windowTitle}>README.md</span>
          </div>

          {/* Markdown body */}
          <div className={styles.readmeBody}>
            <Heading as="h1" className={styles.readmeH1}>
              Zappy — A Tribute to Zaphod Beeblebrox
            </Heading>

            <blockquote className={styles.readmeQuote}>
              A networked multi-player strategy game where teams of autonomous
              AI agents compete on a tile-based world. The first team to have{" "}
              <strong>6 players reach elevation&nbsp;8</strong> wins.
            </blockquote>

            {/* Architecture */}
            <Heading as="h2">Architecture</Heading>
            <p>
              Three independent programs communicate over{" "}
              <strong>TCP sockets</strong>. The server is the single source of
              truth; AI clients and the GUI client both connect to it.
            </p>

            <div className={styles.archRow}>
              <div
                className={styles.archBox}
                style={
                  { "--box-color": "var(--zappy-ai)" } as React.CSSProperties
                }
              >
                <div className={styles.archBoxTitle}>zappy_ai</div>
                <p>
                  One process per player. Fully autonomous — navigates, forages,
                  cooperates via broadcasts, triggers incantations.
                </p>
              </div>
              <div className={styles.archArrow}>⟷</div>
              <div
                className={styles.archBox}
                style={
                  {
                    "--box-color": "var(--zappy-server)",
                  } as React.CSSProperties
                }
              >
                <div className={styles.archBoxTitle}>zappy_server</div>
                <p>
                  Written in Rust (spec: C, C++ or Rust). Single-process,
                  single-thread, uses poll(). The team name GRAPHIC is reserved
                  for the GUI to authenticate.
                </p>
              </div>
              <div className={styles.archArrow}>⟷</div>
              <div
                className={styles.archBox}
                style={
                  { "--box-color": "var(--zappy-gui)" } as React.CSSProperties
                }
              >
                <div className={styles.archBoxTitle}>zappy_gui</div>
                <p>
                  Written in C++ with SFML. Authenticates with GRAPHIC as team
                  name. Passive observer rendering the world in real-time.
                </p>
              </div>
            </div>

            {/* Game rules */}
            <Heading as="h2">Game Rules</Heading>
            <p>
              The world is <strong>Trantor</strong> — a zero-relief, toroidal
              tile map (edges wrap around). Trantorians are pacifists; they
              forage resources and incant. Each player starts with{" "}
              <strong>10 food (1 260 time units of life)</strong>. One food unit
              sustains a player for <strong>126 time units</strong>. A player
              who runs out of food receives <code>dead</code> and is
              disconnected.
            </p>
            <p>
              <strong>Vision</strong> increases with elevation: at level 1, a
              player sees 1 tile ahead; each elevation adds one line in front
              and one extra tile on each side. The <code>Look</code> command
              returns a flat list of tiles ordered front-to-back, left-to-right.
            </p>

            <div className={styles.tableWrapper}>
              <table className={styles.commandTable}>
                <thead>
                  <tr>
                    <th>Command</th>
                    <th>Description</th>
                    <th>Time</th>
                    <th>Response</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMANDS.map(({ cmd, desc, time, response }) => (
                    <tr key={cmd}>
                      <td>
                        <code>{cmd}</code>
                      </td>
                      <td>{desc}</td>
                      <td>
                        <code>{time}</code>
                      </td>
                      <td>
                        <code>{response}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resources */}
            <Heading as="h2">Resources</Heading>
            <div className={styles.resourceGrid}>
              {RESOURCES.map(({ name, color, density }) => (
                <div
                  key={name}
                  className={styles.resourceChip}
                  style={{ "--chip-color": color } as React.CSSProperties}
                >
                  <span className={styles.resourceDot} />
                  <code>{name}</code>
                  <span className={styles.resourceDensity}>×{density}</span>
                </div>
              ))}
            </div>
            <p>
              Resources spawn at startup and every{" "}
              <strong>20 time units</strong>. Quantity per resource ={" "}
              <code>map_width × map_height × density</code>. On a 10×10 map: 50
              food, 5 thystame.
            </p>

            {/* Elevation table */}
            <Heading as="h2">Elevation Requirements</Heading>
            <div className={styles.tableWrapper}>
              <table className={styles.elevationTable}>
                <thead>
                  <tr>
                    <th>Transition</th>
                    <th>Players</th>
                    <th>linemate</th>
                    <th>deraumere</th>
                    <th>sibur</th>
                    <th>mendiane</th>
                    <th>phiras</th>
                    <th>thystame</th>
                  </tr>
                </thead>
                <tbody>
                  {ELEVATION_TABLE.map((row) => (
                    <tr key={row.level}>
                      <td>
                        <strong>
                          {row.level - 1} → {row.level}
                        </strong>
                      </td>
                      <td>{row.players}</td>
                      <td>{row.linemate || "—"}</td>
                      <td>{row.deraumere || "—"}</td>
                      <td>{row.sibur || "—"}</td>
                      <td>{row.mendiane || "—"}</td>
                      <td>{row.phiras || "—"}</td>
                      <td>{row.thystame || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Players do not need to be on the same team — only the same level.
              Incantation is verified at <strong>start and end</strong>: if
              conditions fail at either check, elevation fails. Players are{" "}
              <strong>frozen</strong> during the ritual; stones are{" "}
              <strong>consumed</strong> on success.
            </p>

            {/* Connection Protocol */}
            <Heading as="h2">Connection Protocol</Heading>
            <p>When a client connects, the following handshake occurs:</p>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeLang}>text</span>
              </div>
              <pre className={styles.codePre}>{`Server → Client : WELCOME
Client → Server : TEAM-NAME
Server → Client : CLIENT-NUM    (available slots for this team)
Server → Client : X Y           (world dimensions)`}</pre>
            </div>
            <p>
              The AI client can pipeline up to <strong>10 commands</strong>{" "}
              without waiting for responses. Commands beyond 10 are silently
              dropped. The GUI authenticates by sending <code>GRAPHIC</code> as
              team name.
            </p>

            {/* Getting started */}
            <Heading as="h2">Getting Started</Heading>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeLang}>bash</span>
              </div>
              <pre className={styles.codePre}>{`# 1. Build all binaries
make

# 2. Start the server (20×20 map, 2 teams, 5 slots each, 100 ticks/s)
./zappy_server -p 4242 -x 20 -y 20 -n team1 team2 -c 5 -f 100

# 3. Connect the graphical client
./zappy_gui -p 4242 -h localhost

# 4. Launch AI clients (one per player)
./zappy_ai -p 4242 -n team1 -h localhost`}</pre>
            </div>

            <div className={styles.flagsGrid}>
              {[
                ["-p port", "TCP port to listen on"],
                ["-x width", "Map width (tiles)"],
                ["-y height", "Map height (tiles)"],
                ["-n names…", "Team names (space-separated)"],
                ["-c clients", "Max clients per team"],
                ["-f freq", "Time units per second"],
              ].map(([flag, desc]) => (
                <div key={flag} className={styles.flagItem}>
                  <code>{flag}</code>
                  <span>{desc}</span>
                </div>
              ))}
            </div>

            {/* Victory */}
            <Heading as="h2">Victory Condition</Heading>
            <div className={styles.victoryBox}>
              <p>
                The first team to have{" "}
                <strong>
                  6 players simultaneously reach elevation level 8
                </strong>{" "}
                wins. Achieving this requires gathering the rarest resources
                across the map and perfectly coordinating a final group
                incantation ritual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Zappy — A networked multi-player AI strategy game simulation"
    >
      <HomepageHeader />
      <main>
        <ProjectComponents />
        <ReadmeSection />
      </main>
    </Layout>
  );
}
