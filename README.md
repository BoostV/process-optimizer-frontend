# Process Optimizer Frontend

This project implements a web based frontend for the statistical tool [ProcessOptimizer](https://github.com/novonordisk-research/ProcessOptimizer). It is meant to be used in conjunction with the REST base API for ProcessOptimizer realised in [process-optimizer-api](https://github.com/BoostV/process-optimizer-api).

## Getting Started

Install dependencies and run the development server:

```bash
yarn install
```

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build and run production docker image

```bash
docker build -t process-optimizer-frontend .
docker run -p 3000:3000 process-optimizer-frontend
```

## Run pre-built docker image 

```bash
docker run -d -p3000:3000 ghcr.io/boostv/process-optimizer-frontend/server:main
```
## Local development with docker

The included script "dockeryarn.sh" can be used as substitute for yarn if you have docker installed and don't want to use natively installed node installation

```bash
./dockeryarn.sh install
./dockeryarn.sh dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Update OpenAPI client

When the process-optimizer-api changes run the following command with the desired version tag and commit the resulting changes.

    docker run --rm -it -u $(id -u ${USER}):$(id -g ${USER}) --volume $(pwd):/local openapitools/openapi-generator-cli generate --skip-validate-spec -i https://raw.githubusercontent.com/BoostV/process-optimizer-api/v0.0.1/optimizerapi/openapi/specification.yml -g typescript-fetch -o /local/openapi 

## Learn More

This project is based on Next.js and follow the project structure and conventions of that project.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

