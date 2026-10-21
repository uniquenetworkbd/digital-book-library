(() => {
  'use strict';

  function createStatus() {
    const node = document.createElement('div');
    node.id = 'pwaStatus';
    node.className = 'pwa-status';
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
    document.body.appendChild(node);
    return node;
  }

  function showStatus(message, persistent = false) {
    const node = document.getElementById('pwaStatus') || createStatus();
    node.textContent = message;
    node.classList.add('visible');
    if (!persistent) window.setTimeout(() => node.classList.remove('visible'), 3500);
  }

  async function register() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            showStatus('নতুন সংস্করণ প্রস্তুত। আপডেট করতে পেজ রিলোড করুন।', true);
          }
        });
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  window.addEventListener('online', () => showStatus('অনলাইন সংযোগ পুনরুদ্ধার হয়েছে।'));
  window.addEventListener('offline', () => showStatus('অফলাইন মোড: ক্যাশ করা কনটেন্ট ব্যবহার করা হচ্ছে।', true));
  window.addEventListener('load', register, { once: true });
})();
