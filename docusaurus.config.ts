import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Zappy",
  tagline: "Teams of AI compete to evolve and conquer the world",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://zappy.pavel-dw.com",
  baseUrl: "/",

  organizationName: "Zappy-Epitech",
  projectName: "Common",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Zappy",
      logo: {
        alt: "Zappy Logo",
        src: "img/logo.svg",
      },
      items: [
        { label: "AI", to: "/ai/overview", position: "left" },
        { label: "Server", to: "/server/overview", position: "left" },
        { label: "GUI", to: "/gui/overview", position: "left" },
        {
          href: "https://github.com/orgs/Zappy-Epitech",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            { label: "Introduction", to: "/" },
            { label: "AI", to: "/ai/overview" },
            { label: "Server", to: "/server/overview" },
            { label: "GUI", to: "/gui/overview" },
          ],
        },
        {
          title: "Source",
          items: [
            { label: "GitHub", href: "https://github.com/orgs/Zappy-Epitech" },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Zappy. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
