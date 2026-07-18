// =========================================================
// MKT Store — منطق المتجر
// =========================================================

let ALL_PRODUCTS = [];
let ACTIVE_CATEGORY = "الكل";
let CART = JSON.parse(localStorage.getItem("mkt_cart") || "[]");

const grid = document.getElementById("grid");
const catsWrap = document.getElementById("cats");
const cartCountEl = document.getElementById("cartCount");

function saveCart(){
  localStorage.setItem("mkt_cart", JSON.stringify(CART));
  renderCartCount();
}
function renderCartCount(){
  const total = CART.reduce((s,i)=>s+i.qty,0);
  cartCountEl.textContent = total;
  cartCountEl.style.display = total > 0 ? "flex" : "none";
}

function fmtPrice(n){
  return Number(n).toLocaleString("ar") + " ج.س";
}

// ---------- تحميل المنتجات من Firestore ----------
function listenProducts(){
  db.collection("products").orderBy("createdAt","desc").onSnapshot(snap=>{
    ALL_PRODUCTS = [];
    snap.forEach(doc=> ALL_PRODUCTS.push({ id: doc.id, ...doc.data() }));
    buildCategories();
    renderGrid();
  }, err=>{
    grid.innerHTML = `<div class="empty-state">تعذر تحميل المنتجات، تحقق من الاتصال بالإنترنت</div>`;
    console.error(err);
  });
}

function buildCategories(){
  const cats = ["الكل", ...new Set(ALL_PRODUCTS.map(p=>p.category).filter(Boolean))];
  catsWrap.innerHTML = cats.map(c=>
    `<button class="chip ${c===ACTIVE_CATEGORY?'active':''}" data-cat="${c}">${c}</button>`
  ).join("");
  catsWrap.querySelectorAll(".chip").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      ACTIVE_CATEGORY = btn.dataset.cat;
      buildCategories();
      renderGrid();
    });
  });
}

function renderGrid(){
  const items = ACTIVE_CATEGORY === "الكل"
    ? ALL_PRODUCTS
    : ALL_PRODUCTS.filter(p=>p.category === ACTIVE_CATEGORY);

  if(items.length === 0){
    grid.innerHTML = `<div class="empty-state">لا توجد منتجات في هذا القسم بعد</div>`;
    return;
  }

  grid.innerHTML = items.map(p=>`
    <div class="card" data-id="${p.id}">
      ${p.badge ? `<div class="badge">${p.badge}</div>` : ""}
      <img class="thumb" src="${p.image || 'icons/placeholder.png'}" alt="${p.name}">
      <div class="body">
        <p class="title">${p.name}</p>
        <p class="price">${fmtPrice(p.price)}</p>
        <button class="add-btn" data-add="${p.id}">أضف للسلة</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".card").forEach(card=>{
    card.addEventListener("click", (e)=>{
      if(e.target.dataset.add) return;
      openSheet(card.dataset.id);
    });
  });
  grid.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      addToCart(btn.dataset.add, 1);
      toast("تمت الإضافة للسلة");
    });
  });
}

// ---------- بطاقة المنتج ----------
const overlay = document.getElementById("productOverlay");
let currentProduct = null;
let currentQty = 1;

function openSheet(id){
  currentProduct = ALL_PRODUCTS.find(p=>p.id === id);
  if(!currentProduct) return;
  currentQty = 1;
  document.getElementById("sheetImg").src = currentProduct.image || 'icons/placeholder.png';
  document.getElementById("sheetTitle").textContent = currentProduct.name;
  document.getElementById("sheetPrice").textContent = fmtPrice(currentProduct.price);
  document.getElementById("sheetDesc").textContent = currentProduct.description || "";
  document.getElementById("qtyVal").textContent = currentQty;
  overlay.classList.add("open");
}
function closeSheet(){ overlay.classList.remove("open"); }

document.getElementById("qtyMinus").addEventListener("click", ()=>{
  currentQty = Math.max(1, currentQty - 1);
  document.getElementById("qtyVal").textContent = currentQty;
});
document.getElementById("qtyPlus").addEventListener("click", ()=>{
  currentQty += 1;
  document.getElementById("qtyVal").textContent = currentQty;
});
document.getElementById("sheetAddBtn").addEventListener("click", ()=>{
  addToCart(currentProduct.id, currentQty);
  closeSheet();
  toast("تمت الإضافة للسلة");
});
document.querySelectorAll("[data-close-overlay]").forEach(el=>{
  el.addEventListener("click", (e)=>{
    if(e.target === el) el.classList.remove("open");
  });
});

function addToCart(id, qty){
  const existing = CART.find(i=>i.id === id);
  if(existing) existing.qty += qty;
  else CART.push({ id, qty });
  saveCart();
}

// ---------- سلة المشتريات ----------
const cartOverlay = document.getElementById("cartOverlay");
document.getElementById("cartBtn").addEventListener("click", ()=>{
  renderCart();
  cartOverlay.classList.add("open");
});

function renderCart(){
  const wrap = document.getElementById("cartItems");
  if(CART.length === 0){
    wrap.innerHTML = `<p class="empty-state">سلتك فارغة</p>`;
    document.getElementById("cartTotalVal").textContent = fmtPrice(0);
    return;
  }
  let total = 0;
  wrap.innerHTML = CART.map(item=>{
    const p = ALL_PRODUCTS.find(x=>x.id === item.id);
    if(!p) return "";
    total += p.price * item.qty;
    return `
      <div class="cart-line">
        <img src="${p.image || 'icons/placeholder.png'}">
        <div class="info">
          <div class="t">${p.name}</div>
          <div class="p">${fmtPrice(p.price)} × ${item.qty}</div>
        </div>
        <button class="remove" data-remove="${item.id}">حذف</button>
      </div>`;
  }).join("");
  document.getElementById("cartTotalVal").textContent = fmtPrice(total);

  wrap.querySelectorAll("[data-remove]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      CART = CART.filter(i=>i.id !== btn.dataset.remove);
      saveCart();
      renderCart();
    });
  });
}

document.getElementById("checkoutBtn").addEventListener("click", ()=>{
  if(CART.length === 0) return;
  let lines = ["طلب جديد من متجر MKT:", ""];
  let total = 0;
  CART.forEach(item=>{
    const p = ALL_PRODUCTS.find(x=>x.id === item.id);
    if(!p) return;
    total += p.price * item.qty;
    lines.push(`- ${p.name} × ${item.qty} = ${fmtPrice(p.price * item.qty)}`);
  });
  lines.push("", `الإجمالي: ${fmtPrice(total)}`);
  const msg = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
});

// ---------- Toast ----------
let toastTimer = null;
function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.classList.remove("show"), 1800);
}

// ---------- تشغيل ----------
renderCartCount();
listenProducts();

if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  });
}
