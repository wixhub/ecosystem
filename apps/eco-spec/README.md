# Specification Builder

High-performance, responsive and maintainable ecological specification tool built for scientific research using modern Angular standards. Designed with a modular architecture, reactive signals and zero legacy bloat.

This app is a part of the [@ecosystem](../../README.md) monorepo.

## Key Features

- Guided Multi-Step Wizard: Traverses the core Movebank entity hierarchy sequentially: study, individual, tag, deployment, and event.

- Modern Reactive State: Built natively on Angular Signals (signal, computed, inject()) for predictable, high-performance state management without boilerplate overhead.

- Real-Time Data Volume Estimation: Dynamically computes expected storage footprints based on active parameter counts and triggers safe-limit visual warnings.

- Granular Field Validation: Enforces per-attribute numeric range rules (min/max) and blocks navigation or export until step-level criteria are satisfied.

- Adaptive Responsive Design: Compact grid layout with intelligent field scaling, automatically expanding text inputs (like study names and descriptions) into comfortable full-width blocks.

- Instant JSON Export: Compiles active parameters into a structured specification schema for direct browser-side blob downloading.

![Specification Builder UI](main_page.png)

## 🚀 Live Demo

🔗 **[View Live Application on Cloudflare Pages](https://eco-spec.pages.dev/)**

## Tech Stack

- Framework: this project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.6 (Standalone components, Signals)

- Styling: Custom modular SCSS with mobile-first fluid scaling

- Separation of Concerns: Thin component architecture that delegates business rules, validation logic, and state mutations entirely to the core BuilderService.

## Project Structure

```text
src/
└── app/
    ├── core/
    │   ├── models/         # Movebank hierarchy configurations and TypeScript interfaces
    │   └── services/       # Core business logic and reactive state management (BuilderService)
    └── features/
        └── builder/        # Wizard UI component, templates and adaptive styling
```

## 🛠️ Getting Started

For installation instructions and prerequisites, see the **Getting Started** section of [@ecosystem](../../README.md).

## Development

To run this application locally for development, use the Nx task runner from the repository root:

```bash
# Run development server with live reload
npx nx serve eco-spec

# Or run it with a specific configuration
npx nx serve eco-spec --configuration=production
```

## Build

To build the production bundle for this specific application:

```bash
npx nx build eco-spec
```

## Testing

```bash
# Run unit tests
npx nx test eco-spec

# Run lint checks
npx nx lint eco-spec
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check the [issues page](hhttps://github.com/wixhub/ecosystem/issues).

## 📬 Contact & Support

If you have any questions, suggestions, or feedback regarding this project, feel free to reach out:

- **Author:** [@wixhub](https://github.com/wixhub)
- **Telegram:** [@typeweb](https://t.me/typeweb)

## 📄 License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- This project is open-source and available under the [**MIT License**](../../LICENSE).
