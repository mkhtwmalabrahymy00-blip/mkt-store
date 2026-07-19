// =========================================================
// لوحة تحكم MKT Store — تسجيل الدخول وإدارة المنتجات
// =========================================================

const loginWrap = document.getElementById("loginWrap");
const adminWrap = document.getElementById("adminWrap");

auth.onAuthStateChanged(user=>{
  if(user){
    loginWrap.classList.add("hidden");
    adminWrap.classList.remove("hidden");
    listenAdminProducts();
  }else{
    loginWrap.classList.remove("hidden");
    adminWrap.classList.add("hidden");
  }
});

document.getElementById("loginBtn").addEventListener("click", ()=>{
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;
  const errEl = document.getElementById("loginError");
  errEl.textContent = "";
  auth.signInWithEmailAndPassword(email, pass).catch(err=>{
    errEl.textContent = "بيانات الدخول غير صحيحة";
  });
});

document.getElementById("logoutBtn").addEventListener("click", ()=>{
  auth.signOut();
});

// ---------- نموذج إضافة / تعديل منتج ----------
const form = document.getElementById("productForm");
const formTitle = document.getElementById("formTitle");
let editingId = null;

document.getElementById("openAddFormBtn").addEventListener("click", ()=>{
  editingId = null;
  clearForm();
  formTitle.textContent = "إضافة منتج جديد";
  document.getElementById("formPanel").classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
});
document.getElementById("cancelFormBtn").addEventListener("click", ()=>{
  document.getElementById("formPanel").classList.add("hidden");
});

document.getElementById("saveProductBtn").addEventListener("click", async ()=>{
  const name = document.getElementById("pName").value.trim();
  const price = parseFloat(document.getElementById("pPrice").value);
  const category = document.getElementById("pCategory").value.trim() || "عام";
  const image = document.getElementById("pImage").value.trim();
  const description = document.getElementById("pDesc").value.trim();
  const badge = document.getElementById("pBadge").value.trim();

  if(!name || !price){
    adminToast("اكتب اسم المنتج والسعر على الأقل");
    return;
  }

  const data = { name, price, category, image, description, badge };

  try{
    if(editingId){
      await db.collection("products").doc(editingId).update(data);
      adminToast("تم تحديث المنتج");
    }else{
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("products").add(data);
      adminToast("تمت إضافة المنتج");
    }
    form.reset();
    editingId = null;
    document.getElementById("formPanel").classList.add("hidden");
  }catch(err){
    adminToast("حدث خطأ، حاول مرة أخرى");
    console.error(err);
  }
});

// ---------- قائمة المنتجات في اللوحة ----------
function listenAdminProducts(){
  db.collection("products").orderBy("createdAt","desc").onSnapshot(snap=>{
    const list = document.getElementById("adminProductList");
    if(snap.empty){
      list.innerHTML = `<p class="empty-state">لا توجد منتجات بعد، اضغط "إضافة منتج"</p>`;
      return;
    }
    list.innerHTML = "";
    snap.forEach(doc=>{
      const p = doc.data();
      const row = document.createElement("div");
      row.className = "product-row";
      row.innerHTML = `
        <img src="${p.image || 'icons/placeholder.png'}">
        <div class="info">
          <div class="t">${p.name}</div>
          <div class="p">${Number(p.price).toLocaleString("ar")} ج.س — ${p.category || ""}</div>
        </div>
        <div class="actions">
          <button class="btn-outline" data-edit="${doc.id}">تعديل</button>
          <button class="btn-danger" data-del="${doc.id}">حذف</button>
        </div>`;
      list.appendChild(row);
    });

    list.querySelectorAll("[data-edit]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        const doc = await db.collection("products").doc(btn.dataset.edit).get();
        const p = doc.data();
        editingId = doc.id;
        document.getElementById("pName").value = p.name || "";
        document.getElementById("pPrice").value = p.price || "";
        document.getElementById("pCategory").value = p.category || "";
        document.getElementById("pImage").value = p.image || "";
        document.getElementById("pDesc").value = p.description || "";
        document.getElementById("pBadge").value = p.badge || "";
        formTitle.textContent = "تعديل المنتج";
        document.getElementById("formPanel").classList.remove("hidden");
        window.scrollTo({top:0, behavior:"smooth"});
      });
    });

    list.querySelectorAll("[data-del]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        if(!confirm("هل تريد حذف هذا المنتج؟")) return;
        await db.collection("products").doc(btn.dataset.del).delete();
        adminToast("تم حذف المنتج");
      });
    });
  });
}

let adminToastTimer = null;
function adminToast(msg){
  const el = document.getElementById("adminToastEl");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(adminToastTimer);
  adminToastTimer = setTimeout(()=> el.classList.remove("show"), 1800);
}
