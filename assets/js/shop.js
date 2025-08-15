// assets/js/shop.js
// Montează grila de produse + filtre și mini-coșul dropdown.
// Folosește EXCLUSIV window.Cart din cart.js (nu redefinim Cart).

// --- Catalog ---
export const PRODUCTS = [
  { id:'statuario-len-grey',   name:'Statuario Len Grey',   price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/statuario len grey tile.png' },
  { id:'angelo-oro',           name:'Angelo Oro',           price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/angelo oro tile.png' },
  { id:'aspire-gold',          name:'Aspire Gold',          price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/aspire gold tile.png' },
  { id:'calota-gold',          name:'Calota Gold',          price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/calota gold tile.png' },
  { id:'capitol',              name:'Capitol',              price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/capitol tile.png' },
  { id:'carrara-sky',          name:'Carrara Sky',          price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/carrara sky tile.png' },
  { id:'cr-arrezo-white',      name:'CR Arrezo White',      price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/cr arrezo white tile.png' },
  { id:'cr-gold-flaks',        name:'CR Gold Flaks',        price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/cr gold flaks tile.png' },
  { id:'cr-smoge-aqua',        name:'CR Smoge Aqua',        price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/cr smoge aqua tile.png' },
  { id:'destiny',              name:'Destiny',              price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/destiny tile.png' },
  { id:'deston-gold',          name:'Deston Gold',          price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/deston gold tile.png' },
  { id:'emi-white',            name:'Emi White',            price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/emi white tile.png' },
  { id:'florina-bianco',       name:'Florina Bianco',       price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/florina bianco tile.png' },
  { id:'gold-river',           name:'Gold River',           price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/gold river tile.png' },
  { id:'golden-filip',         name:'Golden Filip',         price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/golden filip tile.png' },
  { id:'mirror-black',         name:'Mirror Black',         price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/mirror black tile.png' },
  { id:'moro-black',           name:'Moro Black',           price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/moro black tile.png' },
  { id:'new-aqua',             name:'New Aqua',             price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/new aqua tile.png' },
  { id:'nuvola',               name:'Nuvola',               price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/nuvola tile.png' },
  { id:'plazzo',               name:'Plazzo',               price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/plazzo tile.png' },
  { id:'sky-onyx',             name:'Sky Onyx',             price:79.99, cat:'placi', thumb:'assets/img/dunca/tiles/sky onyx tile.png' }
];

// --- Utils / DOM refs ---
const grid = document.getElementById('grid');
const q    = document.getElementById('q');
const cat  = document.getElementById('cat');
const sort = document.getElementById('sort');

const money = (n) => (Math.round(n*100)/100).toFixed(2) + ' RON';

// --- Render grilă produse ---
function renderProducts(list){
  if(!grid) return;
  grid.innerHTML = list.map(p => `
    <article class="shop-card"
      data-product
      data-id="${p.id}"
      data-name="${p.name}"
      data-price="${p.price}"
      data-thumb="${p.thumb}"
      data-cat="${p.cat}">
      <img class="thumb" src="${p.thumb}" alt="${p.name}" loading="lazy">
      <div class="meta">
        <strong>${p.name}</strong>
        <span class="price">${money(p.price)}</span>
      </div>
      <button class="btn ghost magnetic-green" data-add-to-cart aria-label="Adaugă ${p.name} în coș">
        🛒 Adaugă în coș
      </button>
    </article>
  `).join('');
}

// --- Filtre/sort ---
function applyFilters(){
  const text = (q?.value || '').trim().toLowerCase();
  const c = cat?.value || '';
  let list = PRODUCTS.filter(p =>
    (!c || p.cat === c) &&
    (!text || p.name.toLowerCase().includes(text) || p.id.toLowerCase().includes(text))
  );
  switch (sort?.value){
    case 'price-asc':  list.sort((a,b)=>a.price-b.price); break;
    case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
    case 'name-asc':   list.sort((a,b)=>a.name.localeCompare(b.name)); break;
    default: break;
  }
  renderProducts(list);
}

[q, cat, sort].forEach(el => el?.addEventListener('input', applyFilters));
document.getElementById('toCheckout')?.addEventListener('click', ()=> location.href='checkout.html');

// --- Mini-cart dropdown (folosește window.Cart din cart.js) ---
(function miniCartMount(){
  if (!window.Cart) {
    console.warn('Cart API missing. Include assets/js/cart.js înainte de shop.js');
    return;
  }

  const root    = document.getElementById('miniCart');
  if(!root) return;
  const elCount = root.querySelector('[data-cart-count]');
  const elItems = root.querySelector('[data-cart-items]');
  const elEmpty = root.querySelector('[data-cart-empty]');
  const elTotal = root.querySelector('[data-cart-total]');
  const btnCart = root.querySelector('.cart-btn');

  const fmt = (n) => new Intl.NumberFormat('ro-RO',{minimumFractionDigits:2, maximumFractionDigits:2}).format(n) + ' RON';

  function renderMini(){
    const items = window.Cart.items(); // [{id,name,price,qty,thumb}]
    const count = items.reduce((s,i)=>s+i.qty,0);
    if (elCount){ elCount.textContent = count; elCount.hidden = count===0; }

    if (!items.length){
      if(elItems) elItems.innerHTML = '';
      if(elEmpty) elEmpty.hidden = false;
      if(elTotal) elTotal.textContent = fmt(0);
      return;
    }
    if(elEmpty) elEmpty.hidden = true;

    let total = 0;
    if(elItems){
      elItems.innerHTML = items.map(i => {
        total += i.price * i.qty;
        const thumb = i.thumb || '';
        return `
          <div class="cart-item" data-id="${i.id}">
            <img class="thumb" src="${thumb}" alt="${i.name}">
            <div>
              <div class="name">${i.name}</div>
              <div class="price">${fmt(i.price)} × ${i.qty}</div>
            </div>
            <div class="controls">
              <button class="btn-qty" data-action="dec" aria-label="Scade">−</button>
              <div class="qty" aria-live="polite">${i.qty}</div>
              <button class="btn-qty" data-action="inc" aria-label="Crește">+</button>
              <button class="btn-del" data-action="del" aria-label="Șterge">✕</button>
            </div>
          </div>`;
      }).join('');
    }
    if(elTotal) elTotal.textContent = fmt(total);
  }

  // + / − / ✕
  elItems?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const row = btn.closest('.cart-item');
    const id  = row?.getAttribute('data-id');
    if(!id) return;
    const action = btn.getAttribute('data-action');
    const item = window.Cart.items().find(x=>x.id===id);
    if(!item) return;
    if(action==='inc') window.Cart.setQty(id, item.qty+1);
    if(action==='dec') window.Cart.setQty(id, item.qty-1);
    if(action==='del') window.Cart.remove(id);
    renderMini();
  });

  // Deschidere/închidere dropdown + hover "lipicios"
  const open  = ()=> root.classList.add('open');
  const close = ()=> root.classList.remove('open');

  let hideTo = null;
  const addHover = ()=> root.classList.add('is-hover');
  const remHover = ()=> root.classList.remove('is-hover');
  const scheduleClose = ()=>{
    clearTimeout(hideTo);
    hideTo = setTimeout(()=>{
      if (!root.matches(':hover') && !root.classList.contains('open')) remHover();
    }, 180); // mică întârziere ca să nu dispară instant
  };

  // click pe buton -> toggle open persistent
  btnCart?.addEventListener('click', (e)=>{
    e.preventDefault();
    if (root.classList.contains('open')) { close(); }
    else { open(); addHover(); }
  });

  // hover intent pe întregul miniCart
  root.addEventListener('mouseenter', ()=>{ clearTimeout(hideTo); addHover(); });
  root.addEventListener('mouseleave', scheduleClose);

  // click în afară -> închide
  document.addEventListener('click', (e)=>{
    if(!root.contains(e.target)){ close(); remHover(); }
  });
  // Escape -> închide
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){ close(); remHover(); }
  });

  // După „Adaugă în coș” (gestionat în cart.js), doar rerender — fără deschidere automată
  document.addEventListener('click', (e)=>{
    if (e.target.closest('[data-add-to-cart]')) {
      setTimeout(()=>{ renderMini(); }, 0);
    }
  });

  // Sync dacă se schimbă storage din alt tab
  window.addEventListener('storage', (e)=>{ if((e.key||'').includes('afa_cart_v1')) renderMini(); });

  // Init
  renderMini();
})();

// --- Init grilă ---
applyFilters();
