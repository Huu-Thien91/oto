<template>
  <UserLayout>
    <template v-if="car">
      <div class="container detail-page">
        <button class="btn-back" @click="$router.back()">
          ← Quay lại danh sách
        </button>

        <div class="detail-grid">
          <div class="detail-image card">
            <img
              :src="car.ImageUrl || car.imageUrl || fallbackImg"
              @error="imgFallback"
            />
          </div>

          <div class="detail-info card">
            <div class="badge" :class="statusClass(car.Status || car.status)">
              {{ car.Status || car.status || "Đang cập nhật" }}
            </div>
            <h1>{{ car.Name || car.name }}</h1>
            <p class="price">{{ formatMoney(car.Price || car.price) }}</p>

            <div class="specs-grid">
              <div class="spec-item">
                <span class="label">Thương hiệu</span>
                <span class="val">{{ car.Brand || car.brand || "—" }}</span>
              </div>
              <div class="spec-item">
                <span class="label">Đời xe</span>
                <span class="val">{{ car.Year || car.year || "—" }}</span>
              </div>
              <div class="spec-item">
                <span class="label">Số KM đã đi</span>
                <span class="val"
                  >{{
                    (car.Mileage || car.mileage || 0).toLocaleString()
                  }}
                  km</span
                >
              </div>
              <div class="spec-item">
                <span class="label">Màu sắc</span>
                <span class="val">{{ car.Color || car.color || "—" }}</span>
              </div>
            </div>

            <div class="description">
              <h3>Mô tả chi tiết</h3>
              <p>
                {{
                  car.Description ||
                  car.description ||
                  "Chưa có mô tả cho xe này."
                }}
              </p>
            </div>

            <div class="actions">
              <button class="btn primary" @click="contactZalo">
                <span class="icon">💬</span> Liên hệ ngay (Zalo)
              </button>
              <button class="btn simulate-btn" @click="startTestDrive">
                <span class="icon">🏎️</span> Lái thử mô phỏng
              </button>
            </div>
          </div>
        </div>
      </div>

      <Transition name="fade">
        <div v-if="isDriving" class="drive-simulation">
          <div class="sim-content">
            <button class="btn-close-sim" @click="stopTestDrive">
              ✕ Thoát mô phỏng
            </button>
            <div class="road-view">
              <img
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y2Z2R6ZndvZnR6ZndvZnR6ZndvZnR6ZndvZnR6ZndvZnR6ZndvZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKVUn7iM8FMEU24/giphy.gif"
                alt="Driving"
              />
            </div>
            <div class="cockpit">
              <div class="speedometer">
                <span class="num">{{ Math.round(currentSpeed) }}</span>
                <span class="unit">km/h</span>
              </div>
              <div class="car-label">Đang lái: {{ car?.Name }}</div>
            </div>
            <div class="pedals">
              <p>Nhấn và giữ nút GA để tăng tốc</p>
              <button
                class="pedal-gas"
                @mousedown="accelerate"
                @mouseup="decelerate"
                @mouseleave="decelerate"
                @touchstart="accelerate"
                @touchend="decelerate"
              >
                GA
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </template>

    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải thông tin xe...</p>
    </div>

    <div v-else class="error-state card">
      <p>{{ error || "Không tìm thấy thông tin xe." }}</p>
      <button class="btn" @click="$router.push('/')">Quay lại trang chủ</button>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "../../services/api";
import UserLayout from "../UserLayout.vue";

const route = useRoute();
const car = ref(null);
const loading = ref(true);
const error = ref(null);
const fallbackImg =
  "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200";

// Logic mô phỏng lái xe
const isDriving = ref(false);
const currentSpeed = ref(0);
let accelInterval = null;

const startTestDrive = () => {
  isDriving.value = true;
  currentSpeed.value = 0;
};

const stopTestDrive = () => {
  isDriving.value = false;
  clearInterval(accelInterval);
};

const accelerate = () => {
  clearInterval(accelInterval);
  accelInterval = setInterval(() => {
    if (currentSpeed.value < 180) currentSpeed.value += 3;
  }, 50);
};

const decelerate = () => {
  clearInterval(accelInterval);
  accelInterval = setInterval(() => {
    if (currentSpeed.value > 0) currentSpeed.value -= 2;
    else clearInterval(accelInterval);
  }, 50);
};

// Logic lấy dữ liệu & format
const fetchCarDetail = async () => {
  try {
    loading.value = true;
    const id = route.params.id;
    const data = await api.getCarById(id);
    car.value = data;
    // Tự động cuộn lên đầu khi tải xong dữ liệu
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    error.value = "Lỗi khi tải thông tin.";
  } finally {
    loading.value = false;
  }
};

const contactZalo = () => {
  const phoneNumber = "0327048256"; // THAY SỐ ĐIỆN THOẠI CỦA BẠN VÀO ĐÂY
  window.open(`https://zalo.me/${phoneNumber}`, "_blank");
};

const formatMoney = (v) => {
  const n = Number(v);
  return isNaN(n) || n <= 0
    ? "Liên hệ"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n);
};

const statusClass = (s) =>
  String(s || "")
    .toLowerCase()
    .includes("1")
    ? "ok"
    : "neutral";
const imgFallback = (e) => {
  e.target.src = fallbackImg;
};

onMounted(fetchCarDetail);
</script>

<style scoped>
/* Trang chi tiết cũ của bạn */
.detail-page {
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
}
.btn-back {
  background: none;
  border: none;
  color: #667085;
  cursor: pointer;
  margin-bottom: 1.5rem;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.detail-image img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
.detail-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.price {
  font-size: 2rem;
  font-weight: 700;
  color: #e44d26;
  margin: 0;
}
.specs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.5rem 0;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}
.spec-item {
  display: flex;
  flex-direction: column;
}
.label {
  font-size: 0.85rem;
  color: #667085;
}
.val {
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}
.btn {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn.primary {
  background: #1a73e8;
  color: white;
  border: none;
}
.simulate-btn {
  background: #000;
  color: #00ff00;
  border: 1px solid #00ff00;
}

/* CSS MÔ PHỎNG LÁI XE */
.drive-simulation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.sim-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.btn-close-sim {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  padding: 10px 20px;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.road-view {
  width: 100%;
  height: 100%;
}
.road-view img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
}

.cockpit {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: #00ff00;
  font-family: "Courier New", Courier, monospace;
}
.speedometer {
  font-size: 80px;
  font-weight: bold;
  text-shadow: 0 0 20px #00ff00;
}
.unit {
  font-size: 20px;
  margin-left: 10px;
}
.car-label {
  font-size: 24px;
  text-transform: uppercase;
  margin-top: 10px;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 20px;
  border-radius: 20px;
}

.pedals {
  position: absolute;
  bottom: 40px;
  right: 40px;
  text-align: center;
  color: white;
}
.pedal-gas {
  width: 100px;
  height: 160px;
  background: #222;
  border: 4px solid #444;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 10px 0 #000;
  transition: 0.1s;
}
.pedal-gas:active {
  transform: translateY(8px);
  box-shadow: 0 2px 0 #000;
  background: #333;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .speedometer {
    font-size: 50px;
  }
}
</style>
