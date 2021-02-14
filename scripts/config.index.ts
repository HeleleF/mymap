import { writeFile } from 'fs';

const targetPath = './src/environments/environment.prod.ts';

//TODO(helene): change this to replace placeholders instead of rewrting everything
const envConfigFile = `export const environment = {
   production: true,
   MAPBOX_STYLE_URI: 'mapbox://styles/mappinglehne/ck4n0h27q0qqe1crzvpg8vpsm',
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
