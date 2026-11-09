const produk = [
  { nama: 'Cilok',      harga: 6000,  img: 'assets/img/images_(4).jpg.jpeg' },
  { nama: 'Sempol',     harga: 6000,  img: 'assets/img/images_(3).jpg.jpeg' },
  { nama: 'Tahu Krispi',harga: 6000,  img: 'assets/img/images_(1).jpg.jpeg' },
  { nama: 'Risol',      harga: 3000,  img: 'assets/img/images_(2).jpg.jpeg' },
  { nama: 'Martabak',   harga: 3000,  img: 'assets/img/images_(5).jpg.jpeg' },
  { nama: 'Mie Ayam',   harga: 8000,  img: 'assets/img/images_(6).jpg.jpeg' },
  { nama: 'Donat',      harga: 3000,  img: 'assets/img/images_(7).jpg.jpeg' },
  { nama: 'Rice Bowl',  harga: 12000, img: 'assets/img/images_(8).jpg.jpeg' },
];

const BATAS = 8;
let tampilSemua = false;

const grid = document.getElementById('grid');
const cari = document.getElementById('search');
const empty = document.getElementById('empty');
const btnMore = document.getElementById('showMore');
const txtMore = document.getElementById('showMoreText');

const rupiah = n => n.toLocaleString('id-ID');

function render() {
  const q = cari.value.trim().toLowerCase();
  let list = produk.filter(p => p.nama.toLowerCase().includes(q));
  const bisaMore = !q && produk.length > BATAS;
  if (bisaMore && !tampilSemua) list = list.slice(0, BATAS);

  grid.innerHTML = list.map(p => `
    <article class="card">
      <img src="${encodeURI(p.img)}" alt="${p.nama}">
      <h3>${p.nama}</h3>
      <div class="price"><small>Rp.</small><b>${rupiah(p.harga)}</b></div>
    </article>`).join('');

  empty.hidden = list.length > 0;
}

cari.addEventListener('input', render);
btnMore.addEventListener('click', () => { tampilSemua = !tampilSemua; render(); });
render();

const navbar = document.getElementById('navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => menu.classList.toggle('open'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
