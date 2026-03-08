# Contributing to Performance Testing k6

## Getting Started

```bash
# Install k6
brew install k6  # macOS
# or: https://k6.io/docs/getting-started/installation/

git clone https://github.com/mustafaautomation/performance-testing-k6.git
cd performance-testing-k6
cp .env.example .env
```

## Adding a New Test

1. Create `tests/<type>.test.js`
2. Import shared thresholds from `src/config/thresholds.js`
3. Use helpers from `src/helpers/` for HTTP calls
4. Add `handleSummary` for HTML report generation
5. Add npm script in `package.json`

## Pull Request Process

1. Create a feature branch from `main`
2. Test locally with `k6 run tests/<your-test>.js`
3. Submit PR using the provided template
