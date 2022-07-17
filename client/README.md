# React client

This project contains the frontend client application for the Voting smart contract written in solidity. It is bootstraped with [Create React App](https://create-react-app.dev).

It uses the following dependencies:

- UI library 'react-bootstrap'

- styling sass

- web3.js

## Getting started

Run `npm start` to start the dev server.

See all [available scripts](https://create-react-app.dev/docs/available-scripts).

## Note on `react-scripts` version

The installed version of `react-scripts` is 4.x instead of the latest 5.x, which uses Webpack 5. This is because Webpack 5 no longer auto-polyfills Node.js core modules, which `web3.js` depends on.

If you don't want to use `react-scripts` at 4.x, alternative solutions include [`eject`](https://create-react-app.dev/docs/available-scripts/#npm-run-eject) and [`react-app-rewired`](https://github.com/timarney/react-app-rewired) (See [instruction](https://github.com/ChainSafe/web3.js#web3-and-create-react-app)).
