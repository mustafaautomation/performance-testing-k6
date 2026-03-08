# performance-testing-k6

> A structured k6 performance testing framework covering smoke, load, stress, spike, and soak test scenarios.

[![Performance Tests](https://github.com/mustafaautomation/performance-testing-k6/actions/workflows/performance.yml/badge.svg)](https://github.com/mustafaautomation/performance-testing-k6/actions/workflows/performance.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![k6](https://img.shields.io/badge/k6-7D64FF?logo=k6&logoColor=white)](https://k6.io)

---

## Test Types

| Type    | VUs    | Duration  | Purpose |
|---------|--------|-----------|---------|
| Smoke   | 1      | ~30s      | Verify endpoints work before heavier tests |
| Load    | 50     | ~17 min   | Validate performance under expected traffic |
| Stress  | 200    | ~24 min   | Find the breaking point |
| Spike   | 250    | ~9 min    | Handle sudden traffic bursts |
| Soak    | 50     | 2 hours   | Detect memory leaks over time |

---

## Stack

| Tool | Purpose |
|---|---|
| [k6](https://k6.io) | Load engine |
| [k6-reporter](https://github.com/benc-uk/k6-reporter) | HTML reports |
| GitHub Actions | CI pipeline with manual dispatch |
| reqres.in | Target REST API |

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
```

---

## Architecture

```
performance-testing-k6/
├── src/
│   ├── config/
│   │   └── thresholds.js     # Shared SLO thresholds
│   ├── helpers/
│   │   ├── auth.js           # Authentication helper
│   │   └── http.js           # HTTP wrappers with error tracking
│   └── data/
│       └── users.js          # Test data
├── tests/
│   ├── smoke.test.js
│   ├── load.test.js
│   ├── stress.test.js
│   ├── spike.test.js
│   └── soak.test.js
└── .github/workflows/
    └── performance.yml       # Manual dispatch + nightly schedule
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

## CI/CD

The workflow supports **manual dispatch** — trigger any test type directly from the GitHub Actions UI without touching code. Nightly smoke tests run automatically at 2 AM UTC. HTML reports are uploaded as artifacts on every run.

---

## Commands

| Command | Description |
|---|---|
| `npm run test:smoke`  | 1 VU, single pass — sanity check |
| `npm run test:load`   | 50 VUs, steady state |
| `npm run test:stress` | Ramp to 200 VUs — find limits |
| `npm run test:spike`  | Instant spike to 250 VUs |
| `npm run test:soak`   | 50 VUs for 2 hours |
| `npm run report`      | Open last HTML report |

---

Built by [Quvantic](https://quvantic.com)
