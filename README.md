# MoveRDM Ecological Telemetry Ecosystem ⚗️

A comprehensive suite of enterprise-grade scientific web applications, micro-frontends and metadata pipelines designed for ecological research, animal migration telemetry and Movebank-compatible data management.

## 🏛️ Monorepo Architecture

The workspace is structured as a scalable monorepo separating specialized scientific applications from shared libraries:

```text
apps/
├── bio-stream/          # Spatial rendering engine for migration data
├── data-curation/       # Interactive tracking data utility
├── eco-spec/            # Telemetry specification wizard
├── metadata-harvester/  # Metadata ingestion pipeline & REST gateway
├── movebank-explorer/   # Frontend repository prototype
├── sensor-streams/      # Multi-dimensional sensor dashboard
├── spatial-temporal/    # Migration playback & geographical visualization
├── zeo/                 # Core utility application
└── zeo-e2e/             # End-to-end testing suite
libs/
├── config/              # Shared configuration management
└── data-access/         # Shared domain models, services and utils
```

## 🚀 Applications Portfolio

- **eco-spec** ⚗️ Professional specification wizard for configuring hierarchical Movebank telemetry parameters and generating structured JSON schemas, featuring real-time data volume calculations processed in a background Web Worker thread <br> | Angular, Signals, Web Workers → 🌐 [Live Demo](https://eco-spec.pages.dev)

- **metadata-harvester** ☄︎ Enterprise-grade metadata ingestion pipeline & REST gateway for ecological research data management <br>
  | Java, Spring Boot, Angular, PostgreSQL, Docker → 🌐 [Live Demo](https://metadata-harvester.pages.dev)

- **movebank-explorer-web** ☄︎ Responsive frontend prototype for research data repositories, built for the MoveRDM ecosystem <br>
  | Angular, Groq AI, Workers → 🌐 [Live Demo](https://movebank-explorer.pages.dev)

- **spatial-temporal** ☄︎ High-performance scientific web application for interactive playback and visualization of animal migration telemetry over geographical map layers, incorporating timeline controls and speed scaling <br>
  | Angular, Leaflet, Workers → 🌐 [Live Demo](https://spatial-temporal.pages.dev)

- **sensor-streams** ☄︎ The scientific dashboard designed to visualize multi-dimensional sensor streams, combining GPS tracking with accelerometer and environmental data through synchronized time-series charts <br>
  | Angular, ChartJS, Workers → 🌐 [Live Demo](https://sensor-streams.pages.dev)

- **bio-stream** ☄︎ Spatial rendering engine for migratory animal tracking data <br>
  | Angular, Leaflet, Workers → 🌐 [Live Demo](https://bio-stream.pages.dev)

- **data-curation** ☄︎ Interactive web utility for researchers working with animal tracking data <br>
  | Angular & Leaflet → 🌐 [Live Demo](https://data-curation.pages.dev)

## 📦 Core Shared Libraries (libs/data-access)

The shared domain logic is centralized under libs/data-access:

- models/: Strongly typed domain contracts for telemetry data packets, tracking deployments and metadata schemas.

- services/: Shared API communication layers, backend connectors and state management utilities.

- utils/: High-performance helpers for spatial calculations, time-series parsing and background worker messaging.

## 📦 Getting Started

### Prerequisites

- **Node.js**: `v22.x` (LTS recommended)
- **npm**: `v10+` or `v11+`

1. **Clone the repository:**

```bash
git clone [https://github.com/](https://github.com/)wixhub/ecosystem.git
cd ecosystem
```

2. **Install dependencies:**

```bash
npm ci
```

## 💻 Local Development

Instead of running tasks globally, use the Nx task runner targeting a specific application:

```bash
# Run development server for a specific app (e.g., spatial-temporal)
npx nx serve <app-name>

# Build production bundle
npx nx build <app-name>

# Run unit tests
npx nx test <app-name> --watch=false

# Run linter
npx nx lint <app-name>
```

To see all available tasks and dependency graphs:

```bash
npx nx graph
```

## ⚙️ CI/CD Pipeline

The repository features an advanced, automated CI/CD pipeline located in .github/workflows/ci.yml:

- Smart Affected Analysis: Automatically detects changes using Nx dependency graph and builds/tests only the affected applications in parallel.

- Matrix Strategy: Dynamically spawns isolated jobs for each targeted project.

- Conditional Secrets Injection: Safely provisions API keys (such as Carto) exclusively for authorized applications.

- Automated Deployments: Seamlessly deploys production bundles to Cloudflare Pages on pushes to the main branch.

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check the [issues page](https://github.com/wixhub/ecosystem/issues).

## 📬 Contact & Support

If you have any questions, suggestions, or feedback regarding this project, feel free to reach out:

- **Author:** [@wixhub](https://github.com/wixhub)
- **Telegram:** [@typeweb](https://t.me/typeweb)

## 📄 License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- This project is open-source and available under the [**MIT License**](./LICENSE).

- **Data Attribution**: Data provided by [**Movebank**](www.movebank.org) and individual researchers.
