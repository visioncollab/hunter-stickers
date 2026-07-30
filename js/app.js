'use strict';

const CATEGORY_FOLDERS = {
  series: 'series-peliculas',
  pokemon: 'pokemon',
  pets: 'mascotas',
  marvel: 'marvel',
  dc: 'dc'
};
const PAINTS = ['paint-1','paint-2','paint-3','paint-4','paint-5','paint-6','paint-7','paint-8'];
const state = { catalog: null, products: [], category: 'all', selection: [] };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'
  })[char]);
}

function normalizeProduct(raw, index) {
  const code = String(raw.codigo || `GR-${String(index + 1).padStart(3, '0')}`).trim().toUpperCase();
  const level = code.startsWith('PR-') ? 'premium' : 'gratis';
  const category = raw.categoria || 'otros';
  const folder = CATEGORY_FOLDERS[category] || category;
  const image = `assets/productos/${level}/${folder}/${code}.png`;
  return {
    ...raw,
    codigo: code,
    nivel: level,
    categoria: category,
    tipo: raw.tipo || 'stickers-whatsapp',
    precio: level === 'premium' ? Number(raw.precio || 0) : 0,
    imagen: image,
    archivo: image,
    color: PAINTS[index % PAINTS.length]
  };
}

function formatPrice(value) {
  return `${state.catalog.configuracion.moneda}${Number(value || 0)}`;
}

function createProductCard(product) {
  const premium = product.nivel === 'premium';
  const action = premium
    ? `<button class="action buy select-product" data-code="${escapeHtml(product.codigo)}">Agregar</button>`
    : `<button class="action free free-product" data-code="${escapeHtml(product.codigo)}">DESCARGAR GRATIS</button>`;
  const watermark = premium
    ? `<span class="watermark">${escapeHtml(state.catalog.configuracion.marca_agua)}</span>`
    : '';
  return `<article class="product${premium ? ' premium-product' : ''}" data-category="${escapeHtml(product.categoria)}" data-code="${escapeHtml(product.codigo)}">
    <div class="visual ${escapeHtml(product.color)}${premium ? ' premium-preview' : ''}"${premium ? ' data-protected="true"' : ''}>
      ${watermark}
      <img class="product-image" src="${escapeHtml(product.imagen)}" alt="${premium ? 'Vista previa protegida' : 'Vista previa'} de ${escapeHtml(product.titulo)}" loading="lazy"${premium ? ' draggable="false"' : ''}>
    </div>
    <div class="product-info product-info-simple">
      <span class="product-code">${escapeHtml(product.codigo)}</span>
      <h3>${escapeHtml(product.titulo)}</h3>
      <div class="product-bottom${premium ? '' : ' product-bottom-free'}">
        ${premium ? `<b class="price">${escapeHtml(formatPrice(product.precio))}</b>` : ''}
        ${action}
      </div>
    </div>
  </article>`;
}

function renderProducts() {
  $('#freeProducts').innerHTML = state.products.filter(p => p.nivel === 'gratis').map(createProductCard).join('');
  $('#premiumProducts').innerHTML = state.products.filter(p => p.nivel === 'premium').map(createProductCard).join('');
  bindProductActions();
  filterProducts();
  restoreSelectionVisuals();
}

function bindProductActions() {
  $$('.free-product').forEach(button => button.addEventListener('click', () => openFreeProduct(button.dataset.code)));
  $$('.select-product').forEach(button => button.addEventListener('click', () => togglePremium(button.dataset.code)));
  $$('.premium-preview').forEach(preview => {
    preview.addEventListener('contextmenu', event => event.preventDefault());
    preview.addEventListener('dragstart', event => event.preventDefault());
    $$('img', preview).forEach(image => image.draggable = false);
  });
}

function getProduct(code) { return state.products.find(product => product.codigo === code); }

function filterProducts(source) {
  const desktopSearch = $('#search');
  const mobileSearch = $('#searchMobile');
  const activeSearch = source || mobileSearch || desktopSearch;
  const query = (activeSearch?.value || '').toLowerCase().trim();
  if (activeSearch === mobileSearch && desktopSearch) desktopSearch.value = mobileSearch.value;
  if (activeSearch === desktopSearch && mobileSearch) mobileSearch.value = desktopSearch.value;
  $$('.product').forEach(card => {
    const categoryOk = state.category === 'all' || card.dataset.category === state.category;
    const searchOk = !query || card.innerText.toLowerCase().includes(query);
    card.hidden = !(categoryOk && searchOk);
  });
}

function openWhatsApp(text) {
  window.open(`https://wa.me/${state.catalog.configuracion.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}

const modal = $('#selectionModal');
const modalContent = $('#modalContent');
function openModal() { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal() { modal.classList.remove('open'); document.body.style.overflow = ''; }

function openFreeProduct(code) {
  const product = getProduct(code);
  if (!product) return;
  modalContent.innerHTML = `<div class="free-thanks"><div class="free-icon">🎁</div><h3>¡Gracias por descargar!</h3><p><b>${escapeHtml(product.titulo)}</b><br><span class="product-code">${escapeHtml(product.codigo)}</span></p><p>Tu archivo gratuito se abrirá en una pestaña nueva.</p><button class="modal-button" id="downloadNow">Descargar ahora →</button></div>`;
  openModal();
  $('#downloadNow').onclick = () => {
    window.open(product.archivo, '_blank', 'noopener');
    closeModal();
  };
}

function storageKey() { return 'hunterPremiumSelectionV21'; }
function ttl() { return Number(state.catalog.configuracion.duracion_seleccion_premium_minutos || 120) * 60 * 1000; }
function readSelection() {
  try {
    const data = JSON.parse(sessionStorage.getItem(storageKey()) || 'null');
    if (!data || !Array.isArray(data.items) || Date.now() - data.updatedAt > ttl()) {
      sessionStorage.removeItem(storageKey());
      return [];
    }
    return data.items.filter(code => getProduct(code)?.nivel === 'premium');
  } catch { return []; }
}
function saveSelection() {
  if (state.selection.length) sessionStorage.setItem(storageKey(), JSON.stringify({items:state.selection,updatedAt:Date.now()}));
  else sessionStorage.removeItem(storageKey());
  renderSelectionBar();
  restoreSelectionVisuals();
}
function restoreSelectionVisuals() {
  $$('.select-product').forEach(button => {
    const selected = state.selection.includes(button.dataset.code);
    button.classList.toggle('added', selected);
    button.closest('.product')?.classList.toggle('selected', selected);
    button.textContent = selected ? 'Agregado ✓' : 'Agregar';
  });
}
function renderSelectionBar() {
  $('#selectionSummary').textContent = `${state.selection.length} producto${state.selection.length === 1 ? '' : 's'} premium`;
  $('#selectionBar').classList.toggle('show', state.selection.length > 0);
}
function togglePremium(code) {
  const index = state.selection.indexOf(code);
  if (index >= 0) state.selection.splice(index, 1); else state.selection.push(code);
  saveSelection();
}
function renderPremiumModal() {
  const selected = state.selection.map(getProduct).filter(Boolean);
  if (!selected.length) {
    modalContent.innerHTML = '<div class="empty-state">Todavía no agregaste productos premium.</div>';
    openModal(); return;
  }
  const total = selected.reduce((sum, product) => sum + Number(product.precio || 0), 0);
  const rows = selected.map(product => `<div class="selected-row"><div class="emoji">✨</div><div><b>${escapeHtml(product.titulo)}</b><small>Código ${escapeHtml(product.codigo)}</small></div><span class="row-price">${escapeHtml(formatPrice(product.precio))}</span><button class="remove-item" data-code="${escapeHtml(product.codigo)}" aria-label="Quitar">×</button></div>`).join('');
  modalContent.innerHTML = `<div class="selected-list">${rows}</div><div class="modal-section"><h3>💜 Paga con Yape</h3><p>Yapea el total y después abre WhatsApp. El mensaje incluirá los códigos de tu compra.</p><div class="qr-wrap"><img src="assets/yape-qr.jpg" alt="Código QR de Yape"></div><div class="payment-total"><span>Total</span><span>${escapeHtml(state.catalog.configuracion.moneda)}${total}</span></div><button class="modal-button pay" id="sendPayment">Ya pagué · Enviar captura</button><p class="tiny-note">Cuando se abra WhatsApp, adjunta la captura del pago.</p></div>`;
  $$('.remove-item', modalContent).forEach(button => button.onclick = () => {
    state.selection = state.selection.filter(code => code !== button.dataset.code);
    saveSelection(); renderPremiumModal();
  });
  $('#sendPayment').onclick = () => {
    const codes = selected.map(product => product.codigo).join(', ');
    openWhatsApp(`Hola Miguel, ya realicé el pago por Yape y adjuntaré la captura.\n\nCódigos: ${codes}\nTotal: ${state.catalog.configuracion.moneda}${total}\n\nPor favor, envíame los productos cuando confirmes el pago.`);
    state.selection = []; saveSelection(); closeModal();
  };
  openModal();
}

function initSlider() {
  const slides = $$('.slide'), dots = $$('.dot');
  if (!slides.length) return;
  let current = 0, timer;
  const show = index => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    clearInterval(timer); timer = setInterval(() => show(current + 1), 5000);
  };
  $('.next')?.addEventListener('click', () => show(current + 1));
  $('.prev')?.addEventListener('click', () => show(current - 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  show(0);
}

function bindUi() {
  $$('.chip').forEach(chip => chip.addEventListener('click', () => {
    $$('.chip').forEach(item => item.classList.remove('active'));
    chip.classList.add('active'); state.category = chip.dataset.category; filterProducts();
  }));
  $('#search')?.addEventListener('input', event => filterProducts(event.target));
  $('#searchMobile')?.addEventListener('input', event => filterProducts(event.target));
  $('#closeModal')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
  $('#openSelection')?.addEventListener('click', renderPremiumModal);
  $('#clearSelection')?.addEventListener('click', () => { state.selection = []; saveSelection(); });
}

async function initCatalog() {
  try {
    const response = await fetch('data/catalogo.json', {cache:'no-store'});
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
    state.catalog = await response.json();

    const files = Array.isArray(state.catalog.archivos) ? state.catalog.archivos : [];
    const groups = await Promise.all(files.map(async file => {
      const category = String(file).replace(/\.json$/i, '');
      const categoryResponse = await fetch(`data/categorias/${file}`, {cache:'no-store'});
      if (!categoryResponse.ok) throw new Error(`${file}: HTTP ${categoryResponse.status}`);
      const products = await categoryResponse.json();
      if (!Array.isArray(products)) throw new Error(`${file} debe contener una lista de productos`);
      return products.map(product => ({...product, categoria: category}));
    }));

    state.products = groups.flat().map(normalizeProduct);
    renderProducts();
    state.selection = readSelection();
    saveSelection();
  } catch (error) {
    const message = `<div class="empty-state"><b>No se pudo cargar el catálogo.</b><br>Abre el proyecto con Live Server o desde un hosting.<br><small>${escapeHtml(error.message)}</small></div>`;
    $('#freeProducts').innerHTML = message; $('#premiumProducts').innerHTML = message;
  }
}

initSlider();
bindUi();
initCatalog();
