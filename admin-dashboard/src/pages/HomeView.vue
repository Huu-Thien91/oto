<template>
  <UserLayout>
    <section class="ad card">
      <div class="ad-left">
        <div class="ad-tag">🔥 Deal hot</div>
        <h1>
          Săn xe đẹp – giá tốt
          <span class="grad">trong 60 giây</span>.
        </h1>
        <p class="muted">
          Tìm theo hãng, giá, năm. Xem nhanh chi tiết. Sẵn sàng tích hợp AI tư vấn chọn xe theo ngân sách & nhu cầu.
        </p>
        <div class="ad-actions">
          <button class="btn primary" @click="scrollToList">Khám phá xe</button>
          <button class="btn" @click="resetFilters">Xóa bộ lọc</button>
        </div>
        <div class="ad-badges">
          <span class="chip">✅ Phân trang 8 xe</span>
          <span class="chip">⚡ UI mượt</span>
          <span class="chip">🧠 AI-ready</span>
        </div>
      </div>

      <div class="ad-right">
        <div class="ad-card">
          <div class="shine"></div>
          <div class="ad-mini-title">Gợi ý nổi bật</div>
          <div class="ad-list" v-if="!loading && featured.length">
            <button class="ad-item" v-for="c in featured" :key="c.carId" @click="openQuick(c)">
              <img :src="c.ImageUrl || fallbackImg" @error="imgFallback" />
              <div class="meta">
                <div class="name line1">{{ c.Name }}</div>
                <div class="sub muted line1">{{ c.Brand || '—' }} • {{ formatMoney(c.Price) }}</div>
              </div>
              <span class="go">→</span>
            </button>
          </div>
          <div v-else class="ad-skel">
            <div class="sk-row" v-for="i in 4" :key="i"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="filters card" ref="listRef">
      <div class="filters-grid">
        <div class="field">
          <label>Từ khóa</label>
          <input v-model.trim="q" placeholder="Tên xe / hãng / model / màu..." @keyup.enter="applyFilters" />
        </div>

        <div class="field">
          <label>Hãng</label>
          <select v-model="brand">
            <option value="">Tất cả</option>
            <option v-for="b in brandOptions" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>

        <div class="field">
          <label>Năm</label>
          <input v-model.number="year" type="number" min="0" placeholder="Ví dụ 2025" />
        </div>

        <div class="field">
          <label>Giá tối đa</label>
          <input v-model.number="maxPrice" type="number" min="0" placeholder="Ví dụ 1800000000" />
        </div>

        <div class="field">
          <label>Sắp xếp</label>
          <select v-model="sortBy">
            <option value="new">Mới cập nhật</option>
            <option value="priceAsc">Giá tăng dần</option>
            <option value="priceDesc">Giá giảm dần</option>
            <option value="yearDesc">Năm mới nhất</option>
          </select>
        </div>

        <div class="field actions">
          <label>&nbsp;</label>
          <div class="btns">
            <button class="btn primary" @click="applyFilters" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              Áp dụng
            </button>
            <button class="btn" @click="resetFilters" :disabled="loading">Xóa</button>
          </div>
        </div>
      </div>

      <div class="stats">
        <span class="badge">{{ filteredCars.length }}</span>
        <span class="muted">xe • Trang {{ currentPage }}/{{ totalPages }} • Hiển thị {{ pageSize }} xe/trang</span>
      </div>

      <div v-if="error" class="alert">{{ error }}</div>
    </section>

    <section class="grid">
      <template v-if="loading">
        <div class="car skeleton" v-for="i in 8" :key="i">
          <div class="sk-img"></div>
          <div class="sk-line w70"></div>
          <div class="sk-line w45"></div>
          <div class="sk-line w60"></div>
        </div>
      </template>

      <template v-else>
        <article class="car" v-for="c in pagedCars" :key="c.CarId" @click="openQuick(c)">
  <div class="img">
    <img :src="c.ImageUrl || fallbackImg" @error="imgFallback" />
    <div class="status" :class="statusClass(c.Status)">{{ c.Status || "—" }}</div>
  </div>

  <div class="body">
    <div class="title line1">{{ c.Name }}</div>
    <div class="sub muted line1">{{ c.Brand || "—" }} • {{ c.Model || "—" }} • {{ c.Year || "—" }}</div>

    <div class="row">
      <div class="price mono">{{ formatMoney(c.Price) }}</div>
      <div class="odo muted mono">{{ (c.Mileage ?? 0).toLocaleString("vi-VN") }} km</div>
    </div>
    
    <div class="cta">
      <button class="btn sm primary" @click.stop="openQuick(c)">Xem nhanh</button>
      <button class="btn sm" @click.stop="goToDetail(c.CarId)">Chi tiết</button>
    </div>
  </div>
</article>
      </template>
    </section>

    <div v-if="!loading && filteredCars.length === 0" class="empty card">
      Không có xe phù hợp. Hãy thử đổi bộ lọc.
    </div>

    <div class="pager" v-if="!loading && filteredCars.length > 0">
      <button class="btn sm" :disabled="currentPage===1" @click="prevPage">‹ Trước</button>
      <div class="pagebox">
        Trang
        <input class="pageinput" type="number" :min="1" :max="totalPages" v-model.number="currentPage" @change="goPage(currentPage)" />
        / {{ totalPages }}
      </div>
      <button class="btn sm" :disabled="currentPage===totalPages" @click="nextPage">Sau ›</button>
    </div>

    <transition name="modal">
      <div v-if="quick.open" class="backdrop" @mousedown.self="closeQuick">
        <div class="modal">
          <div class="mh">
            <div>
              <h3 class="m0">{{ quick.car?.Name }}</h3>
              <div class="muted">{{ quick.car?.Brand }} • {{ quick.car?.Model }} • {{ quick.car?.Year }}</div>
            </div>
            <button class="btn ghost" @click="closeQuick">✕</button>
          </div>
          <div class="mc">
            <div class="mimg">
              <img :src="quick.car?.ImageUrl || fallbackImg" @error="imgFallback" />
            </div>
            <div class="minfo">
              <div class="info-grid">
                <div class="info">
                  <div class="k">Giá</div>
                  <div class="v mono">{{ formatMoney(quick.car?.Price) }}</div>
                </div>
                <div class="info">
                  <div class="k">Màu</div>
                  <div class="v">{{ quick.car?.Color || '—' }}</div>
                </div>
                <div class="info">
                  <div class="k">Odo</div>
                  <div class="v mono">{{ (quick.car?.Mileage ?? 0).toLocaleString('vi-VN') }} km</div>
                </div>
                <div class="info">
                  <div class="k">Trạng thái</div>
                  <div class="v"><span class="pill" :class="statusClass(quick.car?.Status)">{{ quick.car?.Status || '—' }}</span></div>
                </div>
              </div>
              <div class="desc">
                <div class="k">Mô tả</div>
                <div class="muted">{{ quick.car?.Description || '—' }}</div>
              </div>
              <div class="mcta">
                <button class="btn primary" @click="fakeOrder">Đặt lịch xem xe</button>
                <button class="btn" @click="closeQuick">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>
    </transition>
  </UserLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import UserLayout from '../pages/UserLayout.vue';
import { api } from "../services/api";

const router = useRouter();
const cars = ref([]);
const loading = ref(false);
const error = ref(null);

// Filters
const q = ref("");
const brand = ref("");
const year = ref(null);
const maxPrice = ref(null);
const sortBy = ref("new");
const pageSize = ref(8);
const currentPage = ref(1);
const listRef = ref(null);

watch([q, brand, year, maxPrice, sortBy], () => (currentPage.value = 1));

const fallbackImg = "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop";
function imgFallback(e) { e.target.src = fallbackImg; }

// Toast logic
const toast = reactive({ show: false, msg: "", type: "ok" });
let tmr = null;
function showToast(msg, type="ok"){
  toast.show = true; toast.msg = msg; toast.type = type;
  clearTimeout(tmr);
  tmr = setTimeout(()=> toast.show=false, 2200);
}

// Fetch API
async function fetchCars(){
  loading.value = true;
  error.value = null;
  try {
    const res = await api.getCars(); 
    // Xử lý nếu API trả về bọc trong $values (Entity Framework)
    cars.value = res?.$values || res || [];
  } catch(e) {
    error.value = e?.message || "Không tải được danh sách xe.";
    showToast(error.value, "err");
  } finally {
    loading.value = false;
  }
}

// Điều hướng trang chi tiết
function goToDetail(id) {
  if (!id) return;
  router.push({ name: 'CarDetail', params: { id: id.toString() } });
}

// Computed logic
const brandOptions = computed(() => {
  const set = new Set();
  cars.value.forEach(c => { if (c.Brand) set.add(c.Brand); });
  return [...set].sort((a,b)=> a.localeCompare(b, "vi"));
});

const filteredCars = computed(() => {
  let list = [...cars.value];
  const key = q.value.toLowerCase().trim();

  if (key) {
    list = list.filter((c) => {
      return `${c.Name} ${c.Brand} ${c.Model} ${c.Color}`.toLowerCase().includes(key);
    });
  }

  if (brand.value) list = list.filter(c => c.Brand === brand.value);
  if (year.value) list = list.filter(c => Number(c.Year) === Number(year.value));
  if (maxPrice.value) list = list.filter(c => Number(c.Price ?? 0) <= Number(maxPrice.value));

  if (sortBy.value === "priceAsc") list.sort((a,b)=> (a.Price ?? 0) - (b.price ?? 0));
  if (sortBy.value === "priceDesc") list.sort((a,b)=> (b.Price ?? 0) - (a.price ?? 0));
  if (sortBy.value === "yearDesc") list.sort((a,b)=> (b.Year ?? 0) - (a.year ?? 0));
  if (sortBy.value === "new") list.sort((a,b)=> new Date(b.UpdatedAt || 0) - new Date(a.UpdatedAt || 0));

  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCars.value.length / pageSize.value)));
const pagedCars = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredCars.value.slice(start, start + pageSize.value);
});
const featured = computed(() => filteredCars.value.slice(0,4));

// Actions
function applyFilters(){ showToast("Đã áp dụng bộ lọc.", "ok"); scrollToList(); }
function resetFilters(){
  q.value=""; brand.value=""; year.value=null; maxPrice.value=null; sortBy.value="new";
  currentPage.value=1;
  showToast("Đã xóa bộ lọc.", "ok");
}
function scrollToList(){ listRef.value?.scrollIntoView({ behavior:"smooth", block:"start" }); }
function prevPage(){ if (currentPage.value>1) currentPage.value--; }
function nextPage(){ if (currentPage.value<totalPages.value) currentPage.value++; }
function goPage(p){ if (p>=1 && p<=totalPages.value) currentPage.value = p; }

// Formatter (CHỈ GIỮ LẠI 1 HÀM NÀY)
function formatMoney(val){
  const n = Number(val);
  if (isNaN(n) || n <= 0) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style:"currency", currency:"VND", maximumFractionDigits: 0 }).format(n);
}

function statusClass(status){
  const s = String(status ?? "").toLowerCase();
  if (["1","available","còn"].some(x=> s.includes(x))) return "ok";
  if (["0","sold","hết"].some(x=> s.includes(x))) return "bad";
  return "neutral";
}

const quick = reactive({ open:false, car:null });
function openQuick(car){ quick.open=true; quick.car=car; }
function closeQuick(){ quick.open=false; quick.car=null; }
function fakeOrder(){ showToast("Tính năng đang phát triển", "warn"); }

onMounted(fetchCars);
</script>

<style scoped>
.muted{ color: rgba(232,238,252,.72); }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
.line1{
  display:-webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp:1;
  overflow:hidden;
}
.m0{ margin:0; }

.card{
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 18px 60px rgba(0,0,0,.28);
  backdrop-filter: blur(10px);
}
.card-mini{
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 16px;
  padding: 12px;
}

.btn{
  appearance:none;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.08);
  color:#e8eefc;
  padding: 10px 12px;
  border-radius: 14px;
  cursor:pointer;
  transition: transform .15s ease, background .15s ease, opacity .15s ease, box-shadow .15s ease;
  box-shadow: 0 12px 36px rgba(0,0,0,.18);
}
.btn:hover{ transform: translateY(-1px); background: rgba(255,255,255,.12); }
.btn:active{ transform: translateY(0); }
.btn.primary{ background: linear-gradient(135deg,#22c55e,#16a34a); border-color: transparent; }
.btn.ghost{ background: transparent; box-shadow:none; }
.btn.sm{ padding: 8px 10px; border-radius: 12px; }

.ad{
  display:grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 14px;
  overflow:hidden;
}
@media (max-width: 980px){
  .ad{ grid-template-columns: 1fr; }
}
.ad-tag{
  display:inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  font-weight: 800;
  font-size: 12px;
}
.ad-left h1{
  margin: 10px 0 8px;
  font-size: 34px;
  line-height: 1.08;
  letter-spacing: -.4px;
}
.grad{
  background: linear-gradient(135deg,#60a5fa,#a78bfa);
  -webkit-background-clip:text; background-clip:text;
  color: transparent;
}
.ad-actions{ display:flex; gap: 10px; margin-top: 12px; flex-wrap:wrap; }
.ad-badges{ display:flex; gap: 10px; margin-top: 12px; flex-wrap:wrap; }
.chip{
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  font-size: 12px;
}

.ad-card{
  position: relative;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  padding: 12px;
  overflow:hidden;
}
.shine{
  position:absolute;
  inset:-2px;
  background: radial-gradient(500px 240px at 20% 0%, rgba(59,130,246,.25), transparent 55%);
  pointer-events:none;
}
.ad-mini-title{ font-weight: 900; margin-bottom: 10px; }
.ad-item{
  width: 100%;
  display:flex;
  gap: 10px;
  align-items:center;
  text-align:left;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  color:#e8eefc;
  cursor:pointer;
  transition: transform .15s ease, background .15s ease;
}
.ad-item:hover{ transform: translateY(-1px); background: rgba(255,255,255,.08); }
.ad-item img{
  width: 56px; height: 40px; object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.12);
}
.meta{ flex:1; }
.go{ opacity:.8; }

.ad-skel .sk-row{
  height: 54px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.12), rgba(255,255,255,.06));
  background-size: 240% 100%;
  animation: shimmer 1.2s infinite;
  margin-bottom: 10px;
}

.filters{ margin-top: 14px; }
.filters-grid{
display: grid;
  /* Tự động điều chỉnh số cột dựa trên màn hình, cách nhau 25px */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}
@media (max-width: 1100px){
  .filters-grid{ grid-template-columns: 1fr 1fr; }
}
@media (max-width: 700px){
  .filters-grid{ grid-template-columns: 1fr; }
}
.field label{
  display:block;
  font-size: 12px;
  color: rgba(232,238,252,.72);
  margin-bottom: 6px;
}
input, select{
  width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.18);
  color:#e8eefc;
  outline:none;
}
.actions .btns{ display:flex; gap: 10px; justify-content:flex-end; }
@media (max-width: 700px){
  .actions .btns{ justify-content:flex-start; }
}

.stats{
  display:flex;
  gap: 10px;
  align-items:center;
  margin-top: 12px;
}
.badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width: 30px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(96,165,250,.16);
  border: 1px solid rgba(96,165,250,.25);
  color:#cfe3ff;
  font-weight: 900;
  font-size: 12px;
}
.alert{
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(239,68,68,.25);
  background: rgba(239,68,68,.10);
  color:#ffd1d1;
}

.grid{
  margin-top: 14px;
  display:grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
@media (max-width: 1100px){ .grid{ grid-template-columns: repeat(3,1fr); } }
@media (max-width: 860px){ .grid{ grid-template-columns: repeat(2,1fr); } }
@media (max-width: 560px){ .grid{ grid-template-columns: 1fr; } }

.car{
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  overflow:hidden;
  cursor:pointer;
  transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
  box-shadow: 0 18px 50px rgba(0,0,0,.22);
}
.car:hover{
  transform: translateY(-3px);
  background: rgba(255,255,255,.08);
  box-shadow: 0 26px 70px rgba(0,0,0,.30);
}
.img{ position:relative; height: 160px; overflow:hidden; }
.img img{
  width: 100%; height: 100%;
  object-fit: cover;
  transform: scale(1.02);
  transition: transform .25s ease;
}
.car:hover .img img{ transform: scale(1.07); }

.status{
  position:absolute; left: 10px; top: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.22);
  backdrop-filter: blur(10px);
}
.status.ok{ background: rgba(34,197,94,.18); border-color: rgba(34,197,94,.28); }
.status.bad{ background: rgba(239,68,68,.18); border-color: rgba(239,68,68,.28); }
.status.neutral{ background: rgba(148,163,184,.16); border-color: rgba(148,163,184,.24); }

.body{ padding: 12px; }
.title{ font-weight: 900; }
.row{
  margin-top: 10px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.price{ font-weight: 900; }
.odo{ font-size: 12px; }
.cta{ display:flex; gap: 10px; margin-top: 12px; }

.empty{
  margin-top: 14px;
  text-align:center;
}

.pager{
  margin-top: 14px;
  display:flex;
  justify-content:center;
  align-items:center;
  gap: 12px;
}
.pagebox{
  display:flex;
  gap: 8px;
  align-items:center;
  padding: 8px 10px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
}
.pageinput{
  width: 72px;
  padding: 6px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.18);
  color:#e8eefc;
}

.backdrop{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 16px;
  z-index: 50;
}
.modal{
  width: min(980px, 100%);
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(12,16,32,.92);
  box-shadow: 0 30px 90px rgba(0,0,0,.55);
  overflow:hidden;
}
.mh{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap: 10px;
  padding: 14px 14px 0;
}
.mc{
  padding: 14px;
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 14px;
}
@media (max-width: 980px){ .mc{ grid-template-columns: 1fr; } }
.mimg{
  border-radius: 16px;
  overflow:hidden;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
}
.mimg img{ width:100%; height:360px; object-fit: cover; }
.info-grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.info{
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  padding: 10px;
}
.k{ font-size: 12px; color: rgba(232,238,252,.70); }
.v{ font-weight: 900; margin-top: 4px; }
.desc{ margin-top: 10px; }
.mcta{ display:flex; gap: 10px; margin-top: 12px; }
.pill{
  display:inline-flex;
  align-items:center;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
}
.pill.ok{ background: rgba(34,197,94,.16); border-color: rgba(34,197,94,.25); }
.pill.bad{ background: rgba(239,68,68,.16); border-color: rgba(239,68,68,.25); }
.pill.neutral{ background: rgba(148,163,184,.14); border-color: rgba(148,163,184,.22); }

.modal-enter-active, .modal-leave-active{ transition: opacity .18s ease; }
.modal-enter-from, .modal-leave-to{ opacity: 0; }

.toast{
  position: fixed;
  right: 16px;
  bottom: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  color:#fff;
  z-index: 60;
  box-shadow: 0 22px 60px rgba(0,0,0,.45);
}
.toast.ok{ background: linear-gradient(135deg,#16a34a,#22c55e); }
.toast.warn{ background: linear-gradient(135deg,#f59e0b,#f97316); }
.toast.err{ background: linear-gradient(135deg,#ef4444,#f97316); }
.toast-enter-active, .toast-leave-active{ transition: all .18s ease; }
.toast-enter-from{ opacity: 0; transform: translateY(10px); }
.toast-leave-to{ opacity: 0; transform: translateY(10px); }

.spinner{
  display:inline-block;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgba(255,255,255,.55);
  border-top-color: rgba(255,255,255,1);
  margin-right: 8px;
  animation: spin .7s linear infinite;
}
@keyframes spin{ to{ transform: rotate(360deg); } }

.skeleton{ padding: 12px; }
.sk-img{
  height: 160px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.12), rgba(255,255,255,.06));
  background-size: 240% 100%;
  animation: shimmer 1.2s infinite;
}
.sk-line{
  height: 12px;
  border-radius: 999px;
  margin-top: 10px;
  background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.12), rgba(255,255,255,.06));
  background-size: 240% 100%;
  animation: shimmer 1.2s infinite;
}
.w70{ width: 70%; }
.w60{ width: 60%; }
.w45{ width: 45%; }

@keyframes shimmer{
  0%{ background-position: 100% 0; }
  100%{ background-position: -140% 0; }
}
</style>
