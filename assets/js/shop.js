
// assets/js/shop.js
// Montează o listă simplă de produse + filtre. Se bazează pe window.Cart din cart.js

const PRODUCTS = [
  { id:'calota-gold-60x120',   name:'Calota Gold • 60×120',   price:69.00,  cat:'placi',   thumb:'assets/img/promo-calotagold.jpg' },
  { id:'emi-white-60x120',     name:'Emi White • 60×120',     price:75.00,  cat:'placi',   thumb:'assets/img/promo-emiwhite.jpg' },
  { id:'plazzo-60x120',        name:'Plazzo • 60×120',        price:75.00,  cat:'placi',   thumb:'assets/img/promo-plazzo.jpeg' },
  { id:'moro-black-60x120',    name:'Moro Black • 60×120',    price:75.00,  cat:'placi',   thumb:'assets/img/promo-moroblack.jpg' },
  { id:'aspire-gold-60x120',   name:'Aspire Gold • 60×120',   price:79.99,  cat:'placi',   thumb:'assets/img/promo-aspiregold.jpg' },
  { id:'brazil-60x120',        name:'Brazil 1 • 60.5×121',    price:79.99,  cat:'placi',   thumb:'assets/img/promo-brazil.jpeg' },
  // exemple extra (poți înlocui cu catalogul real)
  { id:'ferrara-pietra',       name:'Ferrara • Pietra Spaccata', price:135.00, cat:'vopsea', thumb:'assets/img/promo-ferrara.jpg' },
  { id:'plinta-70mm',          name:'Plintă albă 70mm',        price:17.50,  cat:'parchet', thumb:'assets/img/promo-plinta.jpg' },
  { id:'riflaj-nuc',           name:'Riflaj nuc 2800×150',     price:110.00, cat:'riflaje', thumb:'assets/img/promo-riflaj.jpg' }
];

const grid = document.getElementById('grid');
const q    = document.getElementById('q');
const cat  = document.getElementById('cat');
const sort = document.getElementById('sort');

function money(n){ return (Math.round(n*100)/100).toFixed(2) + ' RON'; }

function render(list){
  grid.innerHTML = list.map(p => `
    <article class="shop-card" data-product data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-thumb="${p.thumb}" data-cat="${p.cat}">
      <img class="thumb" src="${p.thumb}" alt="${p.name}" loading="lazy">
      <div class="meta">
        <strong>${p.name}</strong>
        <span class="price">${money(p.price)}</span>
      </div>
      <button class="btn" data-add-to-cart aria-label="Adaugă ${p.name} în coș">Adaugă în coș</button>
    </article>
  `).join('');
}

function applyFilters(){
  const text = (q.value || '').trim().toLowerCase();
  const c = cat.value;
  let list = PRODUCTS.filter(p =>
    (!c || p.cat === c) &&
    (!text || p.name.toLowerCase().includes(text) || p.id.toLowerCase().includes(text))
  );
  switch (sort.value){
    case 'price-asc':  list = list.sort((a,b)=>a.price-b.price); break;
    case 'price-desc': list = list.sort((a,b)=>b.price-a.price); break;
    case 'name-asc':   list = list.sort((a,b)=>a.name.localeCompare(b.name)); break;
    default: break;
  }
  render(list);
}

[q, cat, sort].forEach(el => el.addEventListener('input', applyFilters));
document.getElementById('toCheckout')?.addEventListener('click', ()=> location.href='checkout.html');

// initial
applyFilters();
