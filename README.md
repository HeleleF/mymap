# MyMap

Visualizing gym progress in PokemonGo with [Firebase](https://firebase.google.com/), [Angular 11](https://angular.io/) and [MapboxGL](https://docs.mapbox.com/mapbox-gl-js/api/).

## Deploy

Deploying from local cmd line: `firebase deploy --only hosting:main -m "New release"`

**NEW** Updating master now triggers a github actions workflow that builds the projection for production and then deploys it
The release message is the commit message of the PR (see `.github/workflows`).

Important:
Pushing to master is not allowed. Instead, make a new branch and create a PR.

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
