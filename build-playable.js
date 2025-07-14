import bestzip from 'bestzip';

const DIST_DIR = './dist';
const OUTPUT_ZIP = './playable.zip';

async function zipOnlyHtml() {
	await bestzip({
		source: ['index.html'],
		destination: OUTPUT_ZIP,
		cwd: DIST_DIR,
	});
	console.log(`📦 Архив создан: ${OUTPUT_ZIP}`);
}

zipOnlyHtml().catch(err => {
	console.error('❌ Ошибка при создании архива:', err);
	process.exit(1);
});
