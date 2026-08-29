"use strict";

import { CLERK_PUBLISHABLE_KEY } from './config.js';

function frontendApiFromPublishableKey(publishableKey) {
  const encodedDomain = publishableKey.split('_')[2].replace(/-/g, '+').replace(/_/g, '/');
  const padded = encodedDomain + '='.repeat((4 - (encodedDomain.length % 4)) % 4);
  return atob(padded).replace(/\$$/, '');
}

function injectScript(src, attributes = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value);
    script.onload = resolve;
    script.onerror = () => reject(new Error(`تعذر تحميل سكربت الولوج من ${src}`));
    document.head.appendChild(script);
  });
}

export async function loadClerk() {
  if (!/^pk_(test|live)_\S+$/.test(CLERK_PUBLISHABLE_KEY)) {
    throw new Error('مفتاح النشر مفقود: انسخ js/config.example.js إلى js/config.js وأدخل المفتاح الحقيقي');
  }
  const frontendApi = frontendApiFromPublishableKey(CLERK_PUBLISHABLE_KEY);
  await injectScript(`https://${frontendApi}/npm/@clerk/ui@1/dist/ui.browser.js`);
  await injectScript(`https://${frontendApi}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, {
    'data-clerk-publishable-key': CLERK_PUBLISHABLE_KEY,
  });
  await window.Clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
  return window.Clerk;
}
