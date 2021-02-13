## Getting Started

Install dependencies and run the development server:

```bash
yarn install
```

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on http://localhost:3000/api/x

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Build and run production docker image

```bash
docker build -t process-optimizer-frontend .
docker run -p 3000:3000 process-optimzer-frontend
```
## Local development with docker

The included script "dockeryarn.sh" can be used as substitute for yarn if you have docker installed and don't want to use natively installed node installation

```bash
./dockeryarn.sh install
./dockeryarn.sh dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

