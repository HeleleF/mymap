# MyMap

Visualizing gym progress in PokemonGo with [Firebase](https://firebase.google.com/), [Angular 9](https://angular.io/) and [MapboxGL](https://docs.mapbox.com/mapbox-gl-js/api/).

## Deploy

`firebase deploy --only hosting:main -m "Lets go"`

## Development

Start Firestore emulator: `firebase emulators:start --only firestore --import "./exported"` Antivirus may cause problems!?

Run `npm start` for a dev server. Navigate to `http://localhost:8001/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Unit tests

Not ready yet ;)

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## End-to-end tests

Not ready yet ;)

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
