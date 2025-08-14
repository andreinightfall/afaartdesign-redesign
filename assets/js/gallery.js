// gallery.js — montează grid + pornește PhotoSwipe
import PhotoSwipeLightbox from 'https://unpkg.com/photoswipe@5/dist/photoswipe-lightbox.esm.min.js';

const targetId = window.__AFA_GALLERY_TARGET || 'legacy-gallery';
const galleryEl = document.getElementById(targetId);

// Folderele tale
const fullImageFolder = "assets/img/galerie/";
const thumbImageFolder = "assets/img/thumbnails/";

// Lista ta de fișiere (exact cum mi-ai trimis-o)
const imageList = [
  "0f0de454-51c0-4bf7-8e1b-79abb0af08f2.jpg",
  "21d645e9-c76e-454e-a1e3-34f60ebf4329.jpg",
  "22287dd3-0734-42d1-b022-362ad3fc41c4.jpg",
  "31bf27c4-d265-4f56-8f54-4bdc9860ae91.jpg",
  "32de0ad6-6c20-459d-9e0b-0de26cbad468.jpg",
  "396dd42f-8ec3-4c58-9de2-310fa9881d1f.jpg",
  "3a95a284-4e29-4b0c-a198-0dd21d5e0593.jpg",
  "3e987510-c80e-4259-ac47-f47ead375a42.jpg",
  "4cffb62a-bd1a-4016-8aca-0250ed99ea47.jpg",
  "504214272_724325440105097_4955328492212845030_n.jpg",
  "504256408_716292517575056_4527213827026571306_n.jpg",
  "505809108_724325276771780_2536419870564194838_n.jpg",
  "515189235_738376738699967_5523570887237780809_n.jpg",
  "515500942_738376698699971_8292067497608670770_n.jpg",
  "516289523_747386397799001_2292952746297195156_n.jpg",
  "516743731_747386284465679_1339663573883823589_n.jpg",
  "517377472_747384357799205_1654736684949303167_n.jpg",
  "517516398_747386594465648_2035087340886964652_n.jpg",
  "518068642_747386634465644_4595385723477006469_n.jpg",
  "518099547_747386407799000_4240808290350595979_n.jpg",
  "518240074_747386537798987_7408601734042439261_n.jpg",
  "518303153_747386494465658_2132784937786956987_n.jpg",
  "519423619_747386454465662_4732287931397836291_n.jpg",
  "519611148_747386247799016_5641908371186465589_n.jpg",
  "53896133-0130-4364-9d36-8597f3bc770f.jpg",
  "5866dfbe-9c44-4536-ae85-17051ece926c.jpg",
  "5bcb4bec-df89-42b7-aee2-cf694d4c09f5.jpg",
  "60851521-eda5-4cbd-ba85-65e2f3cb3de6.jpg",
  "62710dfc-b8d1-490d-a5b6-fa9548aca73a.jpg",
  "6f7c12ca-bb62-436f-a246-47e0aedf8581.jpg",
  "6ff938fa-f18f-4b5e-8001-9cb5f468880e.jpg",
  "7b1495d4-12e7-4e42-a0ba-fe4900c78c5f.jpg",
  "96405dcd-1003-4e4c-be24-6010fc7bdd5c.jpg",
  "997ac222-fc3f-40b3-9d75-20e1f0b7635f.jpg",
  "ae278f56-381b-4e3d-95c0-5079f02f3d0c.jpg",
  "af4d9457-bacc-462d-81f6-cc1f1fc8bca0.jpg",
  "afa6fa0b-5369-455d-91c2-498e185a6f7c.jpg",
  "b60d99ea-3c3c-4c00-b755-f46722d9847e.jpg",
  "bf1cdf62-8fd5-4ac6-b3e8-818a0eda21e4.jpg",
  "c28a299c-6319-4b34-b2cf-318d89543770.jpg",
  "cb26c23d-9f1a-42ef-9c40-2e9e68f014c3.jpg",
  "d1c77b7d-5301-4324-acb6-edf8b76004e3.jpg",
  "d65f148c-c8c6-4b22-9911-12aaf9254cd4.jpg",
  "dd51a633-b763-4ddd-a90e-7bf34215493b.jpg",
  "e1a8e7a4-aa13-4407-93d0-5a75907e81a2.jpg",
  "f3a4f120-cfc6-41b3-a9be-15d2002effd3.jpg",
  "f6d22c0f-d077-48c0-834c-a4eec1a011fb.jpg",
  "IMG-20231021-WA0012.jpg",
  "IMG-20231021-WA0015.jpg",
  "IMG-20231021-WA0016.jpg",
  "IMG-20231021-WA0019.jpg",
  "IMG-20231021-WA0020.jpg",
  "IMG-20231021-WA0021.jpg",
  "IMG-20231021-WA0022.jpg",
  "IMG-20231021-WA0025.jpg",
  "IMG_4156.jpg","IMG_4158.jpg","IMG_4159.jpg","IMG_4160.jpg","IMG_4161.jpg","IMG_4162.jpg",
  "IMG_4318.jpg","IMG_4360.jpg","IMG_4361.jpg","IMG_4362.jpg","IMG_4363.jpg","IMG_4364.jpg",
  "IMG_4514.jpg","IMG_4515.jpg","IMG_7211.jpg","IMG_7224.jpg","IMG_7238.jpg","IMG_7241.jpg",
  "IMG_7344.jpg","IMG_7348.jpg","IMG_7485.jpg","IMG_7490.jpg","IMG_7552.jpg","IMG_7554.jpg",
  "IMG_7555.jpg","IMG_7571.jpg","IMG_7576.jpg","IMG_7634.jpg","IMG_7635.jpg","IMG_7642.jpg",
  "IMG_7647.jpg","IMG_7690.jpg","IMG_7722.jpg","IMG_7723.jpg","IMG_7724.jpg","IMG_7725.jpg",
  "IMG_7738.jpg","IMG_7739.jpg","IMG_7747.jpg","IMG_7749.jpg","IMG_7755.jpg","IMG_7844.jpg",
  "IMG_7846.jpg","IMG_7862.jpg","IMG_7875.jpg","IMG_7878.jpg","IMG_7890.jpg","IMG_7991.jpg",
  "IMG_8070.jpg","IMG_8071.jpg","IMG_8072.jpg","IMG_8073.jpg","IMG_8076.jpg","IMG_8077.jpg",
  "IMG_8078.jpg","IMG_8079.jpg","IMG_8080.jpg","IMG_8416.jpg","IMG_8417.jpg","IMG_8418.jpg",
  "IMG_8420.jpg","IMG_8422.jpg","IMG_8423.jpg","IMG_8424.jpg","IMG_8426.jpg","IMG_8581.jpg",
  "IMG_8582.jpg","IMG_8583.jpg","IMG_8584.jpg","IMG_8585.jpg","IMG_8587.jpg"
];

// 1) Încărcăm manifestul cu dimensiuni (generat de Sharp)
let manifest = {};
try {
  const res = await fetch('assets/img/manifest.json', { cache: 'no-store' });
  if (res.ok) manifest = await res.json();
} catch (e) {
  console.warn('Fără manifest.json – lightbox va calcula dimensiunile în zbor.');
}

const frag = document.createDocumentFragment();

for (const name of imageList) {
  const fullURL = fullImageFolder + name;
  // thumbs sunt .jpg; dacă originalul e .png/.webp le mapăm la .jpg
  const thumbURL = thumbImageFolder + name.replace(/\.(jpe?g|png|webp)$/i, '.jpg');

  const a = document.createElement('a');
  a.href = fullURL;
  a.setAttribute('data-pswp-src', fullURL);

  const meta = manifest[name];
  if (meta?.width && meta?.height) {
    a.setAttribute('data-pswp-width', meta.width);
    a.setAttribute('data-pswp-height', meta.height);
  }

  const img = document.createElement('img');
  img.src = thumbURL;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = ''; // dacă vrei descrieri, pune aici

  a.appendChild(img);
  frag.appendChild(a);
}

if (galleryEl) galleryEl.appendChild(frag);

// 2) Pornește PhotoSwipe
const lightbox = new PhotoSwipeLightbox({
  gallery: '#' + targetId,
  children: 'a',
  // import ESM la nevoie
  pswpModule: () => import('https://unpkg.com/photoswipe@5/dist/photoswipe.esm.min.js')
});
lightbox.init();
