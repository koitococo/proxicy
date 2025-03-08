FROM oven/bun:1 as builder
WORKDIR /app

COPY . .
RUN --mount=type=cache,target=/cache \
    BUN_INSTALL_CACHE_DIR=/cache bun install --frozen-lockfile
RUN NODE_ENV=production bun build backend/src/index.ts --target bun --outdir backend/out/

FROM oven/bun:1 as runner 
COPY --from=builder /app/backend/out/index.js /app/index.js
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "/app/index.js" ]