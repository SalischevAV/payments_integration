import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const types = [
	'feat',
	'fix',
	'chore',
	'docs',
	'refactor',
	'test',
	'ci',
	'perf',
];

function ask(question) {
	return new Promise(resolve => rl.question(question, resolve));
}

(async () => {
	const type = await ask(`Type (${types.join(', ')}): `);

	if (!types.includes(type)) {
		console.error('❌ Invalid type');
		process.exit(1);
	}

	const scope = await ask('Scope (optional): ');
	const description = await ask('Description: ');

	if (!description) {
		console.error('❌ Description is required');
		process.exit(1);
	}

	const message = scope
		? `${type}(${scope}): ${description}`
		: `${type}: ${description}`;

	execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
	rl.close();
})();
