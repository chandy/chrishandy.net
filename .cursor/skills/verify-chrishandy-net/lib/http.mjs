export async function fetchOk(url, { timeoutMs = 3000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    return { ok: res.ok, status: res.status, url: res.url };
  } catch (err) {
    return { ok: false, status: 0, error: String(err?.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

export async function waitForUrl(url, { timeoutMs = 120_000, intervalMs = 500 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    last = await fetchOk(url);
    if (last.ok) return last;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out waiting for ${url}: ${JSON.stringify(last)}`);
}
