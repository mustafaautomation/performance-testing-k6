FROM grafana/k6:0.51.0

WORKDIR /app
COPY . .

ENTRYPOINT ["k6", "run"]
CMD ["tests/smoke.test.js"]
