// assets/js/shrink-header.js
const header = document.querySelector('header');
let ticking = false;

function onScroll() {
  const shrink = window.scrollY > 10;
  header.classList.toggle('shrink', shrink);

  // Ajustăm offset-ul paginii ca să corespundă înălțimii curente a header-ului
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const navH = parseInt(styles.getPropertyValue(shrink ? '--navH-shrink' : '--navH'));
  document.body.style.paddingTop = navH + 'px';
}

function rafScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', rafScroll, { passive: true });
// Setare inițială corectă (la top trebuie să fie „mare”)
onScroll();
