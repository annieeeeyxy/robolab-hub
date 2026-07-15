# Robotics Workbench

**Live site: https://robolab-hub.vercel.app**

A landing hub that brings two robotics projects together:

- **[RoboPrompt](https://robo-prompt.vercel.app/)** — an AI assistant that turns a photo of a robotic arm into a working control plan (architecture, runnable code, wiring, and calibration).
- **[RoboLab FTC](https://gcet-gold.vercel.app/simulator)** — a virtual FIRST Tech Challenge laboratory: simulate robot code on the 2025–2026 DECODE field with live telemetry, scoring, and AI feedback.

The hub introduces both projects (each with an in-site demo/tutorial page), links out to the live tools, and includes member profile pages for the team.

## Tech

A single self-contained `index.html` — no build step, no dependencies. Inline CSS and vanilla JS with hash-based routing (`#demo-roboprompt`, `#demo-robolab`, `#member-…`). Dark theme matching the two source sites: black + pink for RoboPrompt, black + blue for RoboLab FTC.

## Develop

Open `index.html` in a browser. That's it.

## Deploy

```bash
vercel --prod
```
