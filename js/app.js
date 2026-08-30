"use strict";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ICON_PATHS = {
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-3.3-3.3"/>',
  bell: '<path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/>',
  upload: '<path d="M4 20h16"/><path d="M12 16V5"/><path d="m7.5 9.5 4.5-4.5 4.5 4.5"/>',
  download: '<path d="M4 20h16"/><path d="M12 5v11"/><path d="m7.5 11.5 4.5 4.5 4.5-4.5"/>',
  folder: '<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4l2 2h8A1.5 1.5 0 0 1 20.5 9v8A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17Z"/>',
  folderOpen: '<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4l2 2h8A1.5 1.5 0 0 1 20.5 9v1.5H3.5V7Z"/><path d="M3.5 10.5h17l-2 8H5.5l-2-8Z"/>',
  chevDown: '<path d="m6 9 6 6 6-6"/>',
  chevLeft: '<path d="m14 6-6 6 6 6"/>',
  x: '<path d="m6 6 12 12"/><path d="M18 6 6 18"/>',
  check: '<path d="m5 13 4 4L19 7"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="10" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="16.5" width="7" height="4" rx="1.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3.5 8-7 9.5C8.5 19 5 16 5 11V6Z"/><circle cx="12" cy="11" r="1.6"/>',
  database: '<ellipse cx="12" cy="5.5" rx="7" ry="2.8"/><path d="M5 5.5v13c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-13"/><path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
  fileText: '<path d="M7.5 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5H7.5A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1.5-1.5Z"/><path d="M14.5 3.5V8h4"/><path d="M9 12.5h6M9 16h6"/>',
  table: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 10.5h16"/><path d="M12 10.5V19"/>',
  slides: '<rect x="4" y="4" width="16" height="12" rx="1.5"/><path d="M12 16v3"/><path d="M9 21h6"/>',
  image: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="m5.5 17 4.5-4.5 3 3 2.5-2.5 3 3.5"/>',
  video: '<rect x="3.5" y="6.5" width="12" height="11" rx="2"/><path d="m15.5 10.5 5-2.5v8l-5-2.5"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  trash: '<path d="M4.5 6.5h15"/><path d="M9 6.2V4.5h6v1.7"/><path d="M7 6.5l.8 12a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4l.8-12"/><path d="M10 10.5v6M14 10.5v6"/>',
  share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4"/>',
  eye: '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M6.5 15h-1A1.5 1.5 0 0 1 4 13.5v-8A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5v1"/>',
  logout: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="m16 8 4 4-4 4"/><path d="M20 12H9"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
  book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2Z"/><path d="M8 7.5h8"/>',
  award: '<circle cx="12" cy="9" r="5"/><path d="M8.8 13.5 7 21l5-2.6L17 21l-1.8-7.5"/>',
  pen: '<path d="m4 20 4.5-1L19.5 8a2.1 2.1 0 0 0-3-3L5.5 16Z"/><path d="m14 6.5 3 3"/>',
  sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>'
};

function ic(name, size = 20, sw = 1.7) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.fileText}</svg>`;
}

function brandMark(size = 36) {
  return `<span style="display:inline-grid;place-items:center;width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.28)}px;background:var(--accent);color:oklch(0.985 0.004 95);">${ic("layers", Math.round(size * 0.55))}</span>`;
}

const SECTION_ICONS = ["shield", "book", "award"];

const state = {
  user: null,
  expandedSections: new Set([0, 1]),
  expandedAxes: new Set(),
  uploadCtx: null,
  currentFileKey: null,
  currentLevelFilter: "all",
  lastFocus: null,
  notifCount: 2
};

/* ---------- Utilities ---------- */

function toast(message, type = "success") {
  const box = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast" + (type === "error" ? " t-error" : type === "success" ? " t-success" : "");
  el.innerHTML = ic(type === "error" ? "x" : "check", 18) + `<span>${message}</span>`;
  box.appendChild(el);
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 240);
  }, 2800);
}

function fileById(key) { return FILES.find(f => f.key === key); }
function platformFicheById(id) { return PLATFORM_FICHES.find(f => f.id === id); }

function resolveSlot(key) {
  const [si, ai, ei, qi] = key.split(".").map(Number);
  const sec = TAXONOMY[si], axis = sec.axes[ai], el = axis.elements[ei];
  return { si, ai, ei, qi, sec, axis, el, slot: el.slots[qi] };
}

function pathLabels(key) {
  const r = resolveSlot(key);
  return [r.sec.name, r.axis.name, r.el.name, r.slot];
}

function filesOfElement(si, ai, ei) {
  const prefix = `${si}.${ai}.${ei}.`;
  return FILES.filter(f => f.key.startsWith(prefix)).sort((a, b) => b.added - a.added);
}

function elementCounts(si, ai, ei) {
  const total = TAXONOMY[si].axes[ai].elements[ei].slots.length;
  const filled = filesOfElement(si, ai, ei).length;
  const platformCount = platformFichesOfElement(si, ai, ei).length;
  return { total, filled, platformCount };
}

function overallTotals() {
  let total = 0, filled = 0, platformTotal = PLATFORM_FICHES.length;
  TAXONOMY.forEach((_, si) => {
    const t = sectionTotals(si);
    total += t.total;
    filled += t.filled;
  });
  return { total, filled, platformTotal };
}

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function levelBadge(level) {
  if (!level) return "";
  let cls = "badge-tc";
  if (level.includes("1BAC") || level.includes("أولى")) cls = "badge-1bac";
  else if (level.includes("2BAC") || level.includes("ثانية")) cls = "badge-2bac";
  return `<span class="badge-level ${cls}">${esc(level)}</span>`;
}

/* ---------- Drawer ---------- */

function openDrawer(title, bodyHTML) {
  state.lastFocus = document.activeElement;
  $("#drawerTitle").textContent = title;
  $("#drawerBody").innerHTML = bodyHTML;
  const root = $("#drawerRoot");
  root.hidden = false;
  requestAnimationFrame(() => $("#drawer").classList.add("open"));
  $("#drawerBackdrop").onclick = closeDrawer;
  const first = $("#drawerBody").querySelector("button, input, select, a");
  if (first) first.focus();
  else $("#drawerClose").focus();
}

function closeDrawer() {
  const dr = $("#drawer");
  dr.classList.remove("open");
  setTimeout(() => {
    $("#drawerRoot").hidden = true;
    $("#drawerBody").innerHTML = "";
  }, 250);
  if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  state.currentFileKey = null;
  state.uploadCtx = null;
}

function wireDrawerClose() { $("#drawerClose").onclick = closeDrawer; }

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (!$("#drawerRoot").hidden) closeDrawer();
    hidePops();
    hideSearchResults();
  }
});

/* ---------- File Drawers ---------- */

function familyIcon(name) {
  const fam = fileFamily(name);
  if (fam === "pdf") return "fileText";
  if (/\.xlsx?$/i.test(name)) return "table";
  if (/\.pptx?$/i.test(name)) return "slides";
  if (fam === "office") return "fileText";
  if (/\.(jpe?g|png|gif|webp)$/i.test(name)) return "image";
  if (fam === "media") return "video";
  return "fileText";
}

function openFileDrawer(key) {
  const f = fileById(key);
  if (!f) return;
  state.currentFileKey = key;
  const [secName, axisName, elName, slotName] = pathLabels(key);
  const chip = formatChip(f.name);
  const fam = fileFamily(f.name);

  // Preview box: show image inline, PDF link, or type hint
  let previewBox = "";
  if (fam === "media" && /\.(jpe?g|png|gif|webp)$/i.test(f.name) && f.url) {
    previewBox = `<div class="preview-box" style="padding:0;overflow:hidden;"><img src="${f.url}" alt="${esc(f.name)}" style="max-width:100%;border-radius:4px;"></div>`;
  } else if (fam === "pdf" && f.url) {
    previewBox = `<div class="preview-box"><a href="${f.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;">${ic("fileText", 24)} اضغط لفتح المستند في لسان جديد</a></div>`;
  } else {
    const icon = chip.icon || "fileText";
    previewBox = `<div class="preview-box">${ic(icon, 28)}<span>معاينة ${chip.type || chip.label} ستيتوفر بعد الربط بالخادم</span></div>`;
  }

  const body = `
    <div class="file-hero">
      <div class="fh-icon">${ic(familyIcon(f.name), 26)}</div>
      <div>
        <h3>${esc(f.name)}</h3>
        <div style="margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
          <span class="${chip.cls}">${chip.type || chip.label}</span>
          <span class="badge-personal">مستند شخصي</span>
        </div>
      </div>
    </div>
    <dl class="meta-table">
      <div><dt>القسم</dt><dd>${esc(secName)}</dd></div>
      <div><dt>المحور</dt><dd>${esc(axisName)}</dd></div>
      <div><dt>العنصر</dt><dd>${esc(elName)}</dd></div>
      <div><dt>الخانة المعتمدة</dt><dd>${esc(slotName)}</dd></div>
      <div><dt>الحجم</dt><dd class="num">${humanSize(f.size)}</dd></div>
      <div><dt>تاريخ الإضافة</dt><dd class="num">${formatDate(f.added)}</dd></div>
      <div><dt>ملاحظة</dt><dd>${f.note ? esc(f.note) : '<span style="color:var(--ink-faint);">لا توجد</span>'}</dd></div>
    </dl>
    ${previewBox}
    <div class="share-box">
      <label class="caption" for="shareLink">رابط المشاركة للمفتش(ة)</label>
      <div class="share-row">
        <input class="input" id="shareLink" readonly value="https://mahfazati.ma/f/${encodeURIComponent(f.name.slice(0, 8))}">
        <button class="btn btn-secondary btn-icon" id="copyLinkBtn" aria-label="نسخ الرابط" title="نسخ الرابط">${ic("copy")}</button>
      </div>
    </div>
    <div class="drawer-actions">
      <button class="btn btn-primary" id="dlBtn">${ic("download", 18)} تنزيل المستند</button>
      <button class="btn btn-danger-outline" id="delBtn">${ic("trash", 18)} حذف</button>
    </div>`;
  openDrawer("بيانات المستند الشخصي", body);

  $("#copyLinkBtn").onclick = () => {
    const inp = $("#shareLink");
    inp.select();
    try { document.execCommand("copy"); } catch (_) { /* noop */ }
    toast("تم نسخ رابط المشاركة");
  };
  $("#dlBtn").onclick = () => {
    if (f.url) {
      const a = document.createElement("a");
      a.href = f.url;
      a.download = f.name;
      a.click();
    } else {
      toast("التنزيل سيُفعَّل بعد الربط بالخادم");
    }
  };
  const delBtn = $("#delBtn");
  delBtn.onclick = () => {
    if (delBtn.dataset.armed) {
      const i = FILES.findIndex(x => x.key === key);
      if (i > -1) FILES.splice(i, 1);
      toast("تم حذف المستند نهائيًا");
      closeDrawer();
      renderRoute();
    } else {
      delBtn.dataset.armed = "1";
      delBtn.classList.remove("btn-danger-outline");
      delBtn.classList.add("btn-danger-fill");
      delBtn.innerHTML = `${ic("trash", 18)} تأكيد الحذف النهائي`;
    }
  };
}

function openPlatformFicheDrawer(id) {
  const f = platformFicheById(id);
  if (!f) return;
  const res = getElementById(f.element_id);
  const secName = res ? res.section.name : "القسم الديدكتيكي";
  const axisName = res ? res.axis.name : "تخطيط التعلمات";
  const elName = res ? res.element.name : "الوثائق التربوية";
  const chip = formatChip(f.name);

  const tagsHTML = (f.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join(" ");

  // Determine if file is previewable directly
  const isPDF = /\.pdf$/i.test(f.name);
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(f.name);
  let previewBody = `<div class="preview-box">${ic(chip.icon || "fileText", 28)}<span>وثيقة ${chip.type || chip.label} جاهزة للتحميل والاستثمار الصفي.</span></div>`;
  if (isPDF && f.url) {
    previewBody = `<div class="preview-box"><a href="${f.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;">${ic("fileText", 24)} اضغط لفتح الوثيقة في لسان جديد</a></div>`;
  } else if (isImage && f.url) {
    previewBody = `<div class="preview-box" style="padding:0;"><img src="${f.url}" alt="${esc(f.name)}" style="max-width:100%;"></div>`;
  }

  const body = `
    <div class="file-hero">
      <div class="fh-icon">${ic(familyIcon(f.name), 26)}</div>
      <div>
        <h3>${esc(f.title || f.name)}</h3>
        <div style="margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
          <span class="${chip.cls}">${chip.type || chip.label}</span>
          ${levelBadge(f.level)}
        </div>
      </div>
    </div>
    <div class="folder-path-display" title="المسار الأصلي داخل الملف التراكمي">
      ${ic("folder", 15)} ${esc(f.file_path)}
    </div>
    <dl class="meta-table">
      <div><dt>القسم</dt><dd>${esc(secName)}</dd></div>
      <div><dt>المحور</dt><dd>${esc(axisName)}</dd></div>
      <div><dt>العنصر</dt><dd>${esc(elName)}</dd></div>
      <div><dt>المستوى المستهدف</dt><dd>${f.level ? esc(f.level) : "عام / كافة المستويات"}</dd></div>
      <div><dt>الحجم</dt><dd class="num">${humanSize(f.size)}</dd></div>
      <div><dt>الوسوم والتصنيف</dt><dd>${tagsHTML || '<span style="color:var(--ink-faint);">بدون وسوم</span>'}</dd></div>
    </dl>
    ${previewBody}
    <div class="drawer-actions">
      <button class="btn btn-primary" id="dlPfBtn">${ic("download", 18)} تحميل النموذج المعتمد</button>
      <button class="btn btn-secondary" id="useTemplateBtn">${ic("upload", 18)} تعبئة ورفع نسختي الشخصية</button>
    </div>`;
  openDrawer("بيانات الوثيقة الرسمية", body);

  $("#dlPfBtn").onclick = () => {
    if (f.url) {
      const a = document.createElement("a");
      a.href = f.url;
      a.download = f.name;
      a.click();
    } else {
      toast(`جارٍ تحميل: ${f.name}`);
    }
  };
  $("#useTemplateBtn").onclick = () => {
    closeDrawer();
    if (res) openUploadDrawer({ si: res.si, ai: res.ai, ei: res.ei });
    else openUploadDrawer({});
  };
}

/* ---------- Upload Drawer ---------- */

function destSelects(ctx) {
  const si = ctx.si ?? 0, ai = ctx.ai ?? 0, ei = ctx.ei ?? 0;
  const secOpts = TAXONOMY.map((s, i) => `<option value="${i}" ${i === si ? "selected" : ""}>${s.name}</option>`).join("");
  const axisOpts = TAXONOMY[si].axes.map((a, i) => `<option value="${i}" ${i === ai ? "selected" : ""}>${a.folderName || a.name}</option>`).join("");
  const elOpts = TAXONOMY[si].axes[ai].elements.map((e, i) => `<option value="${i}" ${i === ei ? "selected" : ""}>${e.folderName || e.name}</option>`).join("");
  const slots = TAXONOMY[si].axes[ai].elements[ei].slots;
  const slotOpts = `<option value="-1" ${ctx.qi == null ? "selected" : ""}>بدون خانة محددة</option>` +
    slots.map((s, i) => `<option value="${i}" ${i === ctx.qi ? "selected" : ""}>${s}</option>`).join("");
  return `
    <div class="dest-grid">
      <div class="field"><label for="upSec">القسم الرسمي</label><select class="input" id="upSec">${secOpts}</select></div>
      <div class="field"><label for="upAxis">المحور</label><select class="input" id="upAxis">${axisOpts}</select></div>
      <div class="field"><label for="upEl">العنصر</label><select class="input" id="upEl">${elOpts}</select></div>
      <div class="field"><label for="upSlot">الخانة المعتمدة للتفتيش</label><select class="input" id="upSlot">${slotOpts}</select></div>
      <div class="field"><label for="upNote">ملاحظة أو توصيف إضافي</label><input class="input" id="upNote" placeholder="مثال: نسخة محينة وفق ملاحظات السيد(ة) المفتش(ة)"></div>
    </div>`;
}

function wireDestSelects(ctx) {
  const upSec = $("#upSec"), upAxis = $("#upAxis"), upEl = $("#upEl"), upSlot = $("#upSlot");
  const refresh = () => {
    const si = +upSec.value, ai = +upAxis.value, ei = +upEl.value;
    upAxis.innerHTML = TAXONOMY[si].axes.map((a, i) => `<option value="${i}">${a.folderName || a.name}</option>`).join("");
    upEl.innerHTML = TAXONOMY[si].axes[ai].elements.map((e, i) => `<option value="${i}">${e.folderName || e.name}</option>`).join("");
    refreshSlots();
  };
  const refreshSlots = () => {
    const si = +upSec.value, ai = +upAxis.value, ei = +upEl.value;
    const slots = TAXONOMY[si].axes[ai].elements[ei].slots;
    upSlot.innerHTML = `<option value="-1">بدون خانة محددة</option>` + slots.map((s, i) => `<option value="${i}">${s}</option>`).join("");
  };
  upSec.onchange = refresh;
  upAxis.onchange = refreshSlots;
  upEl.onchange = refreshSlots;
}

function openUploadDrawer(ctx = {}) {
  state.uploadCtx = Object.assign({ si: null, ai: null, ei: null, qi: null }, ctx);
  const body = `
    <label class="dropzone" id="dropzone">
      ${ic("upload", 30)}
      <b>اسحب الملف هنا أو انقر لاختياره</b>
      <small>الصيغ المعتمدة: PDF، وورد، إكسيل، باوربوينت، وسائط (حد أقصى 50MB)</small>
      <input type="file" id="upFile" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.mp4" hidden>
    </label>
    <div class="upload-progress" id="uploadMeta" hidden>
      <div class="u-name" id="upFileName"></div>
      <div class="meter"><i id="upBar" style="width:0%;"></i></div>
    </div>
    <div id="destWrap">${destSelects(state.uploadCtx)}</div>
    <div id="suggestHint"></div>
    <div class="drawer-actions">
      <button class="btn btn-primary" id="confirmUpload" disabled>${ic("upload", 18)} إيداع وتصنيف المستند</button>
      <button class="btn btn-ghost" id="cancelUpload">إلغاء</button>
    </div>`;
  openDrawer("إيداع مستند في الملف التراكمي", body);
  wireDestSelects(state.uploadCtx);

  let chosenFile = null;
  const dz = $("#dropzone"), fileInput = $("#upFile");
  const confirmBtn = $("#confirmUpload");

  const applySuggestion = (fileName) => {
    if (state.uploadCtx.si != null) return;
    const sug = suggestTarget(fileName);
    if (sug) {
      $("#upSec").value = sug.si;
      $("#upSec").dispatchEvent(new Event("change"));
      $("#upAxis").value = sug.ai;
      $("#upEl").value = sug.ei;
      $("#upEl").dispatchEvent(new Event("change"));
      $("#upSlot").value = sug.qi;
      const r = resolveSlot(slotKey(sug.si, sug.ai, sug.ei, sug.qi));
      $("#suggestHint").innerHTML = `<div class="dest-hint">${ic("check", 16)} اقتراح تلقائي بحسب اسم الملف: ${esc(r.el.name)} ← ${esc(r.slot)}</div>`;
    }
  };

  const setFile = (file) => {
    chosenFile = file;
    confirmBtn.disabled = false;
    $("#uploadMeta").hidden = false;
    $("#upFileName").innerHTML = `<span class="${formatChip(file.name).cls}">${formatChip(file.name).label}</span> ${esc(file.name)} <span class="caption num">${humanSize(file.size)}</span>`;
    applySuggestion(file.name);
  };

  fileInput.onchange = () => { if (fileInput.files[0]) setFile(fileInput.files[0]); };
  dz.addEventListener("dragover", e => { e.preventDefault(); dz.classList.add("dragover"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("dragover"));
  dz.addEventListener("drop", e => {
    e.preventDefault();
    dz.classList.remove("dragover");
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });

  $("#cancelUpload").onclick = closeDrawer;

  confirmBtn.onclick = () => {
    if (!chosenFile || confirmBtn.disabled) return;
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span class="spinner"></span> جارٍ الرفع والتصنيف في الملف…`;
    const bar = $("#upBar");
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(p + Math.random() * 22, 92);
      bar.style.width = p + "%";
    }, 130);
    setTimeout(() => {
      clearInterval(tick);
      bar.style.width = "100%";
      const si = +$("#upSec").value, ai = +$("#upAxis").value, ei = +$("#upEl").value, qi = +$("#upSlot").value;
      const rec = {
        key: slotKey(si, ai, ei, qi),
        name: chosenFile.name,
        size: chosenFile.size,
        added: new Date(),
        note: $("#upNote").value.trim(),
        scope: "personal"
      };
      FILES.push(rec);
      const r = resolveSlot(rec.key);
      setTimeout(() => {
        closeDrawer();
        toast(`تم تصنيف وإيداع «${chosenFile.name}» في «${r.el.name}»`);
        if (location.hash !== `#/e/${si}/${ai}/${ei}`) location.hash = `#/e/${si}/${ai}/${ei}`;
        else renderRoute();
      }, 220);
    }, 900);
  };
}

/* ---------- Search Index ---------- */

let SEARCH_INDEX = null;

function buildIndex() {
  SEARCH_INDEX = [];
  TAXONOMY.forEach((sec, si) => sec.axes.forEach((axis, ai) => axis.elements.forEach((el, ei) => {
    SEARCH_INDEX.push({
      t: "el",
      label: el.name,
      folder: el.folderName,
      path: `${sec.short} › ${axis.name}`,
      si, ai, ei
    });
    filesOfElement(si, ai, ei).forEach(f => {
      SEARCH_INDEX.push({
        t: "f",
        label: f.name,
        path: `${sec.short} › ${axis.name} › ${el.name}`,
        key: f.key,
        scope: "personal"
      });
    });
  })));

  PLATFORM_FICHES.forEach(f => {
    const res = getElementById(f.element_id);
    const path = res ? `${res.section.short} › ${res.axis.name} › ${res.element.name}` : "المنهاج الرسمي";
    SEARCH_INDEX.push({
      t: "pf",
      label: f.title || f.name,
      path,
      id: f.id,
      scope: "platform"
    });
  });
}

function hideSearchResults() {
  $("#searchResults").hidden = true;
  $("#globalSearch").setAttribute("aria-expanded", "false");
}

function runSearch(q) {
  const box = $("#searchResults");
  q = q.trim().toLowerCase();
  if (q.length < 2) { hideSearchResults(); return; }
  const hits = SEARCH_INDEX.filter(x => (x.label + " " + x.path + " " + (x.folder || "")).toLowerCase().includes(q));
  const els = hits.filter(h => h.t === "el").slice(0, 5);
  const pfs = hits.filter(h => h.t === "pf").slice(0, 6);
  const fls = hits.filter(h => h.t === "f").slice(0, 5);

  let html = "";
  if (els.length) {
    html += `<div class="sr-group">عناصر ومجلدات الملف التراكمي</div>` + els.map(h =>
      `<button class="sr-item" data-el="${h.si}.${h.ai}.${h.ei}" role="option">${ic("folder", 18)}<span>${esc(h.label)}</span><small>${esc(h.path)}</small></button>`).join("");
  }
  if (pfs.length) {
    html += `<div class="sr-group">وثائق وبطاقات المنهاج المرجعية (رسمي)</div>` + pfs.map(h =>
      `<button class="sr-item" data-pf="${h.id}" role="option">${ic("fileText", 18)}<span>${esc(h.label)}</span><span class="badge-platform">منهاج</span><small>${esc(h.path)}</small></button>`).join("");
  }
  if (fls.length) {
    html += `<div class="sr-group">مستنداتي الشخصية المودعة</div>` + fls.map(h =>
      `<button class="sr-item" data-file="${h.key}" role="option">${ic(familyIcon(h.label), 18)}<span>${esc(h.label)}</span><small>${esc(h.path)}</small></button>`).join("");
  }
  if (!html) html = `<div class="sr-empty">لا نتائج مطابقة لـ«${esc(q)}» في الملف التراكمي</div>`;
  box.innerHTML = html;
  box.hidden = false;
  $("#globalSearch").setAttribute("aria-expanded", "true");

  $$("button.sr-item", box).forEach(btn => {
    btn.addEventListener("mousedown", e => {
      e.preventDefault();
      if (btn.dataset.el) {
        const [si, ai, ei] = btn.dataset.el.split(".").map(Number);
        hideSearchResults();
        $("#globalSearch").value = "";
        location.hash = `#/e/${si}/${ai}/${ei}`;
      } else if (btn.dataset.pf) {
        hideSearchResults();
        $("#globalSearch").value = "";
        openPlatformFicheDrawer(btn.dataset.pf);
      } else if (btn.dataset.file) {
        hideSearchResults();
        $("#globalSearch").value = "";
        openFileDrawer(btn.dataset.file);
      }
    });
  });
}

/* ---------- Sidebar Navigation Tree ---------- */

function renderTree() {
  const nav = $("#treeNav");
  const route = location.hash;
  const m = /^#\/e\/(\d+)\/(\d+)\/(\d+)/.exec(route);
  const ms = /^#\/s\/(\d+)/.exec(route);
  const activeSi = m ? +m[1] : (ms ? +ms[1] : null);
  const activeAi = m ? +m[2] : null;
  const activeEi = m ? +m[3] : null;

  if (activeSi != null) state.expandedSections.add(activeSi);

  let html = `
    <div class="tree-nav-extra">
      <button class="tree-link" data-go="#/d" ${route === "#/d" ? 'aria-current="page"' : ""}>${ic("grid", 19)} لوحة القيادة</button>
      <button class="tree-link" data-go="#/set" ${route === "#/set" ? 'aria-current="page"' : ""}>${ic("gear", 19)} الإعدادات</button>
    </div>`;

  TAXONOMY.forEach((sec, si) => {
    const expanded = state.expandedSections.has(si);
    const st = sectionTotals(si);
    html += `<div class="tree-section">
      <button class="tree-section-head" data-sec="${si}" aria-expanded="${expanded}">
        ${ic(SECTION_ICONS[si], 20)}
        <span style="font-weight:650;">${sec.name}</span>
        <span class="chev">${ic("chevDown", 16)}</span>
      </button>`;
    if (expanded) {
      html += `<div class="tree-axes">`;
      sec.axes.forEach((axis, ai) => {
        const axOpen = expanded && (activeSi === si && (activeAi === ai || state.expandedAxes.has(`${si}.${ai}`)));
        const at = axisTotals(si, ai);
        html += `<div class="tree-axis">
          <button class="tree-axis-head" data-axis="${si}.${ai}" aria-expanded="${axOpen}">
            <span>${ic(axOpen ? "folderOpen" : "folder", 16)} <b>${axis.folderName || axis.name}</b></span>
            <span class="chev">${ic("chevDown", 15)}</span>
          </button>`;
        if (axOpen) {
          html += `<ul class="tree-elements">`;
          axis.elements.forEach((el, ei) => {
            const c = elementCounts(si, ai, ei);
            const isActive = activeSi === si && activeAi === ai && activeEi === ei;
            html += `<li><button class="tree-el" data-elgo="${si}.${ai}.${ei}" ${isActive ? 'aria-current="page"' : ""}>
              <span>${el.name}</span>
              <span class="el-count num" title="${c.filled} مستندات شخصية من ${c.total} خانات · ${c.platformCount} وثائق منهاج">${c.filled}/${c.total}</span>
            </button></li>`;
          });
          html += `</ul>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
  });

  nav.innerHTML = html;

  $$("button[data-go]", nav).forEach(b => b.onclick = () => {
    location.hash = b.dataset.go;
    closeMobileSidebar();
  });
  $$("button.tree-section-head", nav).forEach(b => b.onclick = () => {
    const si = +b.dataset.sec;
    if (state.expandedSections.has(si) && activeSi !== si) {
      location.hash = `#/s/${si}`;
      closeMobileSidebar();
      return;
    }
    state.expandedSections.has(si) ? state.expandedSections.delete(si) : state.expandedSections.add(si);
    renderTree();
  });
  $$("button.tree-axis-head", nav).forEach(b => b.onclick = () => {
    const [si, ai] = b.dataset.axis.split(".").map(Number);
    const id = `${si}.${ai}`;
    state.expandedAxes.has(id) ? state.expandedAxes.delete(id) : state.expandedAxes.add(id);
    renderTree();
  });
  $$("button[data-elgo]", nav).forEach(b => b.onclick = () => {
    location.hash = `#/e/${b.dataset.elgo.replace(/\./g, "/")}`;
    closeMobileSidebar();
  });
}

/* ---------- Breadcrumbs & Headers ---------- */

function crumb(items) {
  const sep = `<span class="sep">›</span>`;
  const parts = items.map((it, i) => {
    const last = i === items.length - 1;
    return last ? `<span aria-current="page">${esc(it.label)}</span>` : `<a href="${it.href}">${esc(it.label)}</a>`;
  });
  return `<nav class="crumbs" aria-label="مسار التنقل">${parts.join(sep)}</nav>`;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "صباح الخير" : "مساء الخير";
}

/* ---------- View: Dashboard ---------- */

function renderDashboard(main) {
  const ov = overallTotals();
  const recent = [...FILES].sort((a, b) => b.added - a.added).slice(0, 5);
  const famCounts = { pdf: 0, office: 0, media: 0, other: 0 };
  FILES.forEach(f => famCounts[fileFamily(f.name)]++);
  PLATFORM_FICHES.forEach(f => famCounts[fileFamily(f.name)]++);

  const ledgerRows = TAXONOMY.map((sec, si) => {
    const t = sectionTotals(si);
    const pct = t.total ? Math.round(t.filled / t.total * 100) : 0;
    return `<div class="ledger-row">
      <button data-go="#/s/${si}">
        <span class="l-icon">${ic(SECTION_ICONS[si], 21)}</span>
        <span class="l-name">
          <b>${sec.name}</b>
          <span>${sec.tagline} · ${t.platformCount} وثيقة مرجعية</span>
        </span>
        <span class="l-count num">${t.filled} من ${t.total} خانة موثقة</span>
        <span class="l-meter meter"><i style="width:${pct}%"></i></span>
      </button>
    </div>`;
  }).join("");

  const activityItems = recent.map(f => {
    const chip = formatChip(f.name);
    return `<li data-file="${f.key}" tabindex="0" role="button" aria-label="فتح ${esc(f.name)}">
      <span class="${chip.cls}">${chip.label}</span>
      <span class="a-body">
        <span class="a-name">${esc(f.name)}</span>
        <span class="a-meta num">${formatDate(f.added)} · ${humanSize(f.size)}</span>
      </span>
      <span class="push">${ic("chevLeft", 18)}</span>
    </li>`;
  }).join("");

  main.innerHTML = `
    ${crumb([{ label: "لوحة القيادة", href: "#/d" }])}
    <div class="page-head">
      <div class="titles">
        <h1>${greeting()}، ${esc(state.user.name)}</h1>
        <p class="meta num">${todayLine()} · ${ov.platformTotal} وثيقة منهاج مرجعية مدمجة · ${ov.filled} خانة شخصية موثقة</p>
      </div>
      <div class="actions">
        <button class="btn btn-ghost" id="exportAllBtn">${ic("download", 18)} تصدير الملف كاملًا</button>
        <button class="btn btn-primary" id="dashUploadBtn">${ic("upload", 18)} إيداع مستند جديد</button>
      </div>
    </div>

    <div class="dash-grid">
      <section class="panel" aria-labelledby="ledgerTitle">
        <div class="panel-head">
          <h2 class="h3" id="ledgerTitle">أقسام الملف التراكمي الرسمية</h2>
          <span class="meta-push caption">مطابقة لتوجيهات المفتشية</span>
        </div>
        ${ledgerRows}
      </section>

      <div style="display:grid;gap:24px;">
        <section class="panel" aria-labelledby="recentTitle">
          <div class="panel-head">
            <h2 class="h3" id="recentTitle">أحدث الوثائق الشخصية المودعة</h2>
            <span class="meta-push caption num">${FILES.length} مستندات</span>
          </div>
          <ul class="activity-list">${activityItems.length ? activityItems : '<li style="color:var(--ink-faint);padding:18px 20px;">لم يتم رفع مستندات شخصية بعد</li>'}</ul>
          <div class="formats-strip">
            <span class="tag num">${ic("fileText", 15)} PDF × ${famCounts.pdf}</span>
            <span class="tag num">${ic("table", 15)} أوفيس × ${famCounts.office}</span>
            <span class="tag num">${ic("sparkle", 15)} وثائق المنهاج × ${PLATFORM_FICHES.length}</span>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2 class="h3">توجيهات التفتيش والتحيين</h2></div>
          <div class="panel-body" style="font-size:.875rem;color:var(--ink-soft);line-height:1.9;">
            بنية الملف التراكمي مطابقة تمامًا للمجلد الوزاري المعتمد (التربوي الإداري، الديداكتيكي، والتكويني المهني). استخدم قوالب وبطاقات المنهاج الجاهزة لتعبئة وتوثيق ممارستك الصفية باستمرار.
          </div>
        </section>
      </div>
    </div>`;

  $("#dashUploadBtn").onclick = () => openUploadDrawer({});
  $("#exportAllBtn").onclick = () => toast("تصدير تجريبي: سيُجمَّع الملف التراكمي كاملًا بصيغة PDF عند الربط بالخادم");
  $$("[data-go]", main).forEach(b => b.onclick = () => location.hash = b.dataset.go);
  $$("li[data-file]", main).forEach(li => {
    li.addEventListener("click", () => openFileDrawer(li.dataset.file));
    li.addEventListener("keydown", e => { if (e.key === "Enter") openFileDrawer(li.dataset.file); });
  });
}

/* ---------- View: Section Page ---------- */

function renderSectionPage(main, si) {
  const sec = TAXONOMY[si];
  const t = sectionTotals(si);
  const blocks = sec.axes.map((axis, ai) => {
    const at = axisTotals(si, ai);
    const rows = axis.elements.map((el, ei) => {
      const c = elementCounts(si, ai, ei);
      return `<button class="erow" data-elgo="${si}/${ai}/${ei}">
        <span>
          <b>${el.name}</b>
          <span class="er-meta num">
            <span>${c.filled} من ${c.total} خانة موثقة</span>
            <span>· ${c.platformCount} وثيقة منهاج</span>
          </span>
        </span>
        <span class="push">
          <span class="meter" style="width:72px;"><i style="width:${c.total ? Math.round(c.filled / c.total * 100) : 0}%"></i></span>
          ${ic("chevLeft", 18)}
        </span>
      </button>`;
    }).join("");
    return `<section class="axis-block" aria-labelledby="ax-${si}-${ai}">
      <div class="axis-block-head">
        <h2 class="h3" id="ax-${si}-${ai}">${ic("folder", 18)} ${axis.folderName || axis.name}</h2>
        <span class="axis-count num">${at.filled}/${at.total} خانة · ${at.platformCount} وثيقة رسمية</span>
      </div>
      <div class="panel element-rows">${rows}</div>
    </section>`;
  }).join("");

  main.innerHTML = `
    ${crumb([
      { label: "لوحة القيادة", href: "#/d" },
      { label: sec.name, href: "#/s/" + si }
    ])}
    <div class="page-head">
      <div class="titles">
        <h1>${sec.name}</h1>
        <p class="meta">${sec.tagline} · ${t.filled}/${t.total} خانة شخصية · ${t.platformCount} وثيقة مرجعية</p>
      </div>
      <div class="actions">
        <button class="btn btn-primary" id="secUploadBtn">${ic("upload", 18)} إيداع مستند</button>
      </div>
    </div>
    <div class="folder-path-display" style="margin-bottom:16px;">
      ${ic("folder", 15)} الملف التراكمي / ${esc(sec.folderName)}
    </div>
    <p class="section-intro" style="margin-bottom:24px;">${sec.desc}</p>
    ${blocks}`;

  $("#secUploadBtn").onclick = () => openUploadDrawer({ si, noSuggest: false });
  $$("button[data-elgo]", main).forEach(b => b.onclick = () => location.hash = "#/e/" + b.dataset.elgo);
}

/* ---------- View: Element Page ---------- */

function renderElementPage(main, si, ai, ei) {
  const sec = TAXONOMY[si], axis = sec.axes[ai], el = axis.elements[ei];
  const personalFiles = filesOfElement(si, ai, ei);
  const platformFiles = platformFichesOfElement(si, ai, ei);
  const c = elementCounts(si, ai, ei);

  state.expandedSections.add(si);
  state.expandedAxes.add(`${si}.${ai}`);

  // Level filtering
  const hasLevels = !!(el.levels && el.levels.length) || platformFiles.some(f => f.level);
  let activeFilter = state.currentLevelFilter;
  let displayedPlatformFiles = platformFiles;
  if (activeFilter !== "all") {
    displayedPlatformFiles = platformFiles.filter(f => f.level === activeFilter || (!f.level && activeFilter === "عام"));
  }

  const tabs = axis.elements.map((sib, i) =>
    `<button class="el-tab ${i === ei ? "active" : ""}" data-tab="${i}">${sib.name}</button>`).join("");

  let filterBarHTML = "";
  if (hasLevels) {
    const levels = ["الكل", "جذع مشترك", "أولى باك", "ثانية باك"];
    filterBarHTML = `
      <div class="level-filter-bar" role="toolbar" aria-label="تصفية حسب المستوى الدراسي">
        <span class="lbl">تصفية حسب المستوى:</span>
        ${levels.map(lvl => {
          const key = lvl === "الكل" ? "all" : lvl;
          const isActive = activeFilter === key;
          const cnt = key === "all" ? platformFiles.length : platformFiles.filter(f => f.level === key).length;
          return `<button class="filter-btn ${isActive ? "active" : ""}" data-lvl="${key}">${esc(lvl)} <span class="badge-cnt">${cnt}</span></button>`;
        }).join("")}
      </div>`;
  }

  // 1. Platform Reference Fiches Table
  const platformRows = displayedPlatformFiles.map(f => {
    const chip = formatChip(f.name);
    return `<tr data-pf="${f.id}" tabindex="0">
      <td>
        <span class="file-cell">
          <span class="${chip.cls}">${chip.label}</span>
          <span style="min-width:0;">
            <span class="f-name">${esc(f.title || f.name)}</span>
            <span class="f-note">${esc(f.file_path)}</span>
          </span>
        </span>
      </td>
      <td><span class="${chip.cls}" title="نوع الملف">${chip.type || chip.label}</span></td>
      <td>${levelBadge(f.level) || '<span style="color:var(--ink-faint);font-size:.75rem;">مشترك</span>'}</td>
      <td class="num-cell">${humanSize(f.size)}</td>
      <td>
        <span class="row-actions">
          <button class="btn btn-ghost btn-icon" data-pf-act="preview" data-pf="${f.id}" aria-label="معاينة">${ic("eye", 18)}</button>
          <button class="btn btn-ghost btn-icon" data-pf-act="dl" data-pf="${f.id}" aria-label="تنزيل">${ic("download", 18)}</button>
        </span>
      </td>
    </tr>`;
  }).join("");

  const platformPanel = platformFiles.length ? `
    <section class="panel" style="margin-top:20px;" aria-labelledby="platformT">
      <div class="panel-head">
        <h2 class="h3" id="platformT">${ic("sparkle", 18)} وثائق وبطاقات المنهاج المرجعية</h2>
        <span class="meta-push caption num">${displayedPlatformFiles.length} وثيقة معتمدة</span>
      </div>
      <div class="table-scroll">
        <table class="doc-table">
          <thead><tr><th scope="col">الوثيقة / البطاقة</th><th scope="col">النوع</th><th scope="col">المستوى</th><th scope="col">الحجم</th><th scope="col"><span style="position:absolute;clip-path:inset(50%);">إجراءات</span></th></tr></thead>
          <tbody>${platformRows.length ? platformRows : '<tr><td colspan="5" style="text-align:center;color:var(--ink-faint);padding:24px;">لا توجد وثائق مطابقة للمستوى المحدد</td></tr>'}</tbody>
        </table>
      </div>
    </section>` : "";

  // 2. Personal Uploaded Documents Table
  const personalRows = personalFiles.map(f => {
    const chip = formatChip(f.name);
    const slotIdx = +f.key.split(".")[3];
    return `<tr data-file="${f.key}" tabindex="0">
      <td>
        <span class="file-cell">
          <span class="${chip.cls}">${chip.label}</span>
          <span style="min-width:0;">
            <span class="f-name">${esc(f.name)}</span>
            ${f.note ? `<span class="f-note">${esc(f.note)}</span>` : ""}
          </span>
        </span>
      </td>
      <td><span class="${chip.cls}" title="نوع الملف">${chip.type || chip.label}</span></td>
      <td class="num-cell">${humanSize(f.size)}</td>
      <td class="num-cell">${formatDate(f.added)}</td>
      <td>
        <span class="row-actions">
          <button class="btn btn-ghost btn-icon" data-act="preview" data-file="${f.key}" aria-label="معاينة">${ic("eye", 18)}</button>
          <button class="btn btn-ghost btn-icon" data-act="dl" data-file="${f.key}" aria-label="تنزيل">${ic("download", 18)}</button>
          <button class="btn btn-ghost btn-icon" data-act="share" data-file="${f.key}" aria-label="مشاركة">${ic("share", 18)}</button>
        </span>
      </td>
    </tr>`;
  }).join("");

  const personalPanel = personalFiles.length ? `
    <section class="panel" style="margin-top:20px;" aria-labelledby="filesT">
      <div class="panel-head">
        <h2 class="h3" id="filesT">${ic("folder", 18)} مستنداتي الشخصية المودعة</h2>
        <span class="meta-push caption num">${personalFiles.length} مستند شخصي</span>
      </div>
      <div class="table-scroll">
        <table class="doc-table">
          <thead><tr><th scope="col">المستند</th><th scope="col">الخانة المعتمدة</th><th scope="col">الحجم</th><th scope="col">أُضيف في</th><th scope="col"><span style="position:absolute;clip-path:inset(50%);">إجراءات</span></th></tr></thead>
          <tbody>${personalRows}</tbody>
        </table>
      </div>
    </section>` : `
    <section class="panel" style="margin-top:20px;">
      <div class="empty-state">
        ${ic("folder", 40)}
        <p>لم تُودع أي مستند شخصي لهذا العنصر بعد. يمكنك استخدام نماذج المنهاج أعلاه أو رفع ملفك المباشر في الخانات أدناه.</p>
        <button class="btn btn-primary btn-sm" id="emptyUploadBtn">${ic("upload", 16)} رفع أول مستند شخصي</button>
      </div>
    </section>`;

  // 3. Official Filing Slots Checklist
  const slotRows = el.slots.map((slot, qi) => {
    const key = slotKey(si, ai, ei, qi);
    const f = fileById(key);
    const chip = f ? formatChip(f.name) : null;
    return `<div class="slot-row">
      <span class="dot ${f ? "dot-full" : "dot-empty"}" role="img" aria-label="${f ? "موثق" : "فارغ"}"></span>
      <span class="s-name">${esc(slot)}</span>
      ${f ? `<span class="s-file"><span class="${chip.cls}">${chip.label}</span> ${esc(f.name)}</span>` : ""}
      <span class="push">
        ${f
          ? `<button class="btn btn-ghost btn-sm" data-open="${key}">${ic("eye", 16)} فتح</button>`
          : `<button class="btn btn-secondary btn-sm" data-upslot="${qi}">${ic("upload", 16)} رفع</button>`}
      </span>
    </div>`;
  }).join("");

  main.innerHTML = `
    ${crumb([
      { label: "لوحة القيادة", href: "#/d" },
      { label: sec.name, href: `#/s/${si}` },
      { label: axis.name, href: `#/s/${si}` },
      { label: el.name, href: location.hash }
    ])}
    <div class="page-head">
      <div class="titles">
        <h1>${el.name}</h1>
        <p class="meta">المحور: ${axis.name} · القسم: ${sec.name}</p>
      </div>
      <div class="actions">
        <button class="btn btn-ghost" id="elExportBtn">${ic("share", 18)} مشاركة العنصر</button>
        <button class="btn btn-primary" id="elUploadBtn">${ic("upload", 18)} إيداع في هذا العنصر</button>
      </div>
    </div>
    <div class="folder-path-display" style="margin-bottom:16px;">
      ${ic("folder", 15)} الملف التراكمي / ${esc(sec.folderName)} / ${esc(axis.folderName)} / ${esc(el.folderName || el.name)}
    </div>
    <div class="el-tabs" role="tablist" aria-label="عناصر المحور">${tabs}</div>
    ${filterBarHTML}
    ${platformPanel}
    ${personalPanel}`;

  $$("button[data-tab]", main).forEach(b => b.onclick = () => {
    state.currentLevelFilter = "all";
    location.hash = `#/e/${si}/${ai}/${b.dataset.tab}`;
  });

  $$("button[data-lvl]", main).forEach(b => b.onclick = () => {
    state.currentLevelFilter = b.dataset.lvl;
    renderElementPage(main, si, ai, ei);
  });

  $("#elUploadBtn").onclick = () => openUploadDrawer({ si, ai, ei });
  const eb = $("#emptyUploadBtn");
  if (eb) eb.onclick = () => openUploadDrawer({ si, ai, ei });

  // Platform fiche actions
  $$("button[data-pf-act]", main).forEach(btn => {
    const id = btn.dataset.pf;
    const act = btn.dataset.pfAct;
    btn.onclick = e => {
      e.stopPropagation();
      const fiche = platformFicheById(id);
      if (!fiche) return;
      if (act === "preview") openPlatformFicheDrawer(id);
      if (act === "dl") {
        toast(`جارٍ تنزيل: ${fiche.name}`);
        const a = document.createElement("a");
        a.href = fiche.file_path || "#";
        a.download = fiche.name;
        a.click();
      }
    };
  });

  // Personal file row actions
  $$("button[data-act]", main).forEach(btn => {
    const key = btn.dataset.file;
    const act = btn.dataset.act;
    btn.onclick = e => {
      e.stopPropagation();
      if (act === "preview" || act === "open") openFileDrawer(key);
      if (act === "dl") {
        const f = fileById(key);
        if (!f) return;
        toast(`جارٍ تنزيل: ${f.name}`);
        if (f.url) {
          const a = document.createElement("a");
          a.href = f.url;
          a.download = f.name;
          a.click();
        } else {
          toast("التنزيل سيُفعَّل بعد الربط بالخادم");
        }
      }
      if (act === "share") openFileDrawer(key);
    };
  });

  $$("tr[data-pf]", main).forEach(tr => {
    tr.addEventListener("click", e => {
      if (!e.target.closest("button")) openPlatformFicheDrawer(tr.dataset.pf);
    });
  });
  $$("tr[data-file]", main).forEach(tr => {
    tr.addEventListener("click", e => {
      if (!e.target.closest("button")) openFileDrawer(tr.dataset.file);
    });
  });
  $("#elExportBtn").onclick = () => toast("مشاركة تجريبية: سيولَّد رابط للعنصر عند الربط بالخادم");

}


/* ---------- View: Settings ---------- */

function agreementDrawer() {
  openDrawer("عقد المسؤولية الشخصية والمهنية", `
    <div style="font-size:.9063rem;line-height:2;color:var(--ink-soft);">
      <p>يتعهد الأستاذ(ة) الموقّع بالحفظ المسؤول للبيانات المهنية والتربوية داخل المنصة، بما فيها:</p>
      <p>1. صيانة الوثائق المتعلقة بالمتعلمين والالتزام بالسرية الإدارية والتربوية.</p>
      <p>2. تحمل المسؤولية الكاملة عن صحة المعطيات المودعة ومطابقتها للمنهاج الرسمي.</p>
      <p>3. الالتزام بمقتضيات النظام الأساسي لموظفي الوزارة والنصوص التنظيمية ذات الصلة.</p>
      <p>4. تحيين الوثائق دوريًا وفق توجيهات وملاحظات السيد(ة) المفتش(ة).</p>
    </div>
    <div class="dest-hint" style="color:var(--success);">
      ${ic("pen", 16)} مُوقّع إلكترونيًا بتاريخ <span class="num">${formatDate(new Date())}</span> بواسطة ${esc(state.user.email)}
    </div>
    <div class="drawer-actions">
      <button class="btn btn-secondary" onclick="closeDrawer()">إغلاق</button>
    </div>`);
}

function renderSettings(main) {
  const st = storageStats();
  const pct = st.total / st.quota * 100;
  const share = v => st.total ? (v / st.total * 100) : 0;
  const segPdf = share(st.byFamily.pdf);
  const segOffice = share(st.byFamily.office);
  const segMedia = share(st.byFamily.media);

  main.innerHTML = `
    ${crumb([
      { label: "لوحة القيادة", href: "#/d" },
      { label: "الإعدادات", href: "#/set" }
    ])}
    <div class="page-head">
      <div class="titles">
        <h1>الإعدادات والتخزين</h1>
        <p class="meta">إدارة الحساب، التخزين، والنسخ الاحتياطي للملف التراكمي</p>
      </div>
    </div>

    <div class="settings-grid" style="margin-top:24px;">
      <section class="panel" aria-labelledby="setNotif">
        <div class="panel-head"><h2 class="h3" id="setNotif">${ic("bell", 19)} الإشعارات والتنبيهات</h2></div>
        <div class="setting-line">
          <span class="sl-body"><b>تذكيرات التحيين الدوري</b><span>تنبيه شهري عند وجود خانات فارغة في عناصر التفتيش</span></span>
          <span class="push"><label class="switch"><input type="checkbox" checked aria-label="تذكيرات التحيين الدوري"><span class="track"></span></label></span>
        </div>
        <div class="setting-line">
          <span class="sl-body"><b>إشعارات اطلاع المفتش(ة)</b><span>إخباري عند فتح رابط المعاينة للملف</span></span>
          <span class="push"><label class="switch"><input type="checkbox" checked aria-label="إشعارات اطلاع المفتش"><span class="track"></span></label></span>
        </div>
      </section>

      <section class="panel" aria-labelledby="setPriv">
        <div class="panel-head"><h2 class="h3" id="setPriv">${ic("shield", 19)} الخصوصية والمسؤولية</h2></div>
        <div class="setting-line">
          <span class="sl-body"><b>قفل الجلسة التلقائي</b><span>بعد 15 دقيقة من السكون صيانةً لبيانات التلاميذ</span></span>
          <span class="push"><label class="switch"><input type="checkbox" checked aria-label="قفل الجلسة"><span class="track"></span></label></span>
        </div>
        <div class="setting-line">
          <span class="sl-body"><b>عقد المسؤولية المهنية</b><span class="num">مُعتمد إلكترونيًا في ${formatDate(new Date())}</span></span>
          <span class="push"><button class="btn btn-secondary btn-sm" id="reviewContractBtn">مراجعة العقد</button></span>
        </div>
      </section>

      <section class="panel" aria-labelledby="setStore">
        <div class="panel-head"><h2 class="h3" id="setStore">${ic("database", 19)} حالة التخزين والأرشيف</h2></div>
        <div class="panel-body" style="display:grid;gap:14px;">
          <div class="storage-bar" role="img" aria-label="توزيع التخزين المستعمل">
            <i class="seg-pdf" style="width:${segPdf}%"></i><i class="seg-office" style="width:${segOffice}%"></i><i class="seg-media" style="width:${segMedia}%"></i>
          </div>
          <div class="legend-rows">
            <div class="lr"><span class="swatch seg-pdf"></span> PDF <span class="push num">${humanSize(st.byFamily.pdf)}</span></div>
            <div class="lr"><span class="swatch seg-office"></span> مستندات أوفيس (DOCX/XLSX) <span class="push num">${humanSize(st.byFamily.office)}</span></div>
            <div class="lr"><span class="swatch seg-media"></span> وسائط ومرفقات <span class="push num">${humanSize(st.byFamily.media)}</span></div>
          </div>
          <p class="meta num">المستعمل: ${humanSize(st.total)} من 5 غيغابايت · ${st.personalCount} مستند شخصي · ${st.platformCount} وثيقة منهاج</p>
          <div class="drawer-actions">
            <button class="btn btn-secondary" id="fullExportBtn">${ic("download", 18)} تصدير نسخة أرشيفية (ZIP)</button>
            <button class="btn btn-ghost" id="importCopyBtn">${ic("upload", 18)} استيراد مستندات</button>
          </div>
        </div>
      </section>

      <section class="panel danger-zone" aria-labelledby="setDanger">
        <div class="panel-head"><h2 class="h3" id="setDanger">إفراغ الملف</h2></div>
        <div class="setting-line">
          <span class="sl-body"><b>إعادة تعيين المستندات الشخصية</b><span>حذف جميع المستندات المودعة وإبقاء وثائق المنهاج الرسمية</span></span>
          <span class="push"><button class="btn btn-danger-outline" id="wipeBtn">إعادة تعيين</button></span>
        </div>
      </section>
    </div>`;

  $("#reviewContractBtn").onclick = agreementDrawer;
  $("#fullExportBtn").onclick = () => toast("تصدير تجريبي: سيُجمَّع الملف في أرشيف ZIP");
  $("#importCopyBtn").onclick = () => openUploadDrawer({});
  const wipe = $("#wipeBtn");
  wipe.onclick = () => {
    if (wipe.dataset.armed) toast("هذا نموذج أولي: لم يُحذف أي شيء", "error");
    else {
      wipe.dataset.armed = "1";
      wipe.classList.remove("btn-danger-outline");
      wipe.classList.add("btn-danger-fill");
      wipe.textContent = "تأكيد نهائي؟";
    }
  };
}

/* ---------- Auth Session ---------- */

function primaryEmailAddress(user) {
  const primary = user.emailAddresses.find(a => a.id === user.primaryEmailAddressId);
  return primary ? primary.emailAddress : user.emailAddresses[0]?.emailAddress || "";
}

function displayName(user) {
  return user.fullName || user.firstName || primaryEmailAddress(user).split("@")[0] || "أستاذ(ة) الفلسفة";
}

function enterApp(clerk) {
  const user = clerk.user;
  state.user = { name: displayName(user), email: primaryEmailAddress(user) };
  $("#topUserMeta").textContent = state.user.email;
  $("#authView").hidden = true;
  $("#appView").hidden = false;
  mountUserButton(clerk);
  if (!location.hash || location.hash === "#/") location.hash = "#/d";
  renderRoute();
  toast("مرحبًا بك، ملفك المهني التراكمي جاهز");
}

function mountUserButton(clerk) {
  const mount = $("#userButtonMount");
  mount.innerHTML = "";
  clerk.mountUserButton(mount);
}

function showAuth(clerk) {
  state.user = null;
  $("#appView").hidden = true;
  $("#authView").hidden = false;
  const mount = $("#clerkAuthMount");
  mount.innerHTML = "";
  clerk.mountSignIn(mount);
}

export function showFatalAuthError() {
  state.user = null;
  $("#appView").hidden = true;
  $("#authView").hidden = false;
  const mount = $("#clerkAuthMount");
  mount.innerHTML = `<div class="dest-hint" style="color:var(--danger,#b3261e);">تعذر تحميل خدمة الولوج. تحقق من الاتصال بالإنترنت ثم أعد تحميل الصفحة.</div>`;
}

export function start(clerk) {
  paintStaticChrome();
  buildIndex();
  window.addEventListener("hashchange", renderRoute);
  clerk.addListener(() => {
    if (clerk.isSignedIn && !$("#authView").hidden) enterApp(clerk);
    else if (!clerk.isSignedIn && !$("#appView").hidden) showAuth(clerk);
  });
  clerk.isSignedIn ? enterApp(clerk) : showAuth(clerk);
}

/* ---------- Popovers & Topbar ---------- */

function hidePops() {
  $("#notifPop").hidden = true;
}

function wireTopbar() {
  $("#searchIcon").innerHTML = ic("search", 18);
  $("#menuBtn").innerHTML = ic("menu");
  $("#notifBtn").innerHTML = ic("bell", 20);
  $("#importBtn .ic-slot").outerHTML = ic("upload", 17);
  $("#drawerClose").innerHTML = ic("x", 20);

  const gs = $("#globalSearch");
  gs.addEventListener("input", () => runSearch(gs.value));
  gs.addEventListener("focus", () => runSearch(gs.value));

  $("#importBtn").onclick = () => openUploadDrawer({});
  $("#notifBtn").onclick = (e) => {
    e.stopPropagation();
    const pop = $("#notifPop");
    pop.hidden = !pop.hidden;
  };
  $("#notifAll").onclick = () => { hidePops(); toast("سجل الإشعارات كامل متاح بعد الربط بالخادم"); };

  document.addEventListener("click", e => {
    if (!e.target.closest("#notifWrap")) hidePops();
    if (!e.target.closest("#searchWrap")) hideSearchResults();
  });

  $("#menuBtn").onclick = () => {
    $("#sidebar").classList.toggle("open");
    $("#mobileBackdrop").hidden = !$("#sidebar").classList.contains("open");
  };
  $("#mobileBackdrop").onclick = closeMobileSidebar;
}

function closeMobileSidebar() {
  $("#sidebar").classList.remove("open");
  $("#mobileBackdrop").hidden = true;
}

/* ---------- Router ---------- */

function renderRoute() {
  if (!state.user) return;
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const route = parts[0] || "d";
  const main = $("#main");
  if (route === "d") renderDashboard(main);
  else if (route === "s" && parts[1] != null) renderSectionPage(main, +parts[1]);
  else if (route === "e" && parts.length >= 4) {
    const si = +parts[1], ai = +parts[2], ei = +parts[3];
    if (TAXONOMY[si] && TAXONOMY[si].axes[ai] && TAXONOMY[si].axes[ai].elements[ei]) {
      renderElementPage(main, si, ai, ei);
    } else location.hash = "#/d";
  }
  else if (route === "set") renderSettings(main);
  else location.hash = "#/d";
  renderTree();
  window.scrollTo(0, 0);
}

window.closeDrawer = closeDrawer;

/* ---------- Init ---------- */

function paintStaticChrome() {
  $("#topBrandMark").outerHTML = brandMark(36);
  $("#authBrandMark").innerHTML = brandMark(46);
  $("#authSections").innerHTML = TAXONOMY.map((s, i) => {
    const t = sectionTotals(i);
    return `<li>${ic(SECTION_ICONS[i], 18)}<b>${s.short}</b><span class="count num">${t.total} خانة · ${t.platformCount} وثيقة مرجعية</span></li>`;
  }).join("");

  wireTopbar();
  wireDrawerClose();
}
