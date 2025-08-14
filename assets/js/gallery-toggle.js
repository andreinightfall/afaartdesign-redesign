// assets/js/gallery-toggle.js
const btn = document.getElementById('toggle-gallery');
const section = document.getElementById('gallery-section');

let galleryLoaded = false;

function show() {
  section.removeAttribute('hidden');
  btn.querySelector('.label').textContent = 'Ascunde galeria';
  btn.setAttribute('aria-expanded', 'true');

  const icon = btn.querySelector('i');
  icon.classList.remove('fa-images');
  icon.classList.add('fa-eye-slash');

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hide() {
  section.setAttribute('hidden', '');
  btn.querySelector('.label').textContent = 'Vezi galeria';
  btn.setAttribute('aria-expanded', 'false');

  const icon = btn.querySelector('i');
  icon.classList.remove('fa-eye-slash');
  icon.classList.add('fa-images');
}

btn?.addEventListener('click', async () => {
  const isHidden = section.hasAttribute('hidden');

  if (isHidden) {
    if (!galleryLoaded) {
      try {
        await import('./gallery.js');   // lazy-load the gallery only once
        galleryLoaded = true;
      } catch (err) {
        console.error('Eroare la încărcarea galeriei:', err);
      }
    }
    show();
  } else {
    hide();
  }
});
