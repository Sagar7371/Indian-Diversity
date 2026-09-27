import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const healthUrl = `http://localhost:${process.env.PORT || 5000}/api/health`;

async function backendIsReady() {
  try {
    const response = await fetch(healthUrl, { signal: AbortSignal.timeout(700) });
    return response.ok;
  } catch {
    return false;
  }
}

if (await backendIsReady()) {
  console.log('Bharat AI API is already running.');
  process.exitCode = 0;
} else {
  const backend = spawn(process.execPath, ['backend/server.js'], {
    cwd: projectRoot,
    detached: true,
    stdio: 'ignore',
    env: process.env
  });
  backend.unref();

  let ready = false;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (await backendIsReady()) {
      console.log('Started the Bharat AI API in the background.');
      ready = true;
      break;
    }
    if (backend.exitCode !== null) break;
  }

  if (!ready) console.warn('Could not start the Bharat AI API automatically. Run `npm run server` in another terminal and check that port 5000 is available.');
}
