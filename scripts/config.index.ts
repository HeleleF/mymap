import { writeFile, readFileSync } from 'fs';

const targetPath = './src/environments/environment.prod.ts';

const newEnvConfigFile = readFileSync(targetPath, { encoding: 'utf-8' })
	.replace(
		'<PLACEHOLDER_MAPBOX_API_TOKEN>',
		process.env.MAPBOX_API_TOKEN as string
	)
	.replace(
		'<PLACEHOLDER_FIREBASE_API_KEY>',
		process.env.FIREBASE_API_KEY as string
	);

writeFile(targetPath, newEnvConfigFile, 'utf8', (err) => {
	if (err) {
		return console.log(err);
	}
});
