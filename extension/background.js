const storage = chrome.storage.local;
const PRODUCTION_DASHBOARD_URL = 'https://getlanded.vercel.app/dashboard';

const normaliseApiUrl = (apiUrl) => apiUrl.trim().replace(/\/$/, '');

const getGoogleAccessToken = () => new Promise((resolve, reject) => {
  if (!chrome.identity?.getAuthToken) {
    reject(new Error('Google sign-in is unavailable. Reload the Landed extension and try again.'));
    return;
  }

  chrome.identity.getAuthToken({ interactive: true }, (accessToken) => {
    const error = chrome.runtime.lastError;
    if (error || !accessToken) {
      reject(new Error(error?.message || 'Google sign-in was not completed.'));
      return;
    }
    resolve(accessToken);
  });
});

const request = async ({ apiUrl, token, path, method = 'POST', body }) => {
  const response = await fetch(`${normaliseApiUrl(apiUrl)}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Landed could not complete that request.');
  }
  return data;
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const run = async () => {
    if (message.type === 'LOGIN') {
      const auth = await request({
        apiUrl: message.apiUrl,
        path: '/auth/login',
        body: { email: message.email, password: message.password }
      });
      await storage.set({ landedApiUrl: normaliseApiUrl(message.apiUrl), landedToken: auth.token, landedUser: auth.user });
      return { user: auth.user };
    }

    if (message.type === 'GOOGLE_LOGIN') {
      const accessToken = await getGoogleAccessToken();
      const auth = await request({
        apiUrl: message.apiUrl,
        path: '/auth/google',
        body: { credential: accessToken }
      });
      await storage.set({ landedApiUrl: normaliseApiUrl(message.apiUrl), landedToken: auth.token, landedUser: auth.user });
      return {
        user: auth.user,
        // The fragment is never sent to the web server. The dashboard imports
        // it into session storage immediately, then removes it from the URL.
        dashboardUrl: `${PRODUCTION_DASHBOARD_URL}#landed_token=${encodeURIComponent(auth.token)}`
      };
    }

    if (message.type === 'LOGOUT') {
      await storage.remove(['landedToken', 'landedUser']);
      return {};
    }

    const { landedApiUrl: apiUrl, landedToken: token } = await storage.get(['landedApiUrl', 'landedToken']);
    if (!apiUrl || !token) {
      throw new Error('Connect your Landed account first.');
    }

    if (message.type === 'IMPORT_JOB') {
      return request({ apiUrl, token, path: '/job-import', body: { url: message.url } });
    }

    if (message.type === 'SAVE_APPLICATION') {
      return request({ apiUrl, token, path: '/applications', body: message.application });
    }

    throw new Error('Unknown extension action.');
  };

  run().then((data) => sendResponse({ ok: true, data })).catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});
