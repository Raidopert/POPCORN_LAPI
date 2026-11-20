import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const SRC = '/home/z/my-project/download/logo/raidopert-emblem-v1-leopard.png';
const OUT = '/home/z/my-project/download/logo/raidopert-emblem-v5-runes.png';

const PROMPT =
  'Keep the purple leopard head and the ornate golden circular frame exactly as they are. ' +
  'Add at the bottom inside the golden frame a small polished gold ribbon banner carrying two large ' +
  'solid metallic engraved Elder Futhark runes in embossed gold metal: the first rune is Raido, shaped ' +
  'like an angular letter R with two straight diagonal legs; the second rune is Perthro, shaped like a ' +
  'rhombus bowl standing on a short vertical stem, open at the top. The runes must be crisp, symmetrical, ' +
  'deeply engraved, clearly readable, brushed metal texture. Everything else unchanged, same composition.';

async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync(SRC).toString('base64');
  const res = await zai.images.generations.edit({
    prompt: PROMPT,
    images: [{ url: `data:image/png;base64,${b64}` }],
    size: '1024x1024',
  });
  const data = res.data?.[0]?.base64;
  if (!data) throw new Error('empty response');
  fs.writeFileSync(OUT, Buffer.from(data, 'base64'));
  console.log('saved', OUT, fs.statSync(OUT).size, 'bytes');
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? e.message : String(e));
  process.exit(1);
});
