const DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const WEEK_DAYS = [1, 2, 3, 4, 5];

const state = {
  schedule: null,
  selectedDay: new Date().getDay() || 1,
  now: new Date(),
  activeView: "home",
  assignments: [],
  assignmentFilter: "all",
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
  themeButton: document.querySelector("#themeButton"),
  themeLabel: document.querySelector("#themeLabel"),
  themeColorMeta: document.querySelector("#themeColorMeta"),
  toast: document.querySelector("#toast"),
  days: document.querySelector("#daysValue"),
  hours: document.querySelector("#hoursValue"),
  minutes: document.querySelector("#minutesValue"),
  seconds: document.querySelector("#secondsValue"),
  bottomNav: document.querySelector("#bottomNav"),
  navButtons: [...document.querySelectorAll(".bottom-nav-button")],
  viewPanels: [...document.querySelectorAll(".view-panel")],
  brandHomeLink: document.querySelector("#brandHomeLink"),
  assignmentList: document.querySelector("#assignmentList"),
  assignmentTotal: document.querySelector("#assignmentTotal"),
  assignmentPending: document.querySelector("#assignmentPending"),
  assignmentCompleted: document.querySelector("#assignmentCompleted"),
  assignmentFilters: [...document.querySelectorAll(".assignment-filter")],
  addAssignmentButton: document.querySelector("#addAssignmentButton"),
  assignmentDialog: document.querySelector("#assignmentDialog"),
  assignmentDialogTitle: document.querySelector("#assignmentDialogTitle"),
  assignmentForm: document.querySelector("#assignmentForm"),
  assignmentId: document.querySelector("#assignmentId"),
  assignmentName: document.querySelector("#assignmentName"),
  assignmentCourse: document.querySelector("#assignmentCourse"),
  assignmentDescription: document.querySelector("#assignmentDescription"),
  assignmentDueDate: document.querySelector("#assignmentDueDate"),
  assignmentPriority: document.querySelector("#assignmentPriority"),
  courseOptions: document.querySelector("#courseOptions"),
  closeAssignmentDialog: document.querySelector("#closeAssignmentDialog"),
  cancelAssignmentButton: document.querySelector("#cancelAssignmentButton"),
};

const VIEW_INDEX = { home: 0, today: 1, week: 2, assignments: 3 };
const THEME_KEY = "ders-pusulasi-theme";
const ASSIGNMENTS_KEY = "ders-pusulasi-assignments";

function applyTheme(theme, remember = true) {
  const selectedTheme = theme === "dark" ? "dark" : "light";
  const isDark = selectedTheme === "dark";
  document.documentElement.dataset.theme = selectedTheme;
  document.documentElement.style.colorScheme = selectedTheme;
  elements.themeColorMeta.content = isDark ? "#07172d" : "#134383";
  elements.themeLabel.textContent = isDark ? "Aydınlık mod" : "Koyu mod";
  elements.themeButton.setAttribute("aria-label", isDark ? "Aydınlık moda geç" : "Koyu moda geç");
  elements.themeButton.setAttribute("title", isDark ? "Aydınlık moda geç" : "Koyu moda geç");
  elements.themeButton.setAttribute("aria-pressed", String(isDark));
  if (remember) {
    try {
      localStorage.setItem(THEME_KEY, selectedTheme);
    } catch (_) {}
  }
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
}

function switchView(view, updateHistory = true) {
  if (!(view in VIEW_INDEX)) view = "home";
  state.activeView = view;

  elements.viewPanels.forEach((panel) => {
    const isActive = panel.id === `${view}View`;
    panel.hidden = !isActive;
    if (isActive) panel.scrollTop = 0;
  });

  elements.navButtons.forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  elements.bottomNav.dataset.active = VIEW_INDEX[view];
  if (view === "assignments") renderAssignments();
  if (updateHistory && location.hash !== `#${view}`) {
    history.pushState({ view }, "", `#${view}`);
  }
}

function parseTime(date, time) {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function formatClockTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
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
  elements.focusMeta.textContent = `${DAY_NAMES[course.day]} · ${formatClockTime(course.start)}–${formatClockTime(course.end)}${courseMeta(course) ? ` · ${courseMeta(course)}` : ""}`;
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
      <div class="course-time">${formatClockTime(course.start)}<small>${formatClockTime(course.end)}'e kadar</small></div>
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

function loadAssignments() {
  try {
    const saved = JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY) || "[]");
    state.assignments = Array.isArray(saved)
      ? saved.filter((assignment) => assignment && assignment.id && assignment.title && assignment.dueDate && !Number.isNaN(new Date(assignment.dueDate).getTime()))
      : [];
  } catch (_) {
    state.assignments = [];
  }
}

function saveAssignments() {
  try {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(state.assignments));
  } catch (_) {
    showToast("Ödevler tarayıcıya kaydedilemedi.");
  }
}

function localDateTimeValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function dateTimeInputValue(value) {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (part) => String(part).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDateTimeInput(value) {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, day, month, year, hours, minutes] = match.map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const valid = date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    && date.getHours() === hours
    && date.getMinutes() === minutes;
  return valid ? date : null;
}

function maskDateTimeInput(event) {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 12);
  let formatted = digits.slice(0, 2);
  if (digits.length > 2) formatted += `.${digits.slice(2, 4)}`;
  if (digits.length > 4) formatted += `.${digits.slice(4, 8)}`;
  if (digits.length > 8) formatted += ` ${digits.slice(8, 10)}`;
  if (digits.length > 10) formatted += `:${digits.slice(10, 12)}`;
  event.target.value = formatted;
  event.target.setCustomValidity("");
}

function dueStatus(assignment) {
  if (assignment.completed) return { label: "Tamamlandı", className: "completed" };
  const difference = new Date(assignment.dueDate) - new Date();
  if (difference <= 0) return { label: "Süresi geçti", className: "overdue" };
  const minutes = Math.ceil(difference / 60000);
  if (minutes < 60) return { label: `${minutes} dk kaldı`, className: "soon" };
  const hours = Math.ceil(difference / 3600000);
  if (hours < 24) return { label: `${hours} saat kaldı`, className: hours <= 6 ? "soon" : "upcoming" };
  const days = Math.ceil(difference / 86400000);
  return { label: `${days} gün kaldı`, className: days <= 2 ? "soon" : "upcoming" };
}

function formatAssignmentDate(value) {
  return dateTimeInputValue(value);
}

function createAssignmentCard(assignment) {
  const status = dueStatus(assignment);
  const priorityLabels = { low: "Düşük", medium: "Orta", high: "Yüksek" };
  const article = document.createElement("article");
  article.className = `assignment-card ${assignment.completed ? "is-completed" : ""} ${status.className === "overdue" ? "is-overdue" : ""}`.trim();

  const checkLabel = document.createElement("label");
  checkLabel.className = "assignment-check";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = Boolean(assignment.completed);
  checkbox.setAttribute("aria-label", `${assignment.title} ödevini tamamlandı olarak işaretle`);
  checkbox.addEventListener("change", () => toggleAssignment(assignment.id, checkbox.checked));
  const checkmark = document.createElement("span");
  checkmark.setAttribute("aria-hidden", "true");
  checkLabel.append(checkbox, checkmark);

  const content = document.createElement("div");
  content.className = "assignment-content";
  const badges = document.createElement("div");
  badges.className = "assignment-badges";
  const priority = document.createElement("span");
  priority.className = `priority-badge priority-${assignment.priority || "medium"}`;
  priority.textContent = `${priorityLabels[assignment.priority] || "Orta"} öncelik`;
  const deadline = document.createElement("span");
  deadline.className = `deadline-badge ${status.className}`;
  deadline.textContent = status.label;
  badges.append(priority, deadline);

  const title = document.createElement("h3");
  title.textContent = assignment.title;
  content.append(badges, title);

  if (assignment.course) {
    const course = document.createElement("p");
    course.className = "assignment-course";
    course.textContent = assignment.course;
    content.append(course);
  }
  if (assignment.description) {
    const description = document.createElement("p");
    description.className = "assignment-description";
    description.textContent = assignment.description;
    content.append(description);
  }
  const exactDate = document.createElement("p");
  exactDate.className = "assignment-date";
  exactDate.textContent = `Son teslim: ${formatAssignmentDate(assignment.dueDate)}`;
  content.append(exactDate);

  const actions = document.createElement("div");
  actions.className = "assignment-actions";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Düzenle";
  editButton.addEventListener("click", () => openAssignmentDialog(assignment));
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger-action";
  deleteButton.textContent = "Sil";
  deleteButton.addEventListener("click", () => deleteAssignment(assignment.id));
  actions.append(editButton, deleteButton);

  article.append(checkLabel, content, actions);
  return article;
}

function renderAssignments() {
  const completedCount = state.assignments.filter((assignment) => assignment.completed).length;
  elements.assignmentTotal.textContent = state.assignments.length;
  elements.assignmentPending.textContent = state.assignments.length - completedCount;
  elements.assignmentCompleted.textContent = completedCount;

  elements.assignmentFilters.forEach((button) => {
    const active = button.dataset.filter === state.assignmentFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const visible = state.assignments
    .filter((assignment) => state.assignmentFilter === "all" || (state.assignmentFilter === "completed" ? assignment.completed : !assignment.completed))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || new Date(a.dueDate) - new Date(b.dueDate));

  elements.assignmentList.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state assignment-empty";
    empty.textContent = state.assignments.length ? "Bu filtrede gösterilecek ödev yok." : "Henüz ödev eklemedin. İlk ödevini ekleyerek başlayabilirsin.";
    elements.assignmentList.append(empty);
    return;
  }
  visible.forEach((assignment) => elements.assignmentList.append(createAssignmentCard(assignment)));
}

function openAssignmentDialog(assignment = null) {
  elements.assignmentForm.reset();
  elements.assignmentId.value = assignment?.id || "";
  elements.assignmentDialogTitle.textContent = assignment ? "Ödevi düzenle" : "Yeni ödev";
  elements.assignmentName.value = assignment?.title || "";
  elements.assignmentCourse.value = assignment?.course || "";
  elements.assignmentDescription.value = assignment?.description || "";
  elements.assignmentPriority.value = assignment?.priority || "medium";
  if (assignment) {
    elements.assignmentDueDate.value = dateTimeInputValue(assignment.dueDate);
  } else {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);
    elements.assignmentDueDate.value = dateTimeInputValue(tomorrow);
  }
  elements.assignmentDialog.showModal();
  elements.assignmentName.focus();
}

function closeAssignmentDialog() {
  elements.assignmentDialog.close();
}

function handleAssignmentSubmit(event) {
  event.preventDefault();
  const title = elements.assignmentName.value.trim();
  const parsedDueDate = parseDateTimeInput(elements.assignmentDueDate.value);
  if (!parsedDueDate) {
    elements.assignmentDueDate.setCustomValidity("Tarihi GG.AA.YYYY SS:DD biçiminde ve geçerli bir değer olarak gir.");
    elements.assignmentDueDate.reportValidity();
    return;
  }
  elements.assignmentDueDate.setCustomValidity("");
  const dueDate = localDateTimeValue(parsedDueDate);
  if (!title) return;

  const existingIndex = state.assignments.findIndex((assignment) => assignment.id === elements.assignmentId.value);
  const existing = existingIndex >= 0 ? state.assignments[existingIndex] : null;
  const assignment = {
    id: existing?.id || globalThis.crypto?.randomUUID?.() || `assignment-${Date.now()}`,
    title,
    course: elements.assignmentCourse.value.trim(),
    description: elements.assignmentDescription.value.trim(),
    dueDate,
    priority: elements.assignmentPriority.value,
    completed: existing?.completed || false,
    completedAt: existing?.completedAt || null,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  if (existingIndex >= 0) state.assignments[existingIndex] = assignment;
  else state.assignments.push(assignment);
  saveAssignments();
  renderAssignments();
  closeAssignmentDialog();
  showToast(existing ? "Ödev güncellendi." : "Ödev eklendi.");
}

function toggleAssignment(id, completed) {
  const assignment = state.assignments.find((item) => item.id === id);
  if (!assignment) return;
  assignment.completed = completed;
  assignment.completedAt = completed ? new Date().toISOString() : null;
  saveAssignments();
  renderAssignments();
  showToast(completed ? "Ödev tamamlandı. Harika!" : "Ödev yeniden bekleyenlere alındı.");
}

function deleteAssignment(id) {
  const assignment = state.assignments.find((item) => item.id === id);
  if (!assignment || !window.confirm(`“${assignment.title}” ödevini silmek istiyor musun?`)) return;
  state.assignments = state.assignments.filter((item) => item.id !== id);
  saveAssignments();
  renderAssignments();
  showToast("Ödev silindi.");
}

function populateCourseOptions() {
  const names = [...new Set(state.schedule.courses.map((course) => course.name))].sort((a, b) => a.localeCompare(b, "tr"));
  elements.courseOptions.replaceChildren();
  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    elements.courseOptions.append(option);
  });
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
    body: `${formatClockTime(soon.start)} · ${soon.room || "Derslik bilgisini kontrol et"}`,
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
  const accessibleLabel = enabled ? "Ders bildirimleri açık" : "Ders bildirimlerini aç";
  elements.notificationButton.setAttribute("aria-label", accessibleLabel);
  elements.notificationButton.setAttribute("title", accessibleLabel);
}

function tick() {
  const previousDay = state.now.getDay();
  state.now = new Date();
  elements.liveClock.textContent = state.now.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  renderFocus(state.now);
  checkNotifications(state.now);
  if (state.now.getDay() !== previousDay) renderToday(state.now);
  if (state.activeView === "assignments" && state.now.getSeconds() === 0) renderAssignments();
}

async function init() {
  loadAssignments();
  renderAssignments();
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
    populateCourseOptions();
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
elements.themeButton.addEventListener("click", toggleTheme);
elements.addAssignmentButton.addEventListener("click", () => openAssignmentDialog());
elements.closeAssignmentDialog.addEventListener("click", closeAssignmentDialog);
elements.cancelAssignmentButton.addEventListener("click", closeAssignmentDialog);
elements.assignmentForm.addEventListener("submit", handleAssignmentSubmit);
elements.assignmentDueDate.addEventListener("input", maskDateTimeInput);
elements.assignmentDialog.addEventListener("click", (event) => {
  if (event.target === elements.assignmentDialog) closeAssignmentDialog();
});
elements.assignmentFilters.forEach((button) => {
  button.addEventListener("click", () => {
    state.assignmentFilter = button.dataset.filter;
    renderAssignments();
  });
});
elements.navButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = elements.navButtons.indexOf(button);
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + elements.navButtons.length) % elements.navButtons.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % elements.navButtons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = elements.navButtons.length - 1;
    elements.navButtons[nextIndex].focus();
    switchView(elements.navButtons[nextIndex].dataset.view);
  });
});
elements.brandHomeLink.addEventListener("click", (event) => {
  event.preventDefault();
  switchView("home");
});
window.addEventListener("popstate", () => switchView(location.hash.slice(1), false));

const initialView = location.hash.slice(1);
switchView(initialView in VIEW_INDEX ? initialView : "home", false);
applyTheme(document.documentElement.dataset.theme, false);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(console.error));
}

init();
