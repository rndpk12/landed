const firstText = (...selectors) => {
  for (const selector of selectors) {
    const value = document.querySelector(selector)?.textContent?.trim();
    if (value) return value;
  }
  return '';
};

const jobPostingFromJsonLd = () => {
  const findJobPosting = (value) => {
    if (Array.isArray(value)) return value.map(findJobPosting).find(Boolean);
    if (!value || typeof value !== 'object') return null;
    if (value['@type'] === 'JobPosting' || value['@type']?.includes?.('JobPosting')) return value;
    return Object.values(value).map(findJobPosting).find(Boolean);
  };

  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const job = findJobPosting(JSON.parse(script.textContent || '{}'));
      if (job) return job;
    } catch {
      // Ignore malformed third-party structured data.
    }
  }
  return null;
};

const extractJob = () => {
  const structured = jobPostingFromJsonLd();
  const title = structured?.title || firstText('h1', '[data-test="job-title"]', '.job-title') || document.title;
  const company = structured?.hiringOrganization?.name || firstText('[data-test="employer-name"]', '.jobs-unified-top-card__company-name', '.company-name');
  const jobLocation = structured?.jobLocation?.address?.addressLocality || firstText('[data-test="job-location"]', '.jobs-unified-top-card__bullet');
  const description = structured?.description || firstText('[data-test="job-description"]', '.description__text', '.jobs-description-content__text');

  return { title, company, location: jobLocation, description, url: window.location.href };
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_JOB') sendResponse(extractJob());
});
