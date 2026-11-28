// Lists every apartment in the Smoobu account and flags the ones the website
// does not sell yet. Read-only (GET requests only).
//
//   node scripts/smoobu-apartments.mjs
//
// Asks for the API key + secret with hidden input (or reads SMOOBU_API_KEY /
// SMOOBU_API_SECRET). Credentials are never printed or written to disk.
// `--out <file>` also saves the listing (not the credentials) to that file.
// Needs Node 22.18+ (it imports the TypeScript signer directly).

import { appendFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { signSmoobuRequest, smoobuTimestamp } from "../src/lib/smoobu-hmac.ts";

const BASE = "https://login.smoobu.com/api";
// Keep in step with src/config/smoobu.ts.
const ON_WEBSITE = new Set([3040741, 3040751, 3040756, 3040766, 3040771, 3040776, 3040781]);

const outFlag = process.argv.indexOf("--out");
const outFile = outFlag > -1 ? process.argv[outFlag + 1] : null;
if (outFile) writeFileSync(outFile, "");

function say(...parts) {
  const line = parts.join(" ");
  console.log(line);
  if (outFile) appendFileSync(outFile, `${line}\n`);
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = () => {}; // swallow the echo of typed / pasted text
    rl.question("", (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer.trim());
    });
    // Written after question(), which clears the current line when it starts.
    process.stdout.write(question);
  });
}

// Asks until something arrives: a pasted line break must not skip a prompt.
async function askRequired(name) {
  for (;;) {
    const value = await askHidden(`Smoobu API ${name} (hidden): `);
    if (value) {
      process.stdout.write(`  received ${value.length} characters\n`);
      return value;
    }
    process.stdout.write(`  nothing received - paste the ${name}, then press Enter\n`);
  }
}

const apiKey = process.env.SMOOBU_API_KEY || (await askRequired("key"));
let apiSecret = process.env.SMOOBU_API_SECRET || (await askRequired("secret"));
while (apiSecret === apiKey) {
  process.stdout.write("  that is the key again - paste the SECRET\n");
  apiSecret = await askRequired("secret");
}

async function get(path) {
  const signed = await signSmoobuRequest({
    method: "GET",
    url: `${BASE}${path}`,
    apiKey,
    apiSecret,
    timestamp: smoobuTimestamp(),
    nonce: crypto.randomUUID(),
  });
  const res = await fetch(signed.url, {
    headers: { ...signed.headers, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Smoobu ${res.status} on ${path}: ${await res.text()}`);
  return res.json();
}

function isoDay(offset) {
  return new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
}

try {
  const { apartments } = await get("/apartments");
  say(`\n${apartments.length} apartments in Smoobu:\n`);
  for (const a of apartments) {
    say(`  ${a.id}  ${ON_WEBSITE.has(a.id) ? "on website " : "NOT on site"}  ${a.name}`);
  }

  for (const a of apartments.filter((x) => !ON_WEBSITE.has(x.id))) {
    say(`\n=== ${a.id} ${a.name} ===`);
    const d = await get(`/apartments/${a.id}`);
    say("type:", JSON.stringify(d.type ?? null));
    say("rooms:", JSON.stringify(d.rooms ?? null));
    say("currency:", d.currency ?? "?", "| price:", JSON.stringify(d.price ?? null));
    const raw = await get(
      `/rates?apartments[]=${a.id}&start_date=${isoDay(0)}&end_date=${isoDay(90)}`
    );
    const days = Object.values((raw.data ?? raw)[String(a.id)] ?? {});
    const open = days.filter((r) => r.available === 1 && r.price > 0);
    const prices = open.map((r) => r.price);
    say(
      `next 90 days: ${open.length}/${days.length} nights bookable` +
        (prices.length ? `, ${Math.min(...prices)}-${Math.max(...prices)} per night` : "") +
        `, min stay ${[...new Set(days.map((r) => r.min_length_of_stay))].join("/")}`
    );
  }
} catch (err) {
  say(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
}

say("\nDONE");
