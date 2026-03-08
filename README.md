# Performance Testing k6

[![Performance Tests](https://github.com/mustafaautomation/performance-testing-k6/actions/workflows/performance.yml/badge.svg)](https://github.com/mustafaautomation/performance-testing-k6/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![k6](https://img.shields.io/badge/k6-7D64FF?logo=k6&logoColor=white)](https://k6.io)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](Dockerfile)

Structured k6 performance testing framework covering smoke, load, stress, spike, and soak test scenarios. Targets [reqres.in](https://reqres.in) as a reference API with shared SLO thresholds, reusable HTTP helpers, and HTML report generation.

---

## Table of Contents

- [Test Types](#test-types)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Thresholds (SLOs)](#thresholds-slos)
- [Commands](#commands)
- [CI/CD Integration](#cicd-integration)
- [Project Structure](#project-structure)
- [Development](#development)

---

## Test Types

| Type | VUs | Duration | Purpose |
|------|-----|----------|---------|
| Smoke | 1 | ~30s | Verify endpoints work before heavier tests |
| Load | 50 | ~17 min | Validate performance under expected traffic |
| Stress | 200 | ~24 min | Find the breaking point |
| Spike | 250 | ~9 min | Handle sudden traffic bursts |
| Soak | 50 | 2 hours | Detect memory leaks over time |

---

## Quick Start

```bash
# Install k6 (macOS)
brew install k6

# Clone
git clone https://github.com/mustafaautomation/performance-testing-k6.git
cd performance-testing-k6

# Configure
cp .env.example .env

# Run smoke test
npm run test:smoke

# Run load test
npm run test:load

# Docker
docker build -t k6-perf .
docker run --rm k6-perf tests/smoke.test.js
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Test Suites                        │
│   smoke │ load │ stress │ spike │ soak              │
├─────────────────────────────────────────────────────┤
│                 Shared Layer                         │
│   Thresholds │ HTTP Helpers │ Auth │ Test Data       │
├─────────────────────────────────────────────────────┤
│                 k6 Engine                            │
│         VU scheduling + metrics + checks             │
├─────────────────────────────────────────────────────┤
│                 Reporting                            │
│         k6-reporter (HTML) + text summary            │
└─────────────────────────────────────────────────────┘
```

---

## Thresholds (SLOs)

```
p(95) response time  < 500ms
p(99) response time  < 1000ms
error rate           < 1%
login p(95)          < 300ms
```

---

## Commands

| Command | Description |
|---|---|
| `npm run test:smoke` | 1 VU, single pass — sanity check |
| `npm run test:load` | 50 VUs, steady state |
| `npm run test:stress` | Ramp to 200 VUs — find limits |
| `npm run test:spike` | Instant spike to 250 VUs |
| `npm run test:soak` | 50 VUs for 2 hours |
| `npm run report` | Open last HTML report |

---

## CI/CD Integration

The GitHub Actions workflow supports:

- **Nightly smoke tests** at 2 AM UTC
- **Manual dispatch** — select any test type from the Actions UI
- **HTML report artifacts** uploaded on every run

---

## Project Structure

```
performance-testing-k6/
├── .github/
│   ├── workflows/performance.yml  # Manual dispatch + nightly schedule
│   ├── dependabot.yml             # Automated dependency updates
│   ├── CODEOWNERS                 # Review ownership
│   └── pull_request_template.md   # PR checklist
├── src/
│   ├── config/
│   │   └── thresholds.js          # Shared SLO thresholds
│   ├── helpers/
│   │   ├── auth.js                # Authentication helper
│   │   └── http.js                # HTTP wrappers with error tracking
│   └── data/
│       └── users.js               # Test data
├── tests/
│   ├── smoke.test.js              # 1 VU sanity check
│   ├── load.test.js               # 50 VU steady state
│   ├── stress.test.js             # 200 VU breaking point
│   ├── spike.test.js              # 250 VU instant spike
│   └── soak.test.js               # 50 VU endurance (2h)
├── CONTRIBUTING.md
├── SECURITY.md
├── Dockerfile
└── .dockerignore
```

---

## Development

```bash
# Install k6
brew install k6

git clone https://github.com/mustafaautomation/performance-testing-k6.git
cd performance-testing-k6
cp .env.example .env
npm run test:smoke
```

---

## License

MIT

---

Built by [Quvantic](https://quvantic.com)
