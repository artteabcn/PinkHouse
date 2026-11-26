// Lists every apartment in the Smoobu account and flags the ones the website
// does not sell yet. Read-only (GET requests only).
//
//   node scripts/smoobu-apartments.mjs
//
// Asks for the API key + secret with hidden input (or reads SMOOBU_API_KEY /
// SMOOBU_API_SECRET). Nothing is written to disk and no credential is printed.
// Needs Node 22.18+ (it imports the TypeScript signer directly).

import { createInterface } from "node:readline";
import { signSmoobuRequest, smoobuTimestamp } from "../src/lib/smoobu-hmac.ts";

const BASE = "https://login.smoobu.com/api";
// Keep in step with src/config/smoobu.ts.
const ON_WEBSITE = new Set([3040751, 3040756, 3040766, 3040771, 3040776, 3040781]);

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    process.stdout.write(question);
    rl._writeToOutput = () => {};
    rl.question("", (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

const apiKey = process.env.SMOOBU_API_KEY || (await askHidden("Smoobu API key (hidden): "));
const apiSecret =
  process.env.SMOOBU_API_SECRET || (await askHidden("Smoobu API secret (hidden): "));

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
  console.log(`\n${apartments.length} apartments in Smoobu:\n`);
  for (const a of apartments) {
    console.log(`  ${a.id}  ${ON_WEBSITE.has(a.id) ? "on website " : "NOT on site"}  ${a.name}`);
  }

  for (const a of apartments.filter((x) => !ON_WEBSITE.has(x.id))) {
    console.log(`\n=== ${a.id} ${a.name} ===`);
    const d = await get(`/apartments/${a.id}`);
    console.log("type:", JSON.stringify(d.type ?? null));
    console.log("rooms:", JSON.stringify(d.rooms ?? null));
    console.log("currency:", d.currency ?? "?", "| price:", JSON.stringify(d.price ?? null));
    const raw = await get(
      `/rates?apartments[]=${a.id}&start_date=${isoDay(0)}&end_date=${isoDay(90)}`
    );
    const days = Object.values((raw.data ?? raw)[String(a.id)] ?? {});
    const open = days.filter((r) => r.available === 1 && r.price > 0);
    const prices = open.map((r) => r.price);
    console.log(
      `next 90 days: ${open.length}/${days.length} nights bookable` +
        (prices.length ? `, ${Math.min(...prices)}-${Math.max(...prices)} per night` : "") +
        `, min stay ${[...new Set(days.map((r) => r.min_length_of_stay))].join("/")}`
    );
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
