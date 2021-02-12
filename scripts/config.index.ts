/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { writeFile } from 'fs';

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
   production: true,
   MAPBOX_API_TOKEN: '${process.env.MAPBOX_API_TOKEN}',
   firebaseConfig: {
        apiKey: '${process.env.FIREBASE_API_KEY}',
        authDomain: 'meine-pwa.firebaseapp.com',
        databaseURL: 'https://meine-pwa.firebaseio.com',
        projectId: 'meine-pwa',
        storageBucket: 'meine-pwa.appspot.com',
        messagingSenderId: '340118471403',
        appId: '1:340118471403:web:4e13847887689032'
    }
};
`;

writeFile(targetPath, envConfigFile, 'utf8', (err) => {
  if (err) {
    return console.log(err);
  }
});