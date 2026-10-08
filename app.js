const DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const WEEK_DAYS = [1, 2, 3, 4, 5];

const state = {
  schedule: null,
  selectedDay: new Date().getDay() || 1,
  now: new Date(),
};

const elements = {
  todayLabel: document.querySelector("#todayLabel"),
  liveClock: document.querySelector("#liveClock"),
  statusPill: document.querySelector("#statusPill"),
  focusKicker: document.querySelector("#focusKicker"),
  focusTitle: document.querySelector("#focusTitle"),
  focusMeta: document.querySelector("#focusMeta"),
  progressBar: document.querySelector("#progressBar"),
  todayList: document.querySelector("#todayList"),
  courseCount: document.querySelector("#courseCount"),
  dayTabs: document.querySelector("#dayTabs"),
  weekList: document.querySelector("#weekList"),
  updatedAt: document.querySelector("#updatedAt"),
  notificationButton: document.querySelector("#notificationButton"),
  notificationLabel: document.querySelector("#notificationLabel"),
  toast: document.querySelector("#toast"),
  days: document.querySelector("#daysValue"),
  hours: document.querySelector("#hoursValue"),
  minutes: document.querySelector("#minutesValue"),
  seconds: document.querySelector("#secondsValue"),
};

function parseTime(date, time) {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function dateForWeekday(baseDate, weekday, weekOffset = 0) {
  const date = new Date(baseDate);
  const delta = (weekday - date.getDay() + 7) % 7 + weekOffset * 7;
  date.setDate(date.getDate() + delta);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getOccurrences(now) {
  const occurrences = [];
  for (let weekOffset = 0; weekOffset <= 1; weekOffset += 1) {
    for (const course of state.schedule.courses) {
      const date = dateForWeekday(now, course.day, weekOffset);
      const start = parseTime(date, course.start);
      const end = parseTime(date, course.end);
      occurrences.push({ ...course, startDate: start, endDate: end });
    }
  }
  return occurrences.sort((a, b) => a.startDate - b.startDate);
}

function getFocus(now) {
  const occurrences = getOccurrences(now);
  const active = occurrences.find((course) => now >= course.startDate && now < course.endDate);
  if (active) return { type: "active", course: active, target: active.endDate };
  const upcoming = occurrences.find((course) => course.startDate > now);
  return upcoming ? { type: "upcoming", course: upcoming, target: upcoming.startDate } : null;
}

function formatDuration(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function setCountdown(target, now) {
  const duration = formatDuration(target - now);
  elements.days.textContent = String(duration.days).padStart(2, "0");
  elements.hours.textContent = String(duration.hours).padStart(2, "0");
  elements.minutes.textContent = String(duration.minutes).padStart(2, "0");
  elements.seconds.textContent = String(duration.seconds).padStart(2, "0");
}

function courseMeta(course) {
  return [course.room, course.instructor].filter(Boolean).join(" · ");
}

function renderFocus(now) {
  const focus = getFocus(now);
  if (!focus) return;

  const { course, type, target } = focus;
  const isToday = course.startDate.toDateString() === now.toDateString();
  elements.statusPill.textContent = type === "active" ? "Ders devam ediyor" : isToday ? "Sıradaki ders" : "Bir sonraki ders";
  elements.statusPill.classList.toggle("live", type === "active");
  elements.focusKicker.textContent = type === "active" ? "Bitmesine kalan süre" : "Başlamasına kalan süre";
  elements.focusTitle.textContent = course.name;
  elements.focusMeta.textContent = `${DAY_NAMES[course.day]} · ${course.start}–${course.end}${courseMeta(course) ? ` · ${courseMeta(course)}` : ""}`;
  setCountdown(target, now);

  if (type === "active") {
    const total = course.endDate - course.startDate;
    const elapsed = now - course.startDate;
    elements.progressBar.style.width = `${Math.min(100, Math.max(0, (elapsed / total) * 100))}%`;
  } else {
    elements.progressBar.style.width = "0%";
  }
}

function courseRow(course, active = false) {
  return `
    <article class="course-row${active ? " active" : ""}">
      <div class="course-time">${course.start}<small>${course.end}'e kadar</small></div>
      <div class="course-main">
        <h3>${course.name}</h3>
        <p>${courseMeta(course) || "Derslik bilgisi eklenmedi"}</p>
      </div>
      <span class="course-code">${active ? "ŞİMDİ" : course.code || "DERS"}</span>
    </article>`;
}

function renderToday(now) {
  const today = now.getDay();
  const courses = state.schedule.courses
    .filter((course) => course.day === today)
    .sort((a, b) => a.start.localeCompare(b.start));
  elements.todayLabel.textContent = `${DAY_NAMES[today].toUpperCase()} · ${new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" }).format(now).toUpperCase()}`;
  elements.courseCount.textContent = `${courses.length} ders`;
  elements.todayList.innerHTML = courses.length
    ? courses.map((course) => {
        const start = parseTime(now, course.start);
        const end = parseTime(now, course.end);
        return courseRow(course, now >= start && now < end);
      }).join("")
    : '<div class="empty-state">Bugün ders görünmüyor. Biraz nefes al ✦</div>';
}

function renderTabs() {
  elements.dayTabs.innerHTML = WEEK_DAYS.map((day) => `
    <button class="day-tab" role="tab" aria-selected="${state.selectedDay === day}" data-day="${day}">${DAY_NAMES[day]}</button>
  `).join("");
  elements.dayTabs.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDay = Number(button.dataset.day);
      renderTabs();
      renderWeek();
    });
  });
}

function renderWeek() {
  const courses = state.schedule.courses
    .filter((course) => course.day === state.selectedDay)
    .sort((a, b) => a.start.localeCompare(b.start));
  elements.weekList.innerHTML = courses.length
    ? courses.map((course) => courseRow(course)).join("")
    : '<div class="empty-state">Bu güne ait ders yok.</div>';
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 3500);
}

function notificationKey(course) {
  return `notified:${course.code}:${course.startDate.toISOString().slice(0, 10)}:${course.start}`;
}

function checkNotifications(now) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const soon = getOccurrences(now).find((course) => {
    const difference = course.startDate - now;
    return difference > 0 && difference <= 15 * 60 * 1000 && !localStorage.getItem(notificationKey(course));
  });
  if (!soon) return;
  new Notification(`${soon.name} 15 dakika içinde`, {
    body: `${soon.start} · ${soon.room || "Derslik bilgisini kontrol et"}`,
    icon: "assets/favicon.svg",
    tag: notificationKey(soon),
  });
  localStorage.setItem(notificationKey(soon), "1");
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    showToast("Bu tarayıcı bildirimleri desteklemiyor.");
    return;
  }
  if (Notification.permission === "denied") {
    showToast("Bildirimler tarayıcı ayarlarından engellenmiş.");
    return;
  }
  const permission = await Notification.requestPermission();
  updateNotificationButton();
  if (permission === "granted") {
    showToast("Bildirimler açık. Sayfa açıkken 15 dakika önce haber vereceğim.");
    checkNotifications(new Date());
  }
}

function updateNotificationButton() {
  const enabled = "Notification" in window && Notification.permission === "granted";
  elements.notificationButton.classList.toggle("enabled", enabled);
  elements.notificationLabel.textContent = enabled ? "Bildirimler açık" : "Bildirimleri aç";
}

function tick() {
  const previousDay = state.now.getDay();
  state.now = new Date();
  elements.liveClock.textContent = state.now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  renderFocus(state.now);
  checkNotifications(state.now);
  if (state.now.getDay() !== previousDay) renderToday(state.now);
}

async function init() {
  try {
    const response = await fetch("schedule.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Program dosyası okunamadı");
    state.schedule = await response.json();
    if (!Array.isArray(state.schedule.courses)) throw new Error("Program biçimi geçersiz");

    const today = new Date().getDay();
    state.selectedDay = WEEK_DAYS.includes(today) ? today : 1;
    document.querySelector(".hero-description").textContent = `${state.schedule.school} · ${state.schedule.department} · ${state.schedule.classLevel}`;
    elements.updatedAt.textContent = state.schedule.updatedAt ? `Son güncelleme: ${state.schedule.updatedAt}` : "";
    renderToday(state.now);
    renderTabs();
    renderWeek();
    updateNotificationButton();
    tick();
    window.setInterval(tick, 1000);
  } catch (error) {
    elements.statusPill.textContent = "Bir sorun oluştu";
    elements.focusTitle.textContent = "schedule.json yüklenemedi";
    elements.focusKicker.textContent = "Dosya yapısını kontrol et";
    elements.todayList.innerHTML = `<div class="empty-state">${error.message}</div>`;
    console.error(error);
  }
}

elements.notificationButton.addEventListener("click", enableNotifications);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(console.error));
}

init();
