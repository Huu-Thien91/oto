<template>
  <div class="layout">
    <!-- Promo bar -->
    <div class="promo">
      <div class="promo-inner">
        <div class="left">
          <span class="dot"></span>
          <b>Ưu đãi tuần này:</b> Miễn phí tư vấn • Hỗ trợ trả góp • Giao xe tận nơi
        </div>
        <div class="right">
          <span class="pill">Hotline: 0909 123 456</span>
          <span class="pill ghost">Email: sales@automarket.vn</span>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <div class="brand" @click="$router.push('/')">
          <div class="logo">OTO</div>
          <div>
            <div class="name">AutoMarket</div>
            <div class="sub">Website bán ô tô • Trải nghiệm hiện đại</div>
          </div>
        </div>

        <nav class="nav">
          <a class="link" @click="$router.push('/')">Trang chủ</a>
          <a class="link" @click="toast('Sắp có: Xe mới', 'warn')">Xe mới</a>
          <a class="link" @click="toast('Sắp có: Khuyến mãi', 'warn')">Khuyến mãi</a>
          <a class="link" @click="toast('Sắp có: Tư vấn AI', 'warn')">AI tư vấn</a>
        </nav>

        <div class="actions">
          <button class="btn ghost" @click="toast('Sắp có: Đăng nhập', 'warn')">Đăng nhập</button>
          <button class="btn primary" @click="toast('Sắp có: Liên hệ', 'ok')">Liên hệ</button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="col">
          <div class="f-title">AutoMarket</div>
          <div class="muted">
            Nền tảng mua bán ô tô hiện đại. Tập trung trải nghiệm, tốc độ và khả năng mở rộng AI tư vấn.
          </div>
        </div>

        <div class="col">
          <div class="f-title">Liên hệ</div>
          <div class="f-item"><span class="k">Hotline:</span> 0909 123 456</div>
          <div class="f-item"><span class="k">Email:</span> sales@automarket.vn</div>
          <div class="f-item"><span class="k">Địa chỉ:</span> 123 Lê Lợi, Hà Nội</div>
        </div>

        <div class="col">
          <div class="f-title">Giờ mở cửa</div>
          <div class="f-item">T2–T6: 08:30 – 18:30</div>
          <div class="f-item">T7–CN: 09:00 – 17:00</div>
          <div class="f-item muted">* Có hỗ trợ hẹn ngoài giờ</div>
        </div>
      </div>

      <div class="copy muted">© 2026 AutoMarket • Demo đồ án tốt nghiệp</div>
    </footer>

    <button class="to-top" v-show="showTop" @click="scrollTop">↑</button>

    <transition name="toast">
      <div v-if="t.show" class="toast" :class="t.type">{{ t.msg }}</div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";

const showTop = ref(false);

const t = reactive({ show: false, msg: "", type: "ok" });
let timer = null;
function toast(msg, type = "ok") {
  t.show = true;
  t.msg = msg;
  t.type = type;
  clearTimeout(timer);
  timer = setTimeout(() => (t.show = false), 2200);
}

function onScroll() {
  showTop.value = window.scrollY > 500;
}
function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => window.addEventListener("scroll", onScroll));
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<style scoped>
.layout{
  min-height: 100vh;
  background:
    radial-gradient(1200px 600px at 20% 0%, rgba(99,102,241,.22), transparent 60%),
    radial-gradient(1000px 700px at 90% 10%, rgba(34,197,94,.16), transparent 55%),
    radial-gradient(900px 600px at 50% 120%, rgba(245,158,11,.12), transparent 55%),
    #0b1020;
  color: #e8eefc;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}
.muted{ color: rgba(232,238,252,.70); }

.promo{
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(255,255,255,.06);
  border-bottom: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(10px);
}
.promo-inner{
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  font-size: 12px;
}
.left{ display:flex; align-items:center; gap: 10px; color: rgba(232,238,252,.82); }
.dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(135deg,#22c55e,#16a34a);
  box-shadow: 0 0 0 6px rgba(34,197,94,.12);
}
.right{ display:flex; gap: 8px; flex-wrap:wrap; justify-content:flex-end; }
.pill{
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
}
.pill.ghost{ background: transparent; }

.header{
  border-bottom: 1px solid rgba(255,255,255,.10);
  background: rgba(0,0,0,.10);
  backdrop-filter: blur(10px);
}
.header-inner{
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 16px;
}
.brand{
  display:flex;
  align-items:center;
  gap: 10px;
  cursor:pointer;
}
.logo{
  width: 44px; height: 44px; border-radius: 14px;
  display:flex; align-items:center; justify-content:center;
  font-weight: 900; letter-spacing: 1px;
  background: linear-gradient(135deg,#2563eb,#7c3aed);
  box-shadow: 0 18px 44px rgba(0,0,0,.35);
}
.name{ font-weight: 900; }
.sub{ font-size: 12px; color: rgba(232,238,252,.65); }

.nav{
  display:flex;
  gap: 14px;
  flex-wrap:wrap;
}
.link{
  color: rgba(232,238,252,.82);
  text-decoration:none;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 12px;
  transition: background .15s ease, transform .15s ease;
}
.link:hover{
  background: rgba(255,255,255,.08);
  transform: translateY(-1px);
}

.actions{ display:flex; gap: 10px; }

.btn{
  appearance:none;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.08);
  color:#e8eefc;
  padding: 10px 12px;
  border-radius: 14px;
  cursor:pointer;
  transition: transform .15s ease, box-shadow .15s ease, background .15s ease, opacity .15s ease;
  box-shadow: 0 12px 36px rgba(0,0,0,.18);
}
.btn:hover{ transform: translateY(-1px); background: rgba(255,255,255,.12); }
.btn:active{ transform: translateY(0); }
.btn.primary{ background: linear-gradient(135deg,#22c55e,#16a34a); border-color: transparent; }
.btn.ghost{ background: transparent; box-shadow:none; }

.content{
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 16px 40px;
}

.footer{
  border-top: 1px solid rgba(255,255,255,.10);
  background: rgba(0,0,0,.12);
  backdrop-filter: blur(10px);
  padding: 20px 16px;
}
.footer-inner{
  max-width: 1200px;
  margin: 0 auto;
  display:grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  gap: 14px;
}
@media (max-width: 900px){
  .footer-inner{ grid-template-columns: 1fr; }
}
.f-title{ font-weight: 900; margin-bottom: 8px; }
.f-item{ margin: 6px 0; }
.k{ color: rgba(232,238,252,.70); margin-right: 6px; }
.copy{
  max-width: 1200px;
  margin: 10px auto 0;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,.08);
  font-size: 12px;
}

.to-top{
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.10);
  color:#fff;
  cursor:pointer;
  box-shadow: 0 22px 60px rgba(0,0,0,.45);
  transition: transform .15s ease;
  z-index: 50;
}
.to-top:hover{ transform: translateY(-2px); }

.toast{
  position: fixed;
  right: 16px;
  bottom: 70px;
  padding: 12px 14px;
  border-radius: 14px;
  color:#fff;
  z-index: 60;
  box-shadow: 0 22px 60px rgba(0,0,0,.45);
}
.toast.ok{ background: linear-gradient(135deg,#16a34a,#22c55e); }
.toast.warn{ background: linear-gradient(135deg,#f59e0b,#f97316); }
.toast-enter-active, .toast-leave-active{ transition: all .18s ease; }
.toast-enter-from{ opacity: 0; transform: translateY(10px); }
.toast-leave-to{ opacity: 0; transform: translateY(10px); }
</style>
