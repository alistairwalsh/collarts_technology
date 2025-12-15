# AGENTS

## Collarts Context
- Collarts (Australian College of the Arts) is a private Melbourne creative college running accelerated bachelor programs spanning music, audio, entertainment, fashion, design, screen media, animation, comedy, and related disciplines.
- For GlueRatGlobal, "college of the rats" is a cheeky reference to Collarts’ arts focus—use it as an internal nod while still pointing audiences back to the school’s creative identity.
- This project frames a Collarts technology course that investigates how AI tools reshape creative production workflows, with an emphasis on practical experimentation and critical literacy around machine learning in the arts.

## Max for Live + AI Angle
- Ableton’s Max for Live lets students design custom audio/MIDI devices, modulators, and automation helpers directly inside Live Suite via Cycling ’74’s Max environment.
- Learners can build AI-assisted performance rigs, generative composition systems, or workflow agents that control Live parameters, process signals, and integrate external hardware.
- Pairing Max for Live prototyping with AI concepts grounds the course in hands-on experimentation, showing how emerging models augment sound design, live performance, and GlueRatGlobal storytelling.

## Networked Delivery Stack
- GitHub stores the max4live curriculum repo: Max patches, project briefs, sample AI scripts, and docs. Every pull request is where students and staff negotiate changes before the source of truth advances.
- Vercel watches that repo and deploys the public-facing course portal the moment `main` updates. The build turns Markdown briefs into lessons, packages Max devices, and refreshes any browser-based demos.
- Discord is the staff command center. Teachers chat in #college-of-the-rats, trigger repo actions with slash commands, and invite guest speakers into voice channels for crits.
- An AI concierge lives in Discord. It can review recent GitHub activity, summarize pull requests, and even dispatch manual Vercel redeploys or rollbacks when a lecturer asks for "fresh cheese" (production deploy) or "hide the stash" (rollback).
- The AI also mediates cross-tool transparency: it posts Vercel deployment statuses back into Discord threads, opens GitHub issues for action items discussed in meetings, and keeps everyone aware of what the automation is doing.
- Together, GitHub owns code, Vercel materializes it for students, and Discord houses the human+AI conversations that steer the ship.

## Discord Command + Webhook Map
- `/rat-status [branch]` — AI grabs the latest GitHub commits for the specified branch, summarizes key changes, and drops a heatmap of test results. Under the hood it calls a GitHub webhook that exposes commit metadata for the bot.
- `/deploy-fresh-cheese [ref]` — Staff-selected ref (default `main`) triggers a Vercel redeploy via Discord. The AI queues the build, reports ETA, and subscribes to the deploy webhook so success/failure gets posted back into the command thread.
- `/hide-the-stash` — Shortcut for Vercel rollback. Bot asks Vercel for the last healthy deployment, executes the rollback, and notifies GitHub by creating a deployment status entry for audit trails.
- `/open-issue <title> <summary>` — Converts discussion notes into GitHub issues. The bot formats the body, tags the relevant module (Max, AI, operations), and links back to the originating Discord message for context.
- `/patch-notes` — Asks the AI to read the latest merged pull requests and produce narrative release notes for the Vercel site. Teachers can edit the notes inline in Discord before publishing.
- Webhook wiring: GitHub → Discord for PR merges/tests, Vercel → Discord for deploy lifecycle, Discord ↔ AI service over HTTPS. The AI keeps lightweight state so any command reply includes cross-tool links (commit, preview URL, issue) without making staff leave the channel.

## Learning Outcomes

By the end of the course, students should be able to:

- Design and deploy custom Max for Live devices that integrate rule-based logic and/or machine learning components.
- Evaluate when AI augmentation improves a creative workflow—and when it introduces friction or loss of agency.
- Read, modify, and version creative tooling using Git-based workflows.
- Articulate the ethical, aesthetic, and practical implications of AI-assisted creative systems.

## Student Workflow Loop

- Students fork or branch from the curriculum repository to develop Max for Live devices, experiments, or performance tools.
- Work is submitted via pull requests, accompanied by short reflective notes explaining intent, constraints, and AI usage.
- Staff and peers review PRs in GitHub and Discord, focusing on design decisions rather than correctness alone.
- Merged work may be showcased on the Vercel site or referenced in live crits.

## AI Usage Boundaries

- AI tools are treated as assistants for ideation, debugging, and exploration—not as autonomous creators.
- Students are expected to understand and explain any AI-assisted logic they incorporate.
- Where generative models are used, provenance and intent should be documented in comments or reflection notes.

## Observability & Transparency

- All automated actions (deploys, rollbacks, issue creation) are announced in Discord with traceable links.
- The AI concierge explains *why* it acted, not just *what* it did.
- System logs and failures are visible to staff and, where appropriate, students.

## Guest and Industry Integration

- Guest practitioners can be invited into Discord for live critiques or walkthroughs.
- Selected student projects can be temporarily deployed or featured as case studies.
- The stack mirrors real-world creative tooling pipelines used in music, games, and media production.
