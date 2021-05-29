# Movium app

This is a movium app template.

## Start the development server

Start the app in development mode:

```shell
yarn start
```

The app will be available at `http://localhost:8080`.

## Run the tests

To run the tests run:

```shell
yarn test
```

## Build for production

To build the app, run:

```shell
yarn build
```

The app output will be in `dist` folder.

## Notes

- The `public` folder contains assets that will be copied into the output 
  folder.
- Test setup module is located in `src/__test__/setup.js`.
- Babel is configured to use two extra plugins:
  - [@babel/plugin-proposal-throw-expressions](https://babeljs.io/docs/en/babel-plugin-proposal-throw-expressions)
  - [@babel/plugin-proposal-pipeline-operator](https://babeljs.io/docs/en/babel-plugin-proposal-pipeline-operator)

## Movium documentation

You can read the Movium documentation by following the links [in the 
README](https://github.com/foxbunny/movium/blob/master/README.md).

