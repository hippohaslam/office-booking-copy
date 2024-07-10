# React + TypeScript + Vite + Yarn@V4

## Yarn V4
This project uses Yarn V4 with node_modules. Currently there is a bug in typescript where imports are not linked so we cannot use pnp



## App

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Development

### HTTPS certificates

- For local development, because we use httpOnly cookies for authentication. You will need to create dev certificates, this is done automatically through the `vite-plugin-mkcert` package, you will just be asked your machine password to be able to create the certificates. They are then stored locally in the /certs directory which is git ignored.

## Upgrading packages.

We recommend to keep the local packages up to date with minor versions as frequency as possible.
Major versions should be checked and updated when possible. All this to ensure security updates.

A good tool to use in ncu:
- Install with `npm install -g npm-check-updates`
- run with `ncu` to see possible updates. Then use `ncu -u` to update package.json file. The yarn install to complete.
- Finally test and smoke test the app. 



## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescri[build.yaml](..%2F..%2F..%2F.github%2Fworkflows%2Fbuild.yaml)
[deploy-dev.yaml](..%2F..%2F..%2F.github%2Fworkflows%2Fdeploy-dev.yaml)pt-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Tests

We are using vitest and react testing library to unit and integration tests the front end.

We also use msw to mock API calls so for simpler and more robust testing.

For Canvas we need to follow `https://www.npmjs.com/package/canvas` install instructions before doing a  `yarn install` otherwise the test runner cannot read the browser canvas.
This would also be the case for CI/CD pipelines.