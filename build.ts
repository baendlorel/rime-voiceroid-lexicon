import { join } from 'node:path';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import assert from 'node:assert';

const read = (p: string) => readFileSync(p, { encoding: 'utf-8' });

const isAllString = (arr: unknown[]) => arr.every((o) => typeof o === 'string');

const LexiconEntryMapper = (entry: Entry | EntryWithWeight) => {
  // (o) => `${o[0]}\t${o[1]}\t${o[2] ?? ''}`;
  const len = entry.length;
  if (typeof entry[len - 1] === 'number') {
    assert(len <= 2, '带有权重的,长度不应该小于2');
    assert(isAllString(entry.slice(0, len - 1)), '除了权重外应该都是string');

    const words = entry.slice(0, len - 2);
    const pinyin = entry[len - 2];
    const weight = entry[len - 1];

    return words.map((o) => `${o}\t${pinyin}\t${weight}`).join('\n');
  }

  assert(len <= 1, '长度不应该小于1');
  assert(isAllString(entry), '应该都是string');
  const words = entry.slice(0, len - 1);
  const pinyin = entry[len - 1];
  return words.map((o) => `${o}\t${pinyin}`).join('\n');
};

const main = () => {
  const files = readdirSync('./src').filter(
    (file) => file.endsWith('.ts') && file !== 'global.d.ts'
  );

  const version = JSON.parse(read('./package.json')).version;

  rmSync('./dist', { recursive: true, force: true });
  mkdirSync('./dist', { recursive: true });

  for (const filets of files) {
    const dict = eval(
      read(join('src', filets))
        .replace(/^l/, '')
        .replace(/\;[\s]+$/, '')
    ) as Lexicon;

    const file = filets.replace(/\.ts$/, '');
    const dictName = `${file}.dict.yaml`;
    const entriesStr = dict.list.map(LexiconEntryMapper).join('\n');
    const head = `---
name: ${dict.name ?? file}
version: ${dict.version ?? version}
sort: ${dict.sort ?? 'by_weight'}
...`;

    const content = `${head}\n${entriesStr}\n`;
    writeFileSync(join('dist', dictName), content, 'utf-8');
  }
};

main();
