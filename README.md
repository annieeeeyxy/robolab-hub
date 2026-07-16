# RoboLab Hub

RoboLab Hub is a single Next.js application containing two robotics products:

- **RoboPrompt** (`/roboprompt`) turns robot-arm photos into targeted hardware questions, control plans, and downloadable starter code.
- **RoboLab FTC** (`/ftc`) provides a 3D FTC simulator, telemetry, learning paths, and AI-assisted run analysis.

The Hub owns the product navigation and language preference. English, Spanish,
French, and Simplified Chinese are shared across the Hub, RoboPrompt, and
RoboLab FTC. The selected language is saved in the browser and also controls the
language used for AI-generated RoboPrompt documents and FTC feedback.

## Requirements

- Node.js 22+
- pnpm 10+

## Environment

Copy `.env.example` to `.env.local` and configure the providers you use:

- `ANTHROPIC_API_KEY`: RoboPrompt image analysis, interviews, plans, and code generation
- `OPENAI_API_KEY`: RoboLab FTC telemetry analysis
- `OPENAI_MODEL`: optional FTC analysis model override
- `SITE_PASSWORD`: required in production to protect RoboPrompt's paid API routes

```bash
cp .env.example .env.local
```

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The optional native dependencies in `package.json` keep the Three.js/Tailwind/
Next.js build reproducible on Apple Silicon development machines and Linux
deployment environments.

## Main routes

- `/`: Hub product chooser
- `/roboprompt`: RoboPrompt overview
- `/roboprompt/try`: photo-to-control-plan workflow
- `/ftc`: FTC learning paths
- `/ftc/simulator`: interactive simulator and telemetry
- `/ftc/coach`: coach dashboard
- `/ftc/student`: team-member dashboard

## Deployment

The primary target is Vercel. Import the repository, add the environment
variables above, and deploy as a standard Next.js App Router application.
