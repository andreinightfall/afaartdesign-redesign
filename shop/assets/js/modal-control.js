// modal-control.js — varianta simplă, fără salturi și fără "fixed body"
(() => {
  const modal    = document.getElementById('bookingModal');
  const openBtn  = document.getElementById('openBooking'); // CTA bar
  const fabBtn   = document.getElementById('fabContact');  // buton flotant
  const closeBtn = document.getElementById('closeBooking');

  if (!modal) return;

  function openModal(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    modal.hidden = false;
    // blochează DOAR scroll-ul, nu schimbăm poziția în pagină
    document.body.classList.add('body--modal-open');

    // focus fără auto-scroll
    const first = modal.querySelector('input, textarea, select, button');
    first?.focus?.({ preventScroll: true });
  }

  function closeModal(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    modal.hidden = true;
    document.body.classList.remove('body--modal-open');
    // nu facem niciun scrollTo aici
  }

  // Triggers
  openBtn?.addEventListener('click', openModal);

  // FAB: oprește orice default & propagare, apoi deschide
  if (fabBtn) {
    fabBtn.setAttribute('type', 'button');
    fabBtn.addEventListener('click', openModal, { capture: true });
  }

  closeBtn?.addEventListener('click', closeModal);

  // Click pe overlay = închide (dar doar dacă se face click pe background-ul modalei)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(e);
  });

  // ESC închide
  window.addEventListener('keydown', (e) => {
    if (!modal.hidden && e.key === 'Escape') closeModal(e);
  });

  // Ascunde butonul flotant când CTA bar / footer intră în viewport (rămâne la fel)
  if ('IntersectionObserver' in window) {
    const cta = document.querySelector('.cta-bar');
    const footer = document.querySelector('footer');
    const io = new IntersectionObserver(([entry]) => {
      fabBtn?.classList.toggle('is-hidden', entry.isIntersecting);
    }, { rootMargin: '0px 0px -20% 0px' });
    cta && io.observe(cta);
    footer && io.observe(footer);
  }

  // ---- Rotator text & lățime smooth pentru #fabContact (nemodificat) ----
  if (fabBtn && !fabBtn.dataset.rotatorInit) {
    fabBtn.dataset.rotatorInit = '1';

    const fabText = fabBtn.querySelector('.fab-text');
    if (fabText) {
      const messages = [
        'Scrie-ne!',
        'Pune o întrebare',
        'Solicită o ofertă',
        'Hai să vorbim',
        'Ai un proiect?',
        'Ai nevoie de detalii?'
      ];
      let idx = 0;

      const ghost = fabBtn.cloneNode(true);
      ghost.id = 'fabContactGhost';
      Object.assign(ghost.style, {
        position: 'fixed',
        left: '-9999px',
        top: '0',
        visibility: 'hidden',
        opacity: '0'
      });
      document.body.appendChild(ghost);
      const ghostText = ghost.querySelector('.fab-text');

      const WIDTH_CAP = 0;

      const measureWidthFor = (text) => {
        ghostText.textContent = text;
        const w = Math.ceil(ghost.getBoundingClientRect().width);
        return WIDTH_CAP > 0 ? Math.min(w, WIDTH_CAP) : w;
      };

      const setWidthTo = (text) => {
        const w = measureWidthFor(text);
        fabBtn.style.width = w + 'px';
      };
      setWidthTo(fabText.textContent || '');

      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const ROTATE_MS = 3000;
      const FADE_MS   = 350;

      if (!prefersReduced) {
        setInterval(() => {
          fabBtn.classList.add('text-fade-out');
          setTimeout(() => {
            idx = (idx + 1) % messages.length;
            const next = messages[idx];
            setWidthTo(next);
            fabText.textContent = next;
            fabBtn.classList.remove('text-fade-out');
          }, FADE_MS);
        }, ROTATE_MS);
      }
    }
  }
})();
