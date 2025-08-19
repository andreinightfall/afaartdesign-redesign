
// assets/js/cart.js
(function(){
  const STORAGE_KEY = 'afa_cart_v1';

  const state = {
    items: [] // [{id, name, price, qty, thumb}]
  };

  // ---- Storage ----
  function load(){
    try { state.items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch(e){ state.items = []; }
    renderBadge();
  }
  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    renderBadge();
  }

  // ---- Utils ----
  function money(n){ return (Math.round(n*100)/100).toFixed(2); }
  function findIndex(id){ return state.items.findIndex(i => i.id === id); }

  // ---- Public API (window.Cart) ----
  window.Cart = {
    add(product, qty=1){
      const i = findIndex(product.id);
      if(i>-1){ state.items[i].qty += qty; }
      else { state.items.push({...product, qty}); }
      save();
    },
    remove(id){
      const i = findIndex(id);
      if(i>-1){ state.items.splice(i,1); save(); }
    },
    setQty(id, qty){
      const i = findIndex(id);
      if(i>-1){
        state.items[i].qty = Math.max(1, qty|0);
        save();
      }
    },
    clear(){ state.items = []; save(); },
    items(){ return [...state.items]; },
    total(){ return state.items.reduce((s,i)=> s + i.price*i.qty, 0); },
  };

  // ---- UI: badge + mini drawer (optional) ----
  function renderBadge(){
    const badge = document.querySelector('[data-cart-count]');
    if(!badge) return;
    const count = state.items.reduce((s,i)=>s+i.qty,0);
    badge.textContent = count;
    badge.hidden = count === 0;
  }

  // Listen "Add to cart" buttons with [data-add-to-cart]
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart]');
    if(!btn) return;
    const el = btn.closest('[data-product]') || btn;
    const id    = el.dataset.id;
    const name  = el.dataset.name || btn.getAttribute('aria-label') || 'Produs';
    const price = parseFloat(el.dataset.price || '0');
    const thumb = el.dataset.thumb || '';
    window.Cart.add({id, name, price, thumb}, 1);
    btn.classList.add('added');
    setTimeout(()=>btn.classList.remove('added'), 800);
  });

  // Expose a helper to render an order summary into a tbody/list
  window.CartUI = {
    mount(selector){
      const root = document.querySelector(selector);
      if(!root) return;
      const items = window.Cart.items();
      const rows = items.map(i => `
        <tr>
          <td>${i.name}</td>
          <td style="text-align:center">
            <input type="number" min="1" value="${i.qty}" data-qty="${i.id}" style="width:64px">
          </td>
          <td style="text-align:right">${money(i.price)} RON</td>
          <td style="text-align:right">${money(i.price*i.qty)} RON</td>
          <td><button type="button" data-remove="${i.id}">×</button></td>
        </tr>`).join('');
      root.innerHTML = rows || `<tr><td colspan="5">Coșul este gol.</td></tr>`;

      // totals
      const totalEl = document.querySelector('[data-cart-total]');
      if(totalEl) totalEl.textContent = money(window.Cart.total()) + ' RON';
    }
  };

  // Delegation for qty/remove in summaries
  document.addEventListener('input', (e)=>{
    const id = e.target.getAttribute('data-qty');
    if(!id) return;
    window.Cart.setQty(id, parseInt(e.target.value||'1',10));
    window.CartUI.mount('[data-order-items]');
  });
  document.addEventListener('click', (e)=>{
    const id = e.target.getAttribute('data-remove');
    if(!id) return;
    window.Cart.remove(id);
    window.CartUI.mount('[data-order-items]');
  });

  // initial
  load();
})();
