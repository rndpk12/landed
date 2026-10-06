const byId = (id) => document.getElementById(id);
const loginView = byId('login-view');
const jobView = byId('job-view');
const message = byId('message');
const apiUrlInput = byId('api-url');
let activeJob = null;
const DEFAULT_API_URL = 'https://landed-backend-nkxx.onrender.com/api/v1';
const LOCAL_LITE_IMPORT_URL = 'http://localhost:3000/lite/import';
const CONTENT_SCRIPT_HOSTS = [
  'linkedin.com',
  'greenhouse.io',
  'lever.co',
  'workday.com',
  'ashbyhq.com',
  'naukri.com'
];

const isLocalApi = (apiUrl) => {
  try {
    const { hostname } = new URL(apiUrl);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

const supportsPageExtraction = (pageUrl) => {
  try {
    const hostname = new URL(pageUrl).hostname.toLowerCase();
    return CONTENT_SCRIPT_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
};

const send = (messagePayload) => new Promise((resolve) => {
  chrome.runtime.sendMessage(messagePayload, (response) => {
    const error = chrome.runtime.lastError;
    resolve(error ? { ok: false, error: 'The Landed extension background service is unavailable. Reload the extension and try again.' } : response);
  });
});

const showMessage = (text) => { message.textContent = text; };

const apiOrigin = (apiUrl) => {
  const url = new URL(apiUrl);
  return `${url.protocol}//${url.host}/*`;
};

const backendStatus = {
  Saved: 'SAVED',
  Applied: 'APPLIED',
  OA: 'OA',
  Interview: 'INTERVIEW',
  Offer: 'OFFER',
  Rejected: 'REJECTED',
  Accepted: 'ACCEPTED'
};

// The extension may use a local API during development, but this button is
// intentionally a production hand-off so users never get sent to localhost.
const portalUrlFor = () => 'https://getlanded.vercel.app/login';

const ensureApiPermission = async (apiUrl) => chrome.permissions.request({ origins: [apiOrigin(apiUrl)] });

const showLogin = () => {
  loginView.hidden = false;
  jobView.hidden = true;
};

const showJob = async () => {
  loginView.hidden = true;
  jobView.hidden = false;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeJob = { url: tab?.url || '', title: tab?.title || '' };
  byId('page-url').textContent = activeJob.url || 'No active tab found.';
};

const setForm = (job) => {
  byId('company').value = job.company || '';
  byId('role').value = job.role || job.title || '';
  byId('location').value = job.location || '';
  byId('description').value = job.description || '';
  byId('notes').value = [job.experience && `Experience: ${job.experience}`, job.salary && `Salary: ${job.salary}`].filter(Boolean).join('\n');
  byId('application-form').hidden = false;
};

const extractFromPage = async (tab) => {
  const fallback = { url: tab?.url || '', title: tab?.title || '' };
  if (!tab?.id || !tab.url || !supportsPageExtraction(tab.url)) return fallback;

  const pageJob = await new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_JOB' }, (response) => {
      // Pages outside the extension's supported job boards have no content
      // script. The URL still opens in Lite for a manual review.
      void chrome.runtime.lastError;
      resolve(response);
    });
  });

  return pageJob ? { ...fallback, ...pageJob } : fallback;
};

const openLocalLite = async () => {
  showMessage('Preparing Landed Lite import...');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) throw new Error('Open a job posting first.');
  const job = await extractFromPage(tab);
  const params = new URLSearchParams();
  const values = {
    url: job.url || tab.url,
    company: job.company,
    role: job.role || job.title,
    location: job.location,
    description: job.description
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  await chrome.tabs.create({ url: `${LOCAL_LITE_IMPORT_URL}?${params.toString()}` });
  window.close();
};

byId('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage('Connecting to Landed...');
  const apiUrl = apiUrlInput.value.trim();
  try {
    const allowed = await ensureApiPermission(apiUrl);
    if (!allowed) throw new Error('Allow access to your Landed API to connect the extension.');
    const response = await send({ type: 'LOGIN', apiUrl, email: byId('email').value.trim(), password: byId('password').value });
    if (!response?.ok) throw new Error(response?.error || 'Could not sign in.');
    showMessage(`Connected as ${response.data.user.name}.`);
    await showJob();
  } catch (error) {
    showMessage(error.message);
  }
});

byId('google-login').addEventListener('click', async () => {
  showMessage('Opening Google sign-in...');
  const apiUrl = apiUrlInput.value.trim();
  try {
    if (!apiUrl) throw new Error('Enter your Landed API URL first.');
    const allowed = await ensureApiPermission(apiUrl);
    if (!allowed) throw new Error('Allow access to your Landed API to connect the extension.');
    const response = await send({ type: 'GOOGLE_LOGIN', apiUrl });
    if (!response?.ok) throw new Error(response?.error || 'Could not sign in with Google.');
    if (!response.data.dashboardUrl) throw new Error('Could not open your Landed dashboard.');
    await chrome.tabs.create({ url: response.data.dashboardUrl });
    window.close();
  } catch (error) {
    showMessage(error.message.includes('client_id')
      ? 'Add the Chrome extension Google client ID in manifest.json, then reload the extension.'
      : error.message);
  }
});

byId('use-lite').addEventListener('click', async () => {
  try {
    await openLocalLite();
  } catch (error) {
    showMessage(error.message || 'Could not open Landed Lite.');
  }
});

byId('import-job').addEventListener('click', async () => {
  showMessage('Reading job page...');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return showMessage('Open a job posting first.');
  activeJob = { url: tab.url, title: tab.title || '' };

  const imported = await send({ type: 'IMPORT_JOB', url: tab.url });
  if (imported?.ok) {
    setForm(imported.data);
    return showMessage('Job details imported. Review them, then save.');
  }

  if (!supportsPageExtraction(tab.url)) {
    return showMessage(imported?.error || 'This job site is not supported for page extraction yet.');
  }

  const pageJob = await new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_JOB' }, (response) => {
      // Unsupported pages do not have the content script; consume the
      // expected Chrome error and let the URL importer message be shown.
      void chrome.runtime.lastError;
      resolve(response);
    });
  });
  if (pageJob) {
    activeJob = { ...activeJob, ...pageJob };
    setForm(pageJob);
    return showMessage('Used page data because the URL import was unavailable.');
  }
  showMessage(imported?.error || 'Could not read this job page.');
});

byId('application-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage('Saving to Landed...');
  const response = await send({
    type: 'SAVE_APPLICATION',
    application: {
      company: byId('company').value.trim(),
      role: byId('role').value.trim(),
      jobUrl: activeJob?.url || undefined,
      location: byId('location').value.trim() || undefined,
      jobDescription: byId('description').value.trim() || undefined,
      status: backendStatus[byId('status').value],
      notes: byId('notes').value.trim() || undefined,
      appliedDate: new Date().toISOString().slice(0, 10)
    }
  });
  if (!response?.ok) return showMessage(response?.error || 'Could not save this application.');
  showMessage('Saved. Open Landed to see it in your pipeline.');
  byId('application-form').hidden = true;
  byId('open-landed').hidden = false;
});

byId('open-landed').addEventListener('click', async () => {
  await chrome.tabs.create({ url: portalUrlFor() });
  window.close();
});

byId('save-to-lite').addEventListener('click', async () => {
  try {
    await openLocalLite();
  } catch (error) {
    showMessage(error.message || 'Could not open Landed Lite.');
  }
});

byId('logout').addEventListener('click', async () => {
  await send({ type: 'LOGOUT' });
  showMessage('Disconnected from Landed.');
  showLogin();
});

const initialise = async () => {
  const { landedApiUrl, landedToken } = await chrome.storage.local.get(['landedApiUrl', 'landedToken']);
  apiUrlInput.value = landedApiUrl && !isLocalApi(landedApiUrl) ? landedApiUrl : DEFAULT_API_URL;

  // A token issued by the local API cannot authenticate against production.
  // Clear the legacy connection rather than displaying the production URL
  // while background requests still use the stored localhost value.
  if (landedApiUrl && isLocalApi(landedApiUrl)) {
    await chrome.storage.local.remove(['landedApiUrl', 'landedToken', 'landedUser']);
    showLogin();
    showMessage('Production API selected. Sign in again to save jobs to your live Landed account.');
    return;
  }

  if (landedToken) await showJob();
  else showLogin();
};

void initialise();
