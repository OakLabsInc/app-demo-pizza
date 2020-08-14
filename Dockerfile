FROM oaklabs/oak:7.0.0

WORKDIR /app
COPY . /app

RUN npm i --progress=false --loglevel="error" \
    && npm cache clean --force
ENV NODE_ENV=production \
    ELECTRON_ENABLE_SECURITY_WARNINGS=false

CMD ["/app/src/server.js"]