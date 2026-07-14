# Self-contained inspection image. Not required for `npm run inspect:docker`
# (which bind-mounts the repo); build this only when you want an image that
# carries its own deps. Tag must match the @playwright/test version.
ARG PW_VERSION=1.60.0
FROM mcr.microsoft.com/playwright:v${PW_VERSION}-noble
WORKDIR /work
COPY . .
RUN npm ci
CMD ["npm", "run", "inspect"]
