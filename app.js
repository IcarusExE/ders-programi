const DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const WEEK_DAYS = [1, 2, 3, 4, 5];

const state = {
  schedule: null,
  selectedDay: new Date().getDay() || 1,
  now: new Date(),
  activeView: "home",
  assignments: [],
  assignmentFilter: "all",
  assignmentSearch: "",
  notes: [],
  noteSearch: "",
  noteCourseFilter: "all",
  notificationPreferences: {
    lessonEnabled: true,
    lessonMinutes: 15,
    assignmentEnabled: true,
    assignmentMinutes: 1440,
  },
  calendarViewDate: null,
  calendarSelectedDate: null,
  gradeRecords: [],
  gradeLog: [],
  gradeSearch: "",
  gradeStatusFilter: "all",
  attendanceRecords: [],
  attendanceSearch: "",
  installPrompt: null,
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
  settingsButton: document.querySelector("#settingsButton"),
  settingsDialog: document.querySelector("#settingsDialog"),
  closeSettingsDialog: document.querySelector("#closeSettingsDialog"),
  toast: document.querySelector("#toast"),
  days: document.querySelector("#daysValue"),
  hours: document.querySelector("#hoursValue"),
  minutes: document.querySelector("#minutesValue"),
  seconds: document.querySelector("#secondsValue"),
  sidebarNav: document.querySelector("#sidebarNav"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  bottomNav: document.querySelector("#bottomNav"),
  navButtons: [...document.querySelectorAll(".bottom-nav-button")],
  viewPanels: [...document.querySelectorAll(".view-panel")],
  brandHomeLink: document.querySelector("#brandHomeLink"),
  assignmentList: document.querySelector("#assignmentList"),
  assignmentTotal: document.querySelector("#assignmentTotal"),
  assignmentPending: document.querySelector("#assignmentPending"),
  assignmentCompleted: document.querySelector("#assignmentCompleted"),
  assignmentFilters: [...document.querySelectorAll(".assignment-filter")],
  assignmentSearch: document.querySelector("#assignmentSearch"),
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
  openDatePickerButton: document.querySelector("#openDatePickerButton"),
  datePicker: document.querySelector("#datePicker"),
  calendarMonthLabel: document.querySelector("#calendarMonthLabel"),
  calendarDays: document.querySelector("#calendarDays"),
  calendarHour: document.querySelector("#calendarHour"),
  calendarMinute: document.querySelector("#calendarMinute"),
  previousMonthButton: document.querySelector("#previousMonthButton"),
  nextMonthButton: document.querySelector("#nextMonthButton"),
  calendarTodayButton: document.querySelector("#calendarTodayButton"),
  applyDateButton: document.querySelector("#applyDateButton"),
  closeAssignmentDialog: document.querySelector("#closeAssignmentDialog"),
  cancelAssignmentButton: document.querySelector("#cancelAssignmentButton"),
  noteList: document.querySelector("#noteList"),
  noteSearch: document.querySelector("#noteSearch"),
  noteCourseFilter: document.querySelector("#noteCourseFilter"),
  addNoteButton: document.querySelector("#addNoteButton"),
  noteDialog: document.querySelector("#noteDialog"),
  noteDialogTitle: document.querySelector("#noteDialogTitle"),
  noteForm: document.querySelector("#noteForm"),
  noteId: document.querySelector("#noteId"),
  noteCourse: document.querySelector("#noteCourse"),
  noteTitle: document.querySelector("#noteTitle"),
  noteContent: document.querySelector("#noteContent"),
  noteLink: document.querySelector("#noteLink"),
  closeNoteDialog: document.querySelector("#closeNoteDialog"),
  cancelNoteButton: document.querySelector("#cancelNoteButton"),
  gradeList: document.querySelector("#gradeList"),
  gradeTotal: document.querySelector("#gradeTotal"),
  gradePassed: document.querySelector("#gradePassed"),
  gradeFailed: document.querySelector("#gradeFailed"),
  gradeSuccessRate: document.querySelector("#gradeSuccessRate"),
  gradeLogList: document.querySelector("#gradeLogList"),
  gradeLogCount: document.querySelector("#gradeLogCount"),
  addGradeButton: document.querySelector("#addGradeButton"),
  gradeDialog: document.querySelector("#gradeDialog"),
  gradeDialogTitle: document.querySelector("#gradeDialogTitle"),
  gradeForm: document.querySelector("#gradeForm"),
  gradeId: document.querySelector("#gradeId"),
  gradeCourse: document.querySelector("#gradeCourse"),
  midtermGrade: document.querySelector("#midtermGrade"),
  midtermWeight: document.querySelector("#midtermWeight"),
  finalGrade: document.querySelector("#finalGrade"),
  finalWeight: document.querySelector("#finalWeight"),
  passingGrade: document.querySelector("#passingGrade"),
  minimumFinal: document.querySelector("#minimumFinal"),
  gradePreview: document.querySelector("#gradePreview"),
  closeGradeDialog: document.querySelector("#closeGradeDialog"),
  cancelGradeButton: document.querySelector("#cancelGradeButton"),
  gradeSearch: document.querySelector("#gradeSearch"),
  gradeStatusFilter: document.querySelector("#gradeStatusFilter"),
  attendanceCourseCount: document.querySelector("#attendanceCourseCount"),
  attendanceUsed: document.querySelector("#attendanceUsed"),
  attendanceRisk: document.querySelector("#attendanceRisk"),
  attendanceSearch: document.querySelector("#attendanceSearch"),
  attendanceList: document.querySelector("#attendanceList"),
  attendanceDialog: document.querySelector("#attendanceDialog"),
  attendanceForm: document.querySelector("#attendanceForm"),
  attendanceDialogTitle: document.querySelector("#attendanceDialogTitle"),
  attendanceDialogCourse: document.querySelector("#attendanceDialogCourse"),
  attendanceCourse: document.querySelector("#attendanceCourse"),
  attendanceAbsent: document.querySelector("#attendanceAbsent"),
  attendanceLimit: document.querySelector("#attendanceLimit"),
  attendanceNote: document.querySelector("#attendanceNote"),
  closeAttendanceDialog: document.querySelector("#closeAttendanceDialog"),
  cancelAttendanceButton: document.querySelector("#cancelAttendanceButton"),
  statisticsOverview: document.querySelector("#statisticsOverview"),
  courseStatistics: document.querySelector("#courseStatistics"),
  exportDataButton: document.querySelector("#exportDataButton"),
  importDataButton: document.querySelector("#importDataButton"),
  importDataInput: document.querySelector("#importDataInput"),
  installAppButton: document.querySelector("#installAppButton"),
  installDescription: document.querySelector("#installDescription"),
  lessonRemindersEnabled: document.querySelector("#lessonRemindersEnabled"),
  lessonReminderMinutes: document.querySelector("#lessonReminderMinutes"),
  assignmentRemindersEnabled: document.querySelector("#assignmentRemindersEnabled"),
  assignmentReminderMinutes: document.querySelector("#assignmentReminderMinutes"),
};

const VIEW_INDEX = { home: 0, today: 1, week: 2, assignments: 3, notes: 4, grades: 5, attendance: 6, statistics: 7 };
const THEME_KEY = "ders-pusulasi-theme";
const SIDEBAR_KEY = "ders-pusulasi-sidebar-collapsed";
const ASSIGNMENTS_KEY = "ders-pusulasi-assignments";
const GRADES_KEY = "ders-pusulasi-grades";
const GRADE_LOG_KEY = "ders-pusulasi-grade-log";
const ATTENDANCE_KEY = "ders-pusulasi-attendance";
const NOTES_KEY = "ders-pusulasi-course-notes";
const NOTIFICATION_PREFERENCES_KEY = "ders-pusulasi-notification-preferences";
const LOCAL_NOTIFICATIONS_KEY = "ders-pusulasi-local-notifications";
const PUSH_NOTIFICATIONS_KEY = "ders-pusulasi-push-notifications";

function pushApiUrl() {
  return String(window.DERS_PUSULASI_PUSH?.apiUrl || "").trim().replace(/\/$/, "");
}

function supportsWebPush() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const decoded = window.atob(base64);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

function loadNotificationPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTIFICATION_PREFERENCES_KEY) || "null");
    if (saved && typeof saved === "object") {
      state.notificationPreferences = {
        lessonEnabled: saved.lessonEnabled !== false,
        lessonMinutes: [5, 10, 15, 30, 60].includes(Number(saved.lessonMinutes)) ? Number(saved.lessonMinutes) : 15,
        assignmentEnabled: saved.assignmentEnabled !== false,
        assignmentMinutes: [60, 360, 720, 1440, 2880].includes(Number(saved.assignmentMinutes)) ? Number(saved.assignmentMinutes) : 1440,
      };
    }
  } catch (_) {}
}

function renderNotificationPreferences() {
  const preferences = state.notificationPreferences;
  elements.lessonRemindersEnabled.checked = preferences.lessonEnabled;
  elements.lessonReminderMinutes.value = String(preferences.lessonMinutes);
  elements.lessonReminderMinutes.disabled = !preferences.lessonEnabled;
  elements.assignmentRemindersEnabled.checked = preferences.assignmentEnabled;
  elements.assignmentReminderMinutes.value = String(preferences.assignmentMinutes);
  elements.assignmentReminderMinutes.disabled = !preferences.assignmentEnabled;
}

function saveNotificationPreferences() {
  try {
    localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(state.notificationPreferences));
  } catch (_) {
    showToast("Bildirim tercihleri kaydedilemedi.");
  }
}

async function handleNotificationPreferenceChange() {
  state.notificationPreferences = {
    lessonEnabled: elements.lessonRemindersEnabled.checked,
    lessonMinutes: Number(elements.lessonReminderMinutes.value),
    assignmentEnabled: elements.assignmentRemindersEnabled.checked,
    assignmentMinutes: Number(elements.assignmentReminderMinutes.value),
  };
  saveNotificationPreferences();
  renderNotificationPreferences();
  await refreshPushSchedule();
  showToast("Bildirim tercihleri güncellendi.");
}

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

function applySidebarState(collapsed, remember = true) {
  elements.sidebarNav.classList.toggle("collapsed", collapsed);
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  elements.navButtons.forEach((button) => {
    const buttonLabel = button.querySelector("span")?.textContent.trim() || "";
    button.title = collapsed ? buttonLabel : "";
  });
  elements.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  const label = collapsed ? "Menüyü genişlet" : "Menüyü daralt";
  elements.sidebarToggle.setAttribute("aria-label", label);
  elements.sidebarToggle.setAttribute("title", label);
  elements.sidebarToggle.querySelector("span").textContent = label;
  if (remember) {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch (_) {}
  }
}

function toggleSidebar() {
  applySidebarState(!elements.sidebarNav.classList.contains("collapsed"));
}

function switchView(view, updateHistory = true) {
  if (view === "tracking") view = "attendance";
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
  if (window.matchMedia("(max-width: 1050px)").matches) {
    const activeButton = elements.navButtons.find((button) => button.dataset.view === view);
    window.requestAnimationFrame(() => {
      if (!activeButton) return;
      const centeredPosition = activeButton.offsetLeft - (elements.bottomNav.clientWidth - activeButton.offsetWidth) / 2;
      elements.bottomNav.scrollTo({
        left: Math.max(0, centeredPosition),
        behavior: updateHistory ? "smooth" : "auto",
      });
    });
  }
  if (view === "assignments") renderAssignments();
  if (view === "notes") renderNotes();
  if (view === "grades") renderGrades();
  if (view === "attendance") renderAttendance();
  if (view === "statistics") renderStatistics();
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

function isSameDay(first, second) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function renderCalendar() {
  const viewDate = state.calendarViewDate;
  if (!viewDate) return;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  elements.calendarMonthLabel.textContent = new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  elements.calendarDays.replaceChildren();
  const mondayBasedFirstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let index = 0; index < mondayBasedFirstDay; index += 1) {
    const spacer = document.createElement("span");
    spacer.className = "calendar-spacer";
    elements.calendarDays.append(spacer);
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = day;
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(date));
    if (isSameDay(date, today)) button.classList.add("is-today");
    if (state.calendarSelectedDate && isSameDay(date, state.calendarSelectedDate)) {
      button.classList.add("is-selected");
      button.setAttribute("aria-selected", "true");
    }
    button.addEventListener("click", () => {
      const selected = state.calendarSelectedDate || new Date();
      state.calendarSelectedDate = new Date(year, month, day, selected.getHours(), selected.getMinutes());
      renderCalendar();
    });
    elements.calendarDays.append(button);
  }
}

function openDatePicker() {
  const parsed = parseDateTimeInput(elements.assignmentDueDate.value);
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 1);
  fallback.setHours(23, 59, 0, 0);
  state.calendarSelectedDate = parsed || fallback;
  state.calendarViewDate = new Date(state.calendarSelectedDate.getFullYear(), state.calendarSelectedDate.getMonth(), 1);
  elements.calendarHour.value = String(state.calendarSelectedDate.getHours()).padStart(2, "0");
  elements.calendarMinute.value = String(state.calendarSelectedDate.getMinutes()).padStart(2, "0");
  elements.datePicker.hidden = false;
  elements.openDatePickerButton.setAttribute("aria-expanded", "true");
  renderCalendar();
}

function closeDatePicker() {
  elements.datePicker.hidden = true;
  elements.openDatePickerButton.setAttribute("aria-expanded", "false");
}

function changeCalendarMonth(amount) {
  state.calendarViewDate.setMonth(state.calendarViewDate.getMonth() + amount);
  renderCalendar();
}

function selectTodayInCalendar() {
  state.calendarSelectedDate = new Date();
  state.calendarViewDate = new Date(state.calendarSelectedDate.getFullYear(), state.calendarSelectedDate.getMonth(), 1);
  elements.calendarHour.value = String(state.calendarSelectedDate.getHours()).padStart(2, "0");
  elements.calendarMinute.value = String(state.calendarSelectedDate.getMinutes()).padStart(2, "0");
  renderCalendar();
}

function applyCalendarDate() {
  const hours = Number(elements.calendarHour.value);
  const minutes = Number(elements.calendarMinute.value);
  if (!state.calendarSelectedDate || !Number.isInteger(hours) || hours < 0 || hours > 23) {
    elements.calendarHour.focus();
    return;
  }
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    elements.calendarMinute.focus();
    return;
  }
  state.calendarSelectedDate.setHours(hours, minutes, 0, 0);
  elements.assignmentDueDate.value = dateTimeInputValue(state.calendarSelectedDate);
  elements.assignmentDueDate.setCustomValidity("");
  closeDatePicker();
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

function normalizeSearch(value) {
  return String(value || "").toLocaleLowerCase("tr-TR").trim();
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
    .filter((assignment) => {
      const query = normalizeSearch(state.assignmentSearch);
      return !query || normalizeSearch([assignment.title, assignment.course, assignment.description].join(" ")).includes(query);
    })
    .sort((a, b) => Number(a.completed) - Number(b.completed) || new Date(a.dueDate) - new Date(b.dueDate));

  elements.assignmentList.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state assignment-empty";
    empty.textContent = state.assignments.length ? "Arama veya filtreyle eşleşen ödev yok." : "Henüz ödev eklemedin. İlk ödevini ekleyerek başlayabilirsin.";
    elements.assignmentList.append(empty);
    return;
  }
  visible.forEach((assignment) => elements.assignmentList.append(createAssignmentCard(assignment)));
}

function openAssignmentDialog(assignment = null) {
  elements.assignmentForm.reset();
  closeDatePicker();
  elements.assignmentId.value = assignment?.id || "";
  elements.assignmentDialogTitle.textContent = assignment ? "Ödevi düzenle" : "Yeni ödev";
  elements.assignmentName.value = assignment?.title || "";
  ensureCourseOption(assignment?.course || "");
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
  closeDatePicker();
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
  refreshPushSchedule();
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
  refreshPushSchedule();
  showToast(completed ? "Ödev tamamlandı. Harika!" : "Ödev yeniden bekleyenlere alındı.");
}

function deleteAssignment(id) {
  const assignment = state.assignments.find((item) => item.id === id);
  if (!assignment || !window.confirm(`“${assignment.title}” ödevini silmek istiyor musun?`)) return;
  state.assignments = state.assignments.filter((item) => item.id !== id);
  saveAssignments();
  renderAssignments();
  refreshPushSchedule();
  showToast("Ödev silindi.");
}

function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    state.notes = Array.isArray(saved)
      ? saved.filter((note) => note && note.id && note.course && note.title && note.content)
      : [];
  } catch (_) {
    state.notes = [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(state.notes));
  } catch (_) {
    showToast("Ders notları tarayıcıya kaydedilemedi.");
  }
}

function safeNoteUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch (_) {
    return "";
  }
}

function createNoteCard(note) {
  const article = document.createElement("article");
  article.className = "note-card";

  const heading = document.createElement("div");
  heading.className = "note-card-heading";
  const titleGroup = document.createElement("div");
  const course = document.createElement("span");
  course.textContent = note.course;
  const title = document.createElement("h3");
  title.textContent = note.title;
  titleGroup.append(course, title);
  const updated = document.createElement("time");
  updated.dateTime = note.updatedAt || note.createdAt;
  updated.textContent = note.updatedAt || note.createdAt
    ? dateTimeInputValue(note.updatedAt || note.createdAt)
    : "";
  heading.append(titleGroup, updated);

  const content = document.createElement("p");
  content.className = "note-content";
  content.textContent = note.content;
  article.append(heading, content);

  const footer = document.createElement("div");
  footer.className = "note-card-footer";
  const link = safeNoteUrl(note.link);
  if (link) {
    const resource = document.createElement("a");
    resource.href = link;
    resource.target = "_blank";
    resource.rel = "noopener noreferrer";
    resource.textContent = "Kaynağı aç ↗";
    footer.append(resource);
  } else {
    const spacer = document.createElement("span");
    footer.append(spacer);
  }
  const actions = document.createElement("div");
  actions.className = "assignment-actions";
  const edit = document.createElement("button");
  edit.type = "button";
  edit.textContent = "Düzenle";
  edit.addEventListener("click", () => openNoteDialog(note));
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "danger-action";
  remove.textContent = "Sil";
  remove.addEventListener("click", () => deleteNote(note.id));
  actions.append(edit, remove);
  footer.append(actions);
  article.append(footer);
  return article;
}

function renderNotes() {
  const query = normalizeSearch(state.noteSearch);
  const visible = state.notes
    .filter((note) => state.noteCourseFilter === "all" || note.course === state.noteCourseFilter)
    .filter((note) => !query || normalizeSearch(`${note.course} ${note.title} ${note.content}`).includes(query))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  elements.noteList.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.notes.length
      ? "Arama veya ders filtresiyle eşleşen not yok."
      : "Henüz ders notu eklemedin. İlk notunu ekleyerek arşivini oluşturabilirsin.";
    elements.noteList.append(empty);
    return;
  }
  visible.forEach((note) => elements.noteList.append(createNoteCard(note)));
}

function openNoteDialog(note = null) {
  elements.noteForm.reset();
  elements.noteId.value = note?.id || "";
  elements.noteDialogTitle.textContent = note ? "Ders notunu düzenle" : "Yeni ders notu";
  ensureSelectOption(elements.noteCourse, note?.course || "");
  elements.noteCourse.value = note?.course || "";
  elements.noteTitle.value = note?.title || "";
  elements.noteContent.value = note?.content || "";
  elements.noteLink.value = note?.link || "";
  elements.noteDialog.showModal();
  (note ? elements.noteTitle : elements.noteCourse).focus();
}

function closeNoteDialog() {
  elements.noteDialog.close();
}

function handleNoteSubmit(event) {
  event.preventDefault();
  const link = elements.noteLink.value.trim();
  if (link && !safeNoteUrl(link)) {
    elements.noteLink.setCustomValidity("http:// veya https:// ile başlayan geçerli bir bağlantı gir.");
    elements.noteLink.reportValidity();
    return;
  }
  elements.noteLink.setCustomValidity("");
  const existingIndex = state.notes.findIndex((note) => note.id === elements.noteId.value);
  const existing = existingIndex >= 0 ? state.notes[existingIndex] : null;
  const note = {
    id: existing?.id || globalThis.crypto?.randomUUID?.() || `note-${Date.now()}`,
    course: elements.noteCourse.value,
    title: elements.noteTitle.value.trim(),
    content: elements.noteContent.value.trim(),
    link: safeNoteUrl(link),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (!note.course || !note.title || !note.content) return;
  if (existingIndex >= 0) state.notes[existingIndex] = note;
  else state.notes.push(note);
  saveNotes();
  renderNotes();
  closeNoteDialog();
  showToast(existing ? "Ders notu güncellendi." : "Ders notu eklendi.");
}

function deleteNote(id) {
  const note = state.notes.find((item) => item.id === id);
  if (!note || !window.confirm(`“${note.title}” notunu silmek istiyor musun?`)) return;
  state.notes = state.notes.filter((item) => item.id !== id);
  saveNotes();
  renderNotes();
  showToast("Ders notu silindi.");
}

function populateCourseOptions() {
  const selectedCourse = elements.assignmentCourse.value;
  const selectedGradeCourse = elements.gradeCourse.value;
  const selectedNoteCourse = elements.noteCourse.value;
  const selectedNoteFilter = elements.noteCourseFilter.value;
  const courses = [...new Map(state.schedule.courses.map((course) => [course.name, course])).values()]
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  fillCourseSelect(elements.assignmentCourse, courses);
  fillCourseSelect(elements.gradeCourse, courses);
  fillCourseSelect(elements.noteCourse, courses);
  elements.noteCourseFilter.replaceChildren();
  const allCourses = document.createElement("option");
  allCourses.value = "all";
  allCourses.textContent = "Tüm dersler";
  elements.noteCourseFilter.append(allCourses);
  courses.forEach((course) => {
    const option = document.createElement("option");
    option.value = course.name;
    option.textContent = course.code ? `${course.code} · ${course.name}` : course.name;
    elements.noteCourseFilter.append(option);
  });
  ensureCourseOption(selectedCourse);
  ensureGradeCourseOption(selectedGradeCourse);
  ensureSelectOption(elements.noteCourse, selectedNoteCourse);
  elements.assignmentCourse.value = selectedCourse;
  elements.gradeCourse.value = selectedGradeCourse;
  elements.noteCourse.value = selectedNoteCourse;
  elements.noteCourseFilter.value = [...elements.noteCourseFilter.options].some((option) => option.value === selectedNoteFilter)
    ? selectedNoteFilter
    : "all";
  state.noteCourseFilter = elements.noteCourseFilter.value;
}

function fillCourseSelect(select, courses) {
  select.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Programdan ders seç";
  select.append(placeholder);
  courses.forEach((course) => {
    const option = document.createElement("option");
    option.value = course.name;
    option.textContent = course.code ? `${course.code} · ${course.name}` : course.name;
    select.append(option);
  });
}

function ensureCourseOption(courseName) {
  ensureSelectOption(elements.assignmentCourse, courseName);
}

function ensureGradeCourseOption(courseName) {
  ensureSelectOption(elements.gradeCourse, courseName);
}

function ensureSelectOption(select, courseName) {
  if (!courseName || [...select.options].some((option) => option.value === courseName)) return;
  const option = document.createElement("option");
  option.value = courseName;
  option.textContent = courseName;
  select.append(option);
}

function loadGrades() {
  try {
    const savedGrades = JSON.parse(localStorage.getItem(GRADES_KEY) || "[]");
    const savedLog = JSON.parse(localStorage.getItem(GRADE_LOG_KEY) || "[]");
    state.gradeRecords = Array.isArray(savedGrades)
      ? savedGrades.filter((record) => record && record.id && record.course)
      : [];
    state.gradeLog = Array.isArray(savedLog) ? savedLog.slice(0, 50) : [];
  } catch (_) {
    state.gradeRecords = [];
    state.gradeLog = [];
  }
}

function saveGrades() {
  try {
    localStorage.setItem(GRADES_KEY, JSON.stringify(state.gradeRecords));
    localStorage.setItem(GRADE_LOG_KEY, JSON.stringify(state.gradeLog));
  } catch (_) {
    showToast("Not kayıtları tarayıcıya kaydedilemedi.");
  }
}

function addGradeLog(message) {
  state.gradeLog.unshift({
    id: globalThis.crypto?.randomUUID?.() || `grade-log-${Date.now()}`,
    message,
    createdAt: new Date().toISOString(),
  });
  state.gradeLog = state.gradeLog.slice(0, 50);
}

function calculateGrade(record) {
  const midterm = Number(record.midtermGrade);
  const midtermWeight = Number(record.midtermWeight);
  const finalWeight = Number(record.finalWeight);
  const passingGrade = Number(record.passingGrade);
  const minimumFinal = Number(record.minimumFinal);
  const hasFinal = record.finalGrade !== null && record.finalGrade !== "" && Number.isFinite(Number(record.finalGrade));
  const finalGrade = hasFinal ? Number(record.finalGrade) : null;
  const weightsValid = midtermWeight + finalWeight === 100 && finalWeight > 0;
  const midtermContribution = midterm * (midtermWeight / 100);
  const rawRequiredFinal = (passingGrade - midtermContribution) / (finalWeight / 100);
  const requiredFinal = Math.max(minimumFinal, Math.ceil(rawRequiredFinal));
  const average = hasFinal ? midtermContribution + finalGrade * (finalWeight / 100) : null;
  const passed = hasFinal && weightsValid && finalGrade >= minimumFinal && average >= passingGrade;
  return {
    hasFinal,
    weightsValid,
    midtermContribution,
    requiredFinal,
    average,
    passed,
    failed: hasFinal && weightsValid && !passed,
  };
}

function formatScore(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function gradeDraftFromForm() {
  return {
    course: elements.gradeCourse.value,
    midtermGrade: elements.midtermGrade.value === "" ? null : Number(elements.midtermGrade.value),
    midtermWeight: Number(elements.midtermWeight.value),
    finalGrade: elements.finalGrade.value === "" ? null : Number(elements.finalGrade.value),
    finalWeight: Number(elements.finalWeight.value),
    passingGrade: Number(elements.passingGrade.value),
    minimumFinal: Number(elements.minimumFinal.value),
  };
}

function validateIntegerGradeInputs() {
  const inputs = [elements.midtermGrade, elements.finalGrade, elements.passingGrade, elements.minimumFinal];
  let valid = true;
  inputs.forEach((input) => {
    const isInteger = input.value === "" || Number.isInteger(Number(input.value));
    input.setCustomValidity(isInteger ? "" : "Notlar tam sayı olmalı.");
    valid = valid && isInteger;
  });
  return valid;
}

function updateGradePreview() {
  const draft = gradeDraftFromForm();
  elements.gradePreview.className = "grade-preview";
  if (draft.midtermGrade === null || !Number.isFinite(draft.midtermGrade)) {
    elements.gradePreview.textContent = "Vize notunu girerek hesabı başlatabilirsin.";
    return;
  }
  const result = calculateGrade(draft);
  if (!result.weightsValid) {
    elements.gradePreview.classList.add("warning");
    elements.gradePreview.textContent = "Vize ve final ağırlıklarının toplamı %100 olmalı.";
    return;
  }
  if (!result.hasFinal) {
    elements.gradePreview.classList.add(result.requiredFinal > 100 ? "failed" : "pending");
    elements.gradePreview.textContent = result.requiredFinal > 100
      ? "Bu değerlere göre finalden 100 alsan bile geçme notuna ulaşılamıyor."
      : `Geçmek için finalden en az ${formatScore(result.requiredFinal)} almalısın.`;
    return;
  }
  elements.gradePreview.classList.add(result.passed ? "passed" : "failed");
  elements.gradePreview.textContent = result.passed
    ? `Ağırlıklı ortalaman ${formatScore(result.average)} — geçiyorsun.`
    : `Ağırlıklı ortalaman ${formatScore(result.average)} — şu an kalıyorsun.`;
}

function createGradeCard(record) {
  const result = calculateGrade(record);
  const article = document.createElement("article");
  article.className = `grade-card ${result.hasFinal ? (result.passed ? "is-passed" : "is-failed") : "is-pending"}`;

  const heading = document.createElement("div");
  heading.className = "grade-card-heading";
  const titleGroup = document.createElement("div");
  const overline = document.createElement("span");
  overline.textContent = result.hasFinal ? "SINAV SONUCU" : "FİNAL HEDEFİ";
  const title = document.createElement("h3");
  title.textContent = record.course;
  titleGroup.append(overline, title);
  const status = document.createElement("strong");
  status.className = "grade-status";
  status.textContent = result.hasFinal ? (result.passed ? "GEÇTİ" : "KALDI") : "BEKLİYOR";
  heading.append(titleGroup, status);

  const resultBox = document.createElement("div");
  resultBox.className = "grade-result-box";
  const resultValue = document.createElement("strong");
  const resultLabel = document.createElement("span");
  if (result.hasFinal) {
    resultValue.textContent = formatScore(result.average);
    resultLabel.textContent = "Ağırlıklı ortalama";
  } else if (result.requiredFinal > 100) {
    resultValue.textContent = ">100";
    resultLabel.textContent = "Gerekli final — geçmek mümkün görünmüyor";
  } else {
    resultValue.textContent = formatScore(result.requiredFinal);
    resultLabel.textContent = "Finalden alman gereken en düşük not";
  }
  resultBox.append(resultValue, resultLabel);

  const details = document.createElement("div");
  details.className = "grade-details";
  const detailItems = [
    ["Vize", `${formatScore(Number(record.midtermGrade))} · %${record.midtermWeight}`],
    ["Final", result.hasFinal ? `${formatScore(Number(record.finalGrade))} · %${record.finalWeight}` : `Bekleniyor · %${record.finalWeight}`],
    ["Geçme notu", formatScore(Number(record.passingGrade))],
    ["Final barajı", formatScore(Number(record.minimumFinal))],
  ];
  detailItems.forEach(([label, value]) => {
    const item = document.createElement("div");
    const labelElement = document.createElement("span");
    const valueElement = document.createElement("strong");
    labelElement.textContent = label;
    valueElement.textContent = value;
    item.append(labelElement, valueElement);
    details.append(item);
  });

  const actions = document.createElement("div");
  actions.className = "grade-actions assignment-actions";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Düzenle";
  editButton.addEventListener("click", () => openGradeDialog(record));
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger-action";
  deleteButton.textContent = "Sil";
  deleteButton.addEventListener("click", () => deleteGradeRecord(record.id));
  actions.append(editButton, deleteButton);
  article.append(heading, resultBox, details, actions);
  return article;
}

function renderGradeLog() {
  elements.gradeLogCount.textContent = `${state.gradeLog.length} kayıt`;
  elements.gradeLogList.replaceChildren();
  if (!state.gradeLog.length) {
    const empty = document.createElement("p");
    empty.className = "grade-log-empty";
    empty.textContent = "Henüz hesaplama kaydı yok.";
    elements.gradeLogList.append(empty);
    return;
  }
  state.gradeLog.forEach((entry) => {
    const item = document.createElement("div");
    const message = document.createElement("p");
    const time = document.createElement("time");
    message.textContent = entry.message;
    time.dateTime = entry.createdAt;
    time.textContent = dateTimeInputValue(entry.createdAt);
    item.append(message, time);
    elements.gradeLogList.append(item);
  });
}

function renderGrades() {
  const results = state.gradeRecords.map((record) => calculateGrade(record));
  const finalised = results.filter((result) => result.hasFinal && result.weightsValid);
  const passed = finalised.filter((result) => result.passed).length;
  const failed = finalised.length - passed;
  elements.gradeTotal.textContent = state.gradeRecords.length;
  elements.gradePassed.textContent = passed;
  elements.gradeFailed.textContent = failed;
  elements.gradeSuccessRate.textContent = finalised.length ? `%${Math.round((passed / finalised.length) * 100)}` : "—";
  elements.gradeList.replaceChildren();
  const visible = state.gradeRecords
    .filter((record) => !normalizeSearch(state.gradeSearch) || normalizeSearch(record.course).includes(normalizeSearch(state.gradeSearch)))
    .filter((record) => {
      if (state.gradeStatusFilter === "all") return true;
      const result = calculateGrade(record);
      if (state.gradeStatusFilter === "pending") return !result.hasFinal;
      if (state.gradeStatusFilter === "passed") return result.passed;
      return result.failed;
    });
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.gradeRecords.length
      ? "Arama veya filtreyle eşleşen not kaydı yok."
      : "Henüz sınav sonucu eklemedin. Bir ders ekleyerek final hedefini hesaplayabilirsin.";
    elements.gradeList.append(empty);
  } else {
    [...visible]
      .sort((a, b) => a.course.localeCompare(b.course, "tr"))
      .forEach((record) => elements.gradeList.append(createGradeCard(record)));
  }
  renderGradeLog();
}

function openGradeDialog(record = null) {
  elements.gradeForm.reset();
  elements.gradeId.value = record?.id || "";
  elements.gradeDialogTitle.textContent = record ? "Ders sonucunu düzenle" : "Ders sonucu ekle";
  ensureGradeCourseOption(record?.course || "");
  elements.gradeCourse.value = record?.course || "";
  elements.midtermGrade.value = record?.midtermGrade ?? "";
  elements.midtermWeight.value = record?.midtermWeight ?? 40;
  elements.finalGrade.value = record?.finalGrade ?? "";
  elements.finalWeight.value = record?.finalWeight ?? 60;
  elements.passingGrade.value = record?.passingGrade ?? 60;
  elements.minimumFinal.value = record?.minimumFinal ?? 50;
  elements.gradeCourse.setCustomValidity("");
  elements.finalWeight.setCustomValidity("");
  validateIntegerGradeInputs();
  updateGradePreview();
  elements.gradeDialog.showModal();
  elements.gradeCourse.focus();
}

function closeGradeDialog() {
  elements.gradeDialog.close();
}

function handleGradeSubmit(event) {
  event.preventDefault();
  if (!validateIntegerGradeInputs()) {
    elements.gradeForm.reportValidity();
    return;
  }
  const draft = gradeDraftFromForm();
  const result = calculateGrade(draft);
  if (!result.weightsValid) {
    elements.finalWeight.setCustomValidity("Vize ve final ağırlıklarının toplamı %100 olmalı.");
    elements.finalWeight.reportValidity();
    return;
  }
  elements.finalWeight.setCustomValidity("");
  const duplicate = state.gradeRecords.find((record) => record.course === draft.course && record.id !== elements.gradeId.value);
  if (duplicate) {
    elements.gradeCourse.setCustomValidity("Bu ders için zaten bir not kaydı bulunuyor.");
    elements.gradeCourse.reportValidity();
    return;
  }
  elements.gradeCourse.setCustomValidity("");
  const existingIndex = state.gradeRecords.findIndex((record) => record.id === elements.gradeId.value);
  const existing = existingIndex >= 0 ? state.gradeRecords[existingIndex] : null;
  const record = {
    id: existing?.id || globalThis.crypto?.randomUUID?.() || `grade-${Date.now()}`,
    ...draft,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) state.gradeRecords[existingIndex] = record;
  else state.gradeRecords.push(record);
  const savedResult = calculateGrade(record);
  const logResult = savedResult.hasFinal
    ? `${formatScore(savedResult.average)} ortalama ile ${savedResult.passed ? "geçti" : "kaldı"}`
    : savedResult.requiredFinal > 100 ? "geçme hedefi 100'ün üzerinde" : `gerekli final ${formatScore(savedResult.requiredFinal)}`;
  addGradeLog(`${record.course}: ${logResult}.`);
  saveGrades();
  renderGrades();
  closeGradeDialog();
  showToast(existing ? "Not hesabı güncellendi." : "Not hesabı kaydedildi.");
}

function deleteGradeRecord(id) {
  const record = state.gradeRecords.find((item) => item.id === id);
  if (!record || !window.confirm(`“${record.course}” not kaydını silmek istiyor musun?`)) return;
  state.gradeRecords = state.gradeRecords.filter((item) => item.id !== id);
  addGradeLog(`${record.course}: not kaydı silindi.`);
  saveGrades();
  renderGrades();
  showToast("Not kaydı silindi.");
}

function loadAttendance() {
  try {
    const saved = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || "[]");
    state.attendanceRecords = Array.isArray(saved)
      ? saved.filter((record) => record && record.course).map((record) => ({
          ...record,
          course: String(record.course),
          code: String(record.code || ""),
          absent: Math.max(0, Number(record.absent) || 0),
          limit: Math.max(1, Number(record.limit) || 4),
          note: String(record.note || ""),
        }))
      : [];
  } catch (_) {
    state.attendanceRecords = [];
  }
}

function saveAttendance() {
  try {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(state.attendanceRecords));
  } catch (_) {
    showToast("Devamsızlık kayıtları tarayıcıya kaydedilemedi.");
  }
}

function uniqueScheduleCourses() {
  if (!state.schedule?.courses) return [];
  return [...new Map(state.schedule.courses.map((course) => [course.name, course])).values()]
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

function synchroniseAttendance() {
  uniqueScheduleCourses().forEach((course) => {
    const existing = state.attendanceRecords.find((record) => record.course === course.name);
    if (existing) {
      existing.code = course.code || existing.code || "";
      return;
    }
    state.attendanceRecords.push({
      course: course.name,
      code: course.code || "",
      absent: 0,
      limit: 4,
      note: "",
      updatedAt: new Date().toISOString(),
    });
  });
  saveAttendance();
}

function attendanceStatus(record) {
  const absent = Math.max(0, Number(record.absent) || 0);
  const limit = Math.max(1, Number(record.limit) || 1);
  const ratio = absent / limit;
  if (absent > limit) return { label: "KALDI", className: "over-limit", ratio, failed: true };
  if (absent === limit) return { label: "Sınırda", className: "danger", ratio, failed: false };
  if (ratio >= 0.75) return { label: "Riskli", className: "warning", ratio, failed: false };
  return { label: "Güvenli", className: "safe", ratio, failed: false };
}

function updateAttendance(course, change) {
  const record = state.attendanceRecords.find((item) => item.course === course);
  if (!record) return;
  record.absent = Math.max(0, (Number(record.absent) || 0) + change);
  record.updatedAt = new Date().toISOString();
  saveAttendance();
  renderAttendance();
  renderStatistics();
  const status = attendanceStatus(record);
  showToast(status.failed && change > 0
    ? "Devamsızlık sınırı aşıldı: dersten kaldın."
    : change > 0 ? "Devamsızlık eklendi." : "Devamsızlık azaltıldı.");
}

function createAttendanceCard(record) {
  const status = attendanceStatus(record);
  const remaining = Math.max(0, Number(record.limit) - Number(record.absent));
  const article = document.createElement("article");
  article.className = `attendance-card ${status.className}`;

  const heading = document.createElement("div");
  heading.className = "attendance-card-heading";
  const titleGroup = document.createElement("div");
  const code = document.createElement("span");
  code.textContent = record.code || "DERS";
  const title = document.createElement("h3");
  title.textContent = record.course;
  titleGroup.append(code, title);
  const badge = document.createElement("strong");
  badge.textContent = status.label;
  badge.className = "attendance-status";
  heading.append(titleGroup, badge);

  const numbers = document.createElement("div");
  numbers.className = "attendance-numbers";
  const used = document.createElement("div");
  used.innerHTML = `<strong>${Number(record.absent) || 0}</strong><span>Kullanılan</span>`;
  const left = document.createElement("div");
  left.innerHTML = `<strong>${remaining}</strong><span>Kalan hak</span>`;
  const total = document.createElement("div");
  total.innerHTML = `<strong>${Number(record.limit) || 0}</strong><span>Sınır</span>`;
  numbers.append(used, left, total);

  const progress = document.createElement("div");
  progress.className = "attendance-progress";
  const progressBar = document.createElement("span");
  progressBar.style.width = `${Math.min(100, status.ratio * 100)}%`;
  progress.append(progressBar);

  const footer = document.createElement("div");
  footer.className = "attendance-card-footer";
  const controls = document.createElement("div");
  controls.className = "attendance-stepper";
  const minus = document.createElement("button");
  minus.type = "button";
  minus.textContent = "−";
  minus.disabled = Number(record.absent) <= 0;
  minus.setAttribute("aria-label", `${record.course} devamsızlığını azalt`);
  minus.addEventListener("click", () => updateAttendance(record.course, -1));
  const plus = document.createElement("button");
  plus.type = "button";
  plus.textContent = "+ Devamsızlık";
  plus.addEventListener("click", () => updateAttendance(record.course, 1));
  controls.append(minus, plus);
  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "attendance-edit";
  edit.textContent = "Düzenle";
  edit.addEventListener("click", () => openAttendanceDialog(record));
  footer.append(controls, edit);

  article.append(heading, numbers, progress);
  if (record.note) {
    const note = document.createElement("p");
    note.className = "attendance-note";
    note.textContent = record.note;
    article.append(note);
  }
  article.append(footer);
  return article;
}

function renderAttendance() {
  const records = state.attendanceRecords;
  const risky = records.filter((record) => attendanceStatus(record).ratio >= 0.75).length;
  elements.attendanceCourseCount.textContent = records.length;
  elements.attendanceUsed.textContent = records.reduce((sum, record) => sum + (Number(record.absent) || 0), 0);
  elements.attendanceRisk.textContent = risky;
  const query = normalizeSearch(state.attendanceSearch);
  const visible = records
    .filter((record) => !query || normalizeSearch(`${record.course} ${record.code}`).includes(query))
    .sort((a, b) => a.course.localeCompare(b.course, "tr"));
  elements.attendanceList.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = records.length ? "Aramayla eşleşen ders yok." : "Ders programı yüklendiğinde devamsızlık takibi burada başlayacak.";
    elements.attendanceList.append(empty);
    return;
  }
  visible.forEach((record) => elements.attendanceList.append(createAttendanceCard(record)));
}

function openAttendanceDialog(record) {
  elements.attendanceDialogTitle.textContent = "Devamsızlığı düzenle";
  elements.attendanceDialogCourse.textContent = record.code ? `${record.code} · ${record.course}` : record.course;
  elements.attendanceCourse.value = record.course;
  elements.attendanceAbsent.value = Number(record.absent) || 0;
  elements.attendanceLimit.value = Number(record.limit) || 4;
  elements.attendanceNote.value = record.note || "";
  elements.attendanceDialog.showModal();
  elements.attendanceAbsent.focus();
}

function closeAttendanceDialog() {
  elements.attendanceDialog.close();
}

function handleAttendanceSubmit(event) {
  event.preventDefault();
  const record = state.attendanceRecords.find((item) => item.course === elements.attendanceCourse.value);
  if (!record) return;
  record.absent = Math.max(0, Number(elements.attendanceAbsent.value));
  record.limit = Math.max(1, Number(elements.attendanceLimit.value));
  record.note = elements.attendanceNote.value.trim();
  record.updatedAt = new Date().toISOString();
  saveAttendance();
  renderAttendance();
  renderStatistics();
  closeAttendanceDialog();
  showToast("Devamsızlık bilgisi güncellendi.");
}

function createMetricCard(value, label, detail, tone = "") {
  const card = document.createElement("article");
  card.className = `metric-card ${tone}`.trim();
  const strong = document.createElement("strong");
  strong.textContent = value;
  const title = document.createElement("span");
  title.textContent = label;
  const small = document.createElement("small");
  small.textContent = detail;
  card.append(strong, title, small);
  return card;
}

function renderStatistics() {
  const assignmentCompleted = state.assignments.filter((item) => item.completed).length;
  const assignmentRate = state.assignments.length ? Math.round((assignmentCompleted / state.assignments.length) * 100) : 0;
  const gradeResults = state.gradeRecords.map((record) => calculateGrade(record)).filter((result) => result.hasFinal && result.weightsValid);
  const gradeAverage = gradeResults.length
    ? gradeResults.reduce((sum, result) => sum + result.average, 0) / gradeResults.length
    : null;
  const passed = gradeResults.filter((result) => result.passed).length;
  const attendanceUsed = state.attendanceRecords.reduce((sum, record) => sum + (Number(record.absent) || 0), 0);
  const attendanceLimit = state.attendanceRecords.reduce((sum, record) => sum + (Number(record.limit) || 0), 0);
  const attendanceRate = attendanceLimit ? Math.round((attendanceUsed / attendanceLimit) * 100) : 0;
  const overdue = state.assignments.filter((item) => !item.completed && new Date(item.dueDate) < new Date()).length;

  elements.statisticsOverview.replaceChildren(
    createMetricCard(`%${assignmentRate}`, "Ödev tamamlama", `${assignmentCompleted}/${state.assignments.length} ödev tamamlandı`, assignmentRate >= 75 ? "positive" : ""),
    createMetricCard(gradeAverage === null ? "—" : formatScore(gradeAverage), "Not ortalaması", `${passed}/${gradeResults.length} ders geçildi`, gradeAverage !== null && gradeAverage >= 60 ? "positive" : ""),
    createMetricCard(`%${attendanceRate}`, "Devamsızlık kullanımı", `${attendanceUsed}/${attendanceLimit || 0} oturum kullanıldı`, attendanceRate >= 75 ? "negative" : ""),
    createMetricCard(String(overdue), "Geciken ödev", overdue ? "İlgilenmen gereken görev var" : "Geciken görevin yok", overdue ? "negative" : "positive"),
  );

  const courseNames = new Set([
    ...uniqueScheduleCourses().map((course) => course.name),
    ...state.gradeRecords.map((record) => record.course),
    ...state.attendanceRecords.map((record) => record.course),
  ]);
  elements.courseStatistics.replaceChildren();
  if (!courseNames.size) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "İstatistik oluşturmak için henüz yeterli veri yok.";
    elements.courseStatistics.append(empty);
    return;
  }
  [...courseNames].sort((a, b) => a.localeCompare(b, "tr")).forEach((courseName) => {
    const grade = state.gradeRecords.find((record) => record.course === courseName);
    const gradeResult = grade ? calculateGrade(grade) : null;
    const attendance = state.attendanceRecords.find((record) => record.course === courseName);
    const assignments = state.assignments.filter((item) => item.course === courseName);
    const completed = assignments.filter((item) => item.completed).length;
    const score = gradeResult?.hasFinal ? Math.max(0, Math.min(100, gradeResult.average)) : null;
    const row = document.createElement("article");
    row.className = "course-stat-row";
    const heading = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = courseName;
    const detail = document.createElement("p");
    const attendanceResult = attendance ? attendanceStatus(attendance) : null;
    detail.textContent = `Ödev ${completed}/${assignments.length} · Devamsızlık ${attendance?.absent || 0}/${attendance?.limit || 0}${attendanceResult?.failed ? " · KALDI" : ""}`;
    heading.append(title, detail);
    const gradeText = document.createElement("strong");
    gradeText.textContent = score === null ? "Not yok" : formatScore(score);
    const bar = document.createElement("div");
    bar.className = "course-stat-bar";
    const fill = document.createElement("span");
    fill.style.width = `${score || 0}%`;
    bar.append(fill);
    row.append(heading, gradeText, bar);
    elements.courseStatistics.append(row);
  });
}

function exportAppData() {
  const backup = {
    app: "Ders Pusulası",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      assignments: state.assignments,
      grades: state.gradeRecords,
      gradeLog: state.gradeLog,
      attendance: state.attendanceRecords,
      courseNotes: state.notes,
      notificationPreferences: state.notificationPreferences,
      theme: document.documentElement.dataset.theme || "light",
    },
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `ders-pusulasi-yedek-${date}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Yedek dosyası indirildi.");
}

async function importAppData(file) {
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    if (backup?.app !== "Ders Pusulası" || backup?.version !== 1 || !backup.data) {
      throw new Error("Bu dosya geçerli bir Ders Pusulası yedeği değil.");
    }
    const { assignments, grades, gradeLog, attendance, courseNotes = [], notificationPreferences = null, theme } = backup.data;
    if (![assignments, grades, gradeLog, attendance].every(Array.isArray)) {
      throw new Error("Yedek dosyasındaki kayıt yapısı geçersiz.");
    }
    if (!Array.isArray(courseNotes)) throw new Error("Yedekteki ders notları geçersiz.");
    if (!window.confirm("Bu yedek mevcut ödev, ders notu, sınav ve devamsızlık kayıtlarının üzerine yazacak. Devam edilsin mi?")) return;
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
    localStorage.setItem(GRADES_KEY, JSON.stringify(grades));
    localStorage.setItem(GRADE_LOG_KEY, JSON.stringify(gradeLog));
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
    localStorage.setItem(NOTES_KEY, JSON.stringify(courseNotes));
    if (notificationPreferences && typeof notificationPreferences === "object") {
      localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(notificationPreferences));
    }
    if (theme === "dark" || theme === "light") localStorage.setItem(THEME_KEY, theme);
    showToast("Yedek geri yüklendi. Sayfa yenileniyor…");
    window.setTimeout(() => location.reload(), 700);
  } catch (error) {
    showToast(error.message || "Yedek dosyası okunamadı.");
  } finally {
    elements.importDataInput.value = "";
  }
}

function isAppInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updateInstallButton() {
  if (isAppInstalled()) {
    elements.installAppButton.disabled = true;
    elements.installAppButton.textContent = "Uygulama kurulu";
    elements.installDescription.textContent = "Ders Pusulası bu cihazda uygulama olarak çalışıyor.";
    return;
  }
  if (state.installPrompt) {
    elements.installAppButton.disabled = false;
    elements.installAppButton.textContent = "Uygulamayı kur";
    elements.installDescription.textContent = "Ders Pusulası'nı ana ekranına ekleyip uygulama gibi aç.";
    return;
  }
  elements.installAppButton.disabled = true;
  elements.installAppButton.textContent = "Tarayıcı menüsünden ekle";
  elements.installDescription.textContent = "Kurulum düğmesi görünmüyorsa tarayıcı menüsündeki “Ana ekrana ekle” seçeneğini kullan.";
}

async function installApp() {
  if (!state.installPrompt) return;
  const prompt = state.installPrompt;
  state.installPrompt = null;
  await prompt.prompt();
  updateInstallButton();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 3500);
}

function notificationKey(course) {
  return `notified:${course.code}:${course.startDate.toISOString().slice(0, 10)}:${course.start}:${state.notificationPreferences.lessonMinutes}`;
}

function assignmentNotificationKey(assignment) {
  return `notified:assignment:${assignment.id}:${assignment.dueDate}:${state.notificationPreferences.assignmentMinutes}`;
}

function checkNotifications(now) {
  if (
    !("Notification" in window)
    || Notification.permission !== "granted"
    || localStorage.getItem(LOCAL_NOTIFICATIONS_KEY) !== "1"
    || localStorage.getItem(PUSH_NOTIFICATIONS_KEY) === "1"
  ) return;
  const preferences = state.notificationPreferences;
  if (preferences.lessonEnabled && state.schedule?.courses) {
    const soon = getOccurrences(now).find((course) => {
      const difference = course.startDate - now;
      return difference > 0
        && difference <= preferences.lessonMinutes * 60 * 1000
        && !localStorage.getItem(notificationKey(course));
    });
    if (soon) {
      new Notification(`${soon.name} ${preferences.lessonMinutes} dakika içinde`, {
        body: `${formatClockTime(soon.start)} · ${soon.room || "Derslik bilgisini kontrol et"}`,
        icon: "assets/favicon.svg",
        tag: notificationKey(soon),
      });
      localStorage.setItem(notificationKey(soon), "1");
    }
  }
  if (preferences.assignmentEnabled) {
    const assignment = state.assignments.find((item) => {
      if (item.completed) return false;
      const difference = new Date(item.dueDate) - now;
      return difference > 0
        && difference <= preferences.assignmentMinutes * 60 * 1000
        && !localStorage.getItem(assignmentNotificationKey(item));
    });
    if (assignment) {
      new Notification(`Ödev teslimi yaklaşıyor: ${assignment.title}`, {
        body: `${assignment.course || "Ödev"} · ${formatAssignmentDate(assignment.dueDate)}`,
        icon: "assets/favicon.svg",
        tag: assignmentNotificationKey(assignment),
      });
      localStorage.setItem(assignmentNotificationKey(assignment), "1");
    }
  }
}

async function getPushSubscription() {
  if (!supportsWebPush()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

function notificationItemsForPush() {
  if (!state.schedule?.courses) return [];
  const preferences = state.notificationPreferences;
  const courses = preferences.lessonEnabled
    ? state.schedule.courses.map((course) => ({
        ...course,
        type: "course",
        reminderMinutes: preferences.lessonMinutes,
      }))
    : [];
  const assignments = preferences.assignmentEnabled
    ? state.assignments.flatMap((assignment) => {
        if (assignment.completed) return [];
        const dueDate = new Date(assignment.dueDate);
        if (Number.isNaN(dueDate.getTime()) || dueDate <= new Date()) return [];
        return [{
          type: "assignment",
          id: assignment.id,
          name: assignment.title,
          course: assignment.course,
          dueAt: dueDate.toISOString(),
          reminderMinutes: preferences.assignmentMinutes,
        }];
      })
    : [];
  return [...courses, ...assignments];
}

async function syncPushSubscription(subscription) {
  const apiUrl = pushApiUrl();
  if (!apiUrl || !subscription || !state.schedule?.courses) return;
  const response = await fetch(`${apiUrl}/subscriptions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      schedule: notificationItemsForPush(),
      timezone: state.schedule.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });
  if (!response.ok) throw new Error("Bildirim aboneliği sunucuya kaydedilemedi.");
}

async function refreshPushSchedule() {
  if (!pushApiUrl() || localStorage.getItem(PUSH_NOTIFICATIONS_KEY) !== "1" || !state.schedule) return;
  try {
    const subscription = await getPushSubscription();
    if (subscription) await syncPushSubscription(subscription);
  } catch (error) {
    console.warn("Bildirim programı eşitlenemedi.", error);
  }
}

async function enablePushNotifications() {
  if (!supportsWebPush()) throw new Error("Bu tarayıcı arka plan bildirimlerini desteklemiyor.");
  const apiUrl = pushApiUrl();
  const configResponse = await fetch(`${apiUrl}/config`, { cache: "no-store" });
  if (!configResponse.ok) throw new Error("Bildirim sunucusuna ulaşılamadı.");
  const { vapidPublicKey } = await configResponse.json();
  if (!vapidPublicKey) throw new Error("Bildirim sunucusu henüz yapılandırılmamış.");

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }
  await syncPushSubscription(subscription);
  localStorage.setItem(PUSH_NOTIFICATIONS_KEY, "1");
  localStorage.removeItem(LOCAL_NOTIFICATIONS_KEY);
}

async function disablePushNotifications(subscription) {
  const apiUrl = pushApiUrl();
  if (apiUrl) {
    try {
      await fetch(`${apiUrl}/subscriptions`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    } catch (error) {
      console.warn("Bildirim kaydı sunucudan kaldırılamadı.", error);
    }
  }
  await subscription.unsubscribe();
  localStorage.removeItem(PUSH_NOTIFICATIONS_KEY);
}

async function handleNotificationButton() {
  if (!("Notification" in window)) {
    showToast("Bu tarayıcı bildirimleri desteklemiyor.");
    return;
  }
  if (Notification.permission === "denied") {
    showToast("Bildirimler tarayıcı ayarlarından engellenmiş.");
    return;
  }
  try {
    if (pushApiUrl()) {
      const existing = await getPushSubscription();
      if (existing && localStorage.getItem(PUSH_NOTIFICATIONS_KEY) === "1") {
        await disablePushNotifications(existing);
        showToast("Arka plan bildirimleri kapatıldı.");
        await updateNotificationButton();
        return;
      }
    } else if (localStorage.getItem(LOCAL_NOTIFICATIONS_KEY) === "1") {
      localStorage.removeItem(LOCAL_NOTIFICATIONS_KEY);
      showToast("Bildirimler kapatıldı.");
      await updateNotificationButton();
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      await updateNotificationButton();
      return;
    }
    if (pushApiUrl()) {
      await enablePushNotifications();
      showToast("Bildirimler açık. Seçtiğin ders ve ödev zamanlarında haber vereceğim.");
    } else {
      localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, "1");
      showToast("Bildirimler açık. Sunucu kurulana kadar sayfa açıkken haber vereceğim.");
      checkNotifications(new Date());
    }
  } catch (error) {
    console.error(error);
    showToast(error.message || "Bildirimler açılamadı.");
  } finally {
    await updateNotificationButton();
  }
}

async function updateNotificationButton() {
  let enabled = false;
  if ("Notification" in window && Notification.permission === "granted") {
    if (pushApiUrl()) {
      try {
        enabled = Boolean(await getPushSubscription()) && localStorage.getItem(PUSH_NOTIFICATIONS_KEY) === "1";
      } catch (_) {
        enabled = false;
      }
    } else {
      enabled = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY) === "1";
    }
  }
  elements.notificationButton.classList.toggle("enabled", enabled);
  elements.notificationLabel.textContent = enabled ? "Bildirimler açık" : "Bildirimleri aç";
  const accessibleLabel = enabled ? "Ders ve ödev bildirimleri açık" : "Ders ve ödev bildirimlerini aç";
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
  loadNotificationPreferences();
  renderNotificationPreferences();
  loadAssignments();
  renderAssignments();
  loadNotes();
  renderNotes();
  loadGrades();
  renderGrades();
  loadAttendance();
  renderAttendance();
  renderStatistics();
  updateInstallButton();
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
    renderNotes();
    synchroniseAttendance();
    renderAttendance();
    renderStatistics();
    await updateNotificationButton();
    if (pushApiUrl() && localStorage.getItem(PUSH_NOTIFICATIONS_KEY) === "1") {
      try {
        const subscription = await getPushSubscription();
        if (subscription) await syncPushSubscription(subscription);
      } catch (error) {
        console.warn("Ders programı bildirim sunucusuyla eşitlenemedi.", error);
      }
    }
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

elements.notificationButton.addEventListener("click", handleNotificationButton);
elements.themeButton.addEventListener("click", toggleTheme);
elements.settingsButton.addEventListener("click", () => {
  updateInstallButton();
  renderNotificationPreferences();
  elements.settingsDialog.showModal();
});
elements.closeSettingsDialog.addEventListener("click", () => elements.settingsDialog.close());
elements.settingsDialog.addEventListener("click", (event) => {
  if (event.target === elements.settingsDialog) elements.settingsDialog.close();
});
elements.addAssignmentButton.addEventListener("click", () => openAssignmentDialog());
elements.closeAssignmentDialog.addEventListener("click", closeAssignmentDialog);
elements.cancelAssignmentButton.addEventListener("click", closeAssignmentDialog);
elements.assignmentForm.addEventListener("submit", handleAssignmentSubmit);
elements.assignmentSearch.addEventListener("input", () => {
  state.assignmentSearch = elements.assignmentSearch.value;
  renderAssignments();
});
elements.addNoteButton.addEventListener("click", () => openNoteDialog());
elements.closeNoteDialog.addEventListener("click", closeNoteDialog);
elements.cancelNoteButton.addEventListener("click", closeNoteDialog);
elements.noteForm.addEventListener("submit", handleNoteSubmit);
elements.noteDialog.addEventListener("click", (event) => {
  if (event.target === elements.noteDialog) closeNoteDialog();
});
elements.noteLink.addEventListener("input", () => elements.noteLink.setCustomValidity(""));
elements.noteSearch.addEventListener("input", () => {
  state.noteSearch = elements.noteSearch.value;
  renderNotes();
});
elements.noteCourseFilter.addEventListener("change", () => {
  state.noteCourseFilter = elements.noteCourseFilter.value;
  renderNotes();
});
elements.addGradeButton.addEventListener("click", () => openGradeDialog());
elements.closeGradeDialog.addEventListener("click", closeGradeDialog);
elements.cancelGradeButton.addEventListener("click", closeGradeDialog);
elements.gradeForm.addEventListener("submit", handleGradeSubmit);
[
  elements.midtermGrade,
  elements.midtermWeight,
  elements.finalGrade,
  elements.finalWeight,
  elements.passingGrade,
  elements.minimumFinal,
].forEach((input) => {
  input.addEventListener("input", () => {
    elements.finalWeight.setCustomValidity("");
    validateIntegerGradeInputs();
    updateGradePreview();
  });
});
elements.gradeCourse.addEventListener("change", () => elements.gradeCourse.setCustomValidity(""));
elements.gradeDialog.addEventListener("click", (event) => {
  if (event.target === elements.gradeDialog) closeGradeDialog();
});
elements.gradeSearch.addEventListener("input", () => {
  state.gradeSearch = elements.gradeSearch.value;
  renderGrades();
});
elements.gradeStatusFilter.addEventListener("change", () => {
  state.gradeStatusFilter = elements.gradeStatusFilter.value;
  renderGrades();
});
elements.attendanceSearch.addEventListener("input", () => {
  state.attendanceSearch = elements.attendanceSearch.value;
  renderAttendance();
});
elements.attendanceForm.addEventListener("submit", handleAttendanceSubmit);
elements.closeAttendanceDialog.addEventListener("click", closeAttendanceDialog);
elements.cancelAttendanceButton.addEventListener("click", closeAttendanceDialog);
elements.attendanceDialog.addEventListener("click", (event) => {
  if (event.target === elements.attendanceDialog) closeAttendanceDialog();
});
elements.exportDataButton.addEventListener("click", exportAppData);
elements.importDataButton.addEventListener("click", () => elements.importDataInput.click());
elements.importDataInput.addEventListener("change", () => importAppData(elements.importDataInput.files[0]));
elements.installAppButton.addEventListener("click", installApp);
[
  elements.lessonRemindersEnabled,
  elements.lessonReminderMinutes,
  elements.assignmentRemindersEnabled,
  elements.assignmentReminderMinutes,
].forEach((control) => control.addEventListener("change", handleNotificationPreferenceChange));
elements.assignmentDueDate.addEventListener("input", maskDateTimeInput);
elements.openDatePickerButton.addEventListener("click", () => {
  if (elements.datePicker.hidden) openDatePicker();
  else closeDatePicker();
});
elements.previousMonthButton.addEventListener("click", () => changeCalendarMonth(-1));
elements.nextMonthButton.addEventListener("click", () => changeCalendarMonth(1));
elements.calendarTodayButton.addEventListener("click", selectTodayInCalendar);
elements.applyDateButton.addEventListener("click", applyCalendarDate);
elements.assignmentDialog.addEventListener("click", (event) => {
  if (event.target === elements.assignmentDialog) closeAssignmentDialog();
  else if (!event.target.closest(".date-field")) closeDatePicker();
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
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = elements.navButtons.indexOf(button);
    let nextIndex = currentIndex;
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (currentIndex - 1 + elements.navButtons.length) % elements.navButtons.length;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (currentIndex + 1) % elements.navButtons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = elements.navButtons.length - 1;
    elements.navButtons[nextIndex].focus();
    switchView(elements.navButtons[nextIndex].dataset.view);
  });
});
elements.sidebarToggle.addEventListener("click", toggleSidebar);
elements.brandHomeLink.addEventListener("click", (event) => {
  event.preventDefault();
  switchView("home");
});
window.addEventListener("popstate", () => switchView(location.hash.slice(1), false));
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.installPrompt = event;
  updateInstallButton();
});
window.addEventListener("appinstalled", () => {
  state.installPrompt = null;
  updateInstallButton();
  showToast("Ders Pusulası uygulama olarak kuruldu.");
});

const initialView = location.hash.slice(1);
let sidebarCollapsed = false;
try {
  sidebarCollapsed = localStorage.getItem(SIDEBAR_KEY) === "1";
} catch (_) {}
applySidebarState(sidebarCollapsed, false);
switchView(initialView || "home", false);
applyTheme(document.documentElement.dataset.theme, false);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(console.error));
}

init();
