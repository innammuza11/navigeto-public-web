// Tells IndexNow search engines (Bing, Yandex, Seznam, Naver; Bing feeds ChatGPT and
// Copilot search) which navigeto.com URLs changed. Run once after a production release:
//   node scripts/indexnow.mjs                 # every URL in the live sitemap
//   node scripts/indexnow.mjs /llms.txt /     # only these paths
// The key is public by design: it is also served at https://navigeto.com/<key>.txt.
const SITE = "https://navigeto.com";
const KEY = "6bed7d5d56cc6ba16594d58ed8ae655e";
const paths = process.argv.slice(2);
let urls = paths.map(path => new URL(path, SITE).href);
if (!urls.length) {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replace(/^https:\/\/www\./, "https://"));
}
urls = [...new Set(urls)].filter(url => url.startsWith(`${SITE}/`) || url === SITE);
const keyCheck = await fetch(`${SITE}/${KEY}.txt`);
if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) throw new Error("IndexNow key file is not live yet; release first.");
for (let i = 0; i < urls.length; i += 10000) {
  const response = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ host: "navigeto.com", key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls.slice(i, i + 10000) }) });
  console.log(`IndexNow: ${response.status} ${response.statusText} for ${Math.min(10000, urls.length - i)} URLs`);
}
