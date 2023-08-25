# Process Optimizer Frontend

[![CI](https://github.com/BoostV/process-optimizer-frontend/actions/workflows/main.yml/badge.svg?branch=)](https://github.com/BoostV/process-optimizer-frontend/actions/workflows/main.yml)
[![CodeQL](https://github.com/BoostV/process-optimizer-frontend/actions/workflows/codeql-analysis.yml/badge.svg?branch=)](https://github.com/BoostV/process-optimizer-frontend/actions/workflows/codeql-analysis.yml)

This project implements a web based frontend for the statistical tool [ProcessOptimizer](https://github.com/novonordisk-research/ProcessOptimizer).  
It is meant to be used in conjunction with the REST base API for ProcessOptimizer realised in [process-optimizer-api](https://github.com/BoostV/process-optimizer-api).

## Getting Started

### VS Code

If you are using Visual Studio Code (VSCode) you can use the [development container](https://github.com/Microsoft/vscode-dev-containers) definition included here. Just check out the project and let VSCode automatically generate a development environment. The container will start an instance of the [process-optimizer-api](https://github.com/BoostV/process-optimizer-api) based on the main branch in a separate Docker container.

### Prepare the development environment

The repository is structured as a mono repo using the [workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) feature of NPM.

1. Initialize the project by installing dependencies

```bash
npm install
npm run bootstrap
```

2. Start a development server that automatically monitors for changed files and reloads the application in your browser

```bash
npm run dev:app
```

3. Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Build and run production docker image

```bash
docker build -t process-optimizer-frontend .
docker run --rm -it --name process-optimizer-frontend -p 80:80 --env API_URL=http://localhost:9090/v1.0 process-optimizer-frontend
```

## Run pre-built docker image

```bash
docker run -d -p80:80 --env API_URL=http://localhost:9090/v1.0 ghcr.io/boostv/process-optimizer-frontend:main
```

## Update OpenAPI client

When the process-optimizer-api changes, adjust the API version in the "openapi" script in package.json run the following command and commit the resulting changes. Please note that this step requires Java to be installed.

    npm run openapi

## Updating the change log

When you create significant changes that need to be noted in the changelog please run the command

```bash
npx changeset
```

## Contributing

Please see [Contribution guideline for this project](CONTRIBUTING.md)

## Learn More

This project is based on Next.js and follow the project structure and conventions of that project.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## License

Copyright (c) 2022, BoostV. All rights reserved.
Licensed under the BSD 3-Clause License. See [LICENSE](LICENSE.md).
