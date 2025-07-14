import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.resolve(__dirname, './src/common/assets.js');
const publicDir = path.resolve(__dirname, './public');
const audioDir = path.join(publicDir, 'audio');
const backupPath = inputPath + '.bak';

function extractBlock(source, label) {
	const match = source.match(new RegExp(`export const ${label} = {([\\s\\S]+?)^};`, 'm'));
	if (!match) {
		console.error(`❌ Не найден ${label} в файле.`);
		process.exit(1);
	}
	return match[1].trim();
}

async function generateTextures(original) {
	const allTextureKeys = extractBlock(original, 'allTextureKeys');
	const appTexturesBlock = extractBlock(original, 'appTextures');
	
	const textureEntries = appTexturesBlock
		.split('\n')
		.map(line => line.trim())
		.filter(line => line && !line.startsWith('//'))
		.map(line => {
			const match = line.match(/\[allTextureKeys\.(.+?)\]:\s*['"`](.+?)['"`]/);
			if (!match) return null;
			const [, key, path] = match;
			return { key, path };
		})
		.filter(Boolean);
	
	console.log(`🔄 Конвертация ${textureEntries.length} изображений в base64:`);
	
	const generated = await Promise.all(
		textureEntries.map(async ({ key, path: relativePath }) => {
			const filePath = path.resolve(publicDir, relativePath);
			if (!fs.existsSync(filePath)) {
				console.warn(`⚠️  Файл не найден: ${filePath}`);
				return null;
			}
			const buffer = await sharp(filePath).toBuffer();
			const ext = path.extname(filePath).slice(1);
			const mime = ext === 'jpg' ? 'jpeg' : ext;
			const base64 = buffer.toString('base64');
			return `\t[allTextureKeys.${key}]: "data:image/${mime};base64,${base64}"`;
		})
	);
	
	return {
		allTextureKeys,
		appTextures: generated.filter(Boolean).join(',\n')
	};
}

async function generateAudio() {
	if (!fs.existsSync(audioDir)) return '';
	
	const audioFiles = fs.readdirSync(audioDir).filter(file => /\.(mp3|ogg|wav|aac)$/i.test(file));
	
	if (!audioFiles.length) return '';
	
	console.log(`🔊 Конвертация ${audioFiles.length} аудиофайлов в base64:`);
	
	const entries = await Promise.all(
		audioFiles.map(async file => {
			const filePath = path.join(audioDir, file);
			const buffer = fs.readFileSync(filePath);
			const ext = path.extname(file).slice(1).toLowerCase();
			const name = path.basename(file, path.extname(file));
			const base64 = buffer.toString('base64');
			return `\t"${name}": "data:audio/${ext};base64,${base64}"`;
		})
	);
	
	return `export const audioAssets = {\n${entries.join(',\n')}\n};`;
}

async function generate() {
	const original = fs.readFileSync(inputPath, 'utf-8');
	const { allTextureKeys, appTextures } = await generateTextures(original);
	const audioAssets = await generateAudio();
	
	const result = `
				export const allTextureKeys = {
					${allTextureKeys}
				};

				export const appTextures = {
					${appTextures}
				};
				${audioAssets}`;
	
	// Бэкап
	if (!fs.existsSync(backupPath)) {
		fs.copyFileSync(inputPath, backupPath);
		console.log(`📦 Резервная копия сохранена: ${backupPath}`);
	}
	
	fs.writeFileSync(inputPath, result);
	console.log(`✅ Обновлён: ${inputPath}`);
}

generate();
