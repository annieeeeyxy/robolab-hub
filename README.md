# RoboLab Hub

RoboLab Hub is the landing and routing application for `robo-labs.net`. The two products remain in separate repositories and deploy independently:

- RoboLab Hub: `/`
- RoboLab FTC: `/ftc`
- RoboPrompt: `/prompt`

The Hub does not contain either product implementation. Its Next.js rewrites proxy each product path to that product's own Vercel deployment while preserving the public `robo-labs.net` URL.

## Requirements

- Node.js 22+
- pnpm 10+

## Environment

Copy `.env.example` to `.env.local` when you need to override the child origins:

- `ROBOLAB_FTC_ORIGIN`: FTC deployment origin, without a path or trailing slash
- `ROBOPROMPT_ORIGIN`: RoboPrompt deployment origin, without a path or trailing slash

The defaults point to the current production Vercel origins. Local multi-zone development can instead use origins such as `http://localhost:3001` and `http://localhost:3002`.

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Requests under `/ftc/*` and `/prompt/*` are proxied to the configured child origins.

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Deployment

Deploy this repository as the root Vercel project and attach `robo-labs.net` only to this project. Configure the two origin variables in Vercel, then deploy FTC and RoboPrompt independently from their own repositories.

The Hub rewrites:

```text
/ftc             -> ROBOLAB_FTC_ORIGIN/ftc
/ftc/*           -> ROBOLAB_FTC_ORIGIN/ftc/*
/prompt          -> ROBOPROMPT_ORIGIN/prompt
/prompt/*        -> ROBOPROMPT_ORIGIN/prompt/*
```

Legacy `/roboprompt/*` and root product shortcuts redirect to the canonical paths.
