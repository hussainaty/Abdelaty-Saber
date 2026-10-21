import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";

const html = readFileSync("index.html", "utf8");
const baseline = execFileSync("git", ["show", "HEAD:index.html"], { encoding: "utf8" });
const withoutFilm = html.replace(/<section class="logo-film"[\s\S]*?<\/section>/, "");
const translations = value => [...value.matchAll(/\bdata-(en|ar)="([^"]*)"/g)].map(match => match[0]);
assert.deepEqual(translations(withoutFilm), translations(baseline), "Existing English and Arabic copy changed");
const visibleCopy = value => value
  .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/g, "")
  .replace(/<(?:(?:"[^"]*")|(?:'[^']*')|[^'">])*?>/g, " ")
  .replace(/\s+/g, " ").trim();
assert.equal(visibleCopy(withoutFilm), visibleCopy(baseline), "Existing visible content changed");
const links = value => [...value.matchAll(/\bhref="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(links(withoutFilm), links(baseline), "Existing links changed");
assert.match(html, /<\/section>\s*<section class="contact-section"/);
const sections = [...html.matchAll(/<section[^>]+id="([^"]+)"/g)].map(match => match[1]);
assert.equal(sections[sections.indexOf("contact") - 1], "logo-film", "Film must immediately precede Contact");
const logo = html.match(/<section class="logo-film"[\s\S]*?<\/section>/)[0];
assert.match(logo, /data-scroll-playback/, "Logo must use scroll-controlled autoplay");
assert.doesNotMatch(logo, /data-player-toggle|\scontrols(?:\s|>)/, "Logo must not expose pause controls");
assert.match(logo, /<video[^>]+muted playsinline loop/, "Logo must loop silently and inline");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, "Duplicate IDs");
const resources = [...html.matchAll(/(?:src|poster|data-src|data-mobile-src|href)="(assets\/[^"#]+)"/g)].map(match => match[1]);
resources.forEach(file => assert(existsSync(file), "Missing asset: " + file));

const base = "http://127.0.0.1:4173/";
const range = await fetch(base + "assets/aty-logo-mobile.mp4", { headers: { Range: "bytes=0-1023" } });
assert.equal(range.status, 206, "Video byte ranges must be supported");
assert.equal((await range.arrayBuffer()).byteLength, 1024);
assert.equal(range.headers.get("content-type"), "video/mp4");
console.log("PASS: Original bilingual copy, visible text, and links preserved.");
console.log("PASS: Video immediately before Contact; unique IDs and all referenced assets exist.");
console.log("PASS: Logo scroll autoplay, muted inline looping, and no pause controls.");
console.log("PASS: HTTP byte-range video playback support.");
