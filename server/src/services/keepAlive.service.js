const KEEP_ALIVE_INTERVAL_MS = 14 * 60 * 1000;
const PING_TIMEOUT_MS = 10000;

const resolveSelfUrl = () => {
  const baseUrl = process.env.SELF_URL || process.env.RENDER_EXTERNAL_URL;
  if (!baseUrl) return null;
  return baseUrl.replace(/\/+$/, "");
};

const ping = async (selfUrl) => {
  try {
    const response = await fetch(`${selfUrl}/api/health`, {
      signal: AbortSignal.timeout(PING_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.log(`Keep-alive | ping failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`Keep-alive | ping failed: ${error.message}`);
  }
};

export const startKeepAlive = () => {
  const selfUrl = resolveSelfUrl();

  if (!selfUrl) {
    console.log("Keep-alive | disabled, set SELF_URL to enable it");
    return;
  }

  setInterval(() => ping(selfUrl), KEEP_ALIVE_INTERVAL_MS);
  console.log(`Keep-alive | pinging ${selfUrl}/api/health every 14 minutes`);
};
