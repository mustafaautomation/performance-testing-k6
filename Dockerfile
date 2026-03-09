FROM grafana/k6:0.55.0

WORKDIR /app
COPY src/ src/
COPY tests/ tests/

ENTRYPOINT ["k6", "run"]
CMD ["tests/smoke.test.js"]

# Usage:
#   docker build -t k6-perf .
#   docker run --rm -v $(pwd)/reports:/app/reports k6-perf
#   docker run --rm -v $(pwd)/reports:/app/reports k6-perf tests/load.test.js
