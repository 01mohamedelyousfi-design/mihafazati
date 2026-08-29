"use strict";

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو", "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر"];
const AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const TAXONOMY = [
  {
    id: "tarbawi",
    name: "القسم التربوي الإداري",
    short: "تربوي",
    tagline: "تربويا، إداريا، ديداكتيكيا",
    desc: "توثيق الانخراط في مشروع المؤسسة المندمج، ودعم الحكامة التشاركية، وتتبع المسار الإداري للمهنة من الاندماج إلى التقاعد.",
    axes: [
      {
        name: "التشريع المدرسي",
        elements: [
          { name: "المراسيم", slots: ["الوظيفة العمومية", "القانون الأساسي", "القانون الداخلي"] },
          { name: "المذكرات", slots: ["التأمين", "الزمن المدرسي", "الدعم التربوي", "منع الغش"] },
          { name: "الأخلاقيات", slots: ["ميثاق أخلاقيات المهنة"] }
        ]
      },
      {
        name: "المسار المهني",
        elements: [
          { name: "الاندماج", slots: ["التوظيف: الدراسة", "التوظيف: المباراة", "التوظيف: التكوين", "التعيين: الأكاديمية", "التعيين: المديرية", "التعيين: المؤسسة", "الترسيم: الملف التربوي", "الترسيم: الملف الإداري", "الترسيم: المناقشة"] },
          { name: "الاستقرار", slots: ["الترقية: الأقدمية", "الترقية: الكفاءة", "الترقية: المباراة", "الحركة: الوطنية", "الحركة: الجهوية", "الحركة: الإقليمية", "الرخص: الصحية", "الرخص: الشخصية", "الرخص: الإدارية", "الإلحاق"] },
          { name: "التطور", slots: ["تغيير الإطار: المتصرف", "تغيير الإطار: المفتش", "تغيير الإطار: المختص", "التقاعد النسبي", "التقاعد الكلي"] }
        ]
      },
      {
        name: "دفتر النصوص",
        elements: [
          { name: "معطيات", slots: ["البطاقة الشخصية", "مجلس التدبير", "المجلس التعليمي", "مجلس الأقسام", "جدول الحصص"] },
          { name: "تتبع إنجاز الدروس", slots: ["الجذع المشترك", "الأولى باك", "الثانية باك"] },
          { name: "تتبع عمل التلميذ(ة)", slots: ["الجذع المشترك", "الأولى باك", "الثانية باك"] }
        ]
      }
    ]
  },
  {
    id: "didaktiki",
    name: "القسم الديداكتيكي",
    short: "ديداكتيكي",
    tagline: "هندسة الممارسة الصفية",
    desc: "هندسة الممارسة الصفية عبر تخطيط التعلمات وتدبيرها وتقويمها، وفق مقاربات ديداكتيكية حديثة وبيداغوجيا إيجابية.",
    axes: [
      {
        name: "تخطيط التعلمات",
        elements: [
          { name: "الوثائق", slots: ["واجهة السيرورة", "واجهة البطاقة", "دليل إدماج تكنولوجيا المعلومات والاتصال", "دليل الحياة المدرسية"] },
          { name: "البطاقات", slots: ["التوزيع الدوري: الجذع المشترك", "التوزيع الدوري: الأولى باك", "التوزيع الدوري: الثانية باك", "اللوازم المدرسية: الجذع المشترك", "اللوازم المدرسية: الأولى باك", "اللوازم المدرسية: الثانية باك", "المقررات المجزوءة", "المقرر بالمفهوم", "المقرر بالمحور"] },
          { name: "البرنامج", slots: ["السيرورات: القدرات", "السيرورات: المهارات", "السيرورات: الدعامات", "الملخصات: الجذع المشترك", "الملخصات: الأولى باك", "الملخصات: الثانية باك"] }
        ]
      },
      {
        name: "تدبير التعلمات",
        elements: [
          { name: "الوثائق", slots: ["التواصل البيداغوجي", "واجهة السيرورة", "الحياة المدرسية", "التنشيط التربوي"] },
          { name: "البطاقات", slots: ["طرائق وأساليب بيداغوجية", "تدبير الحصة", "الملخص التكويني", "التحويل الديداكتيكي", "العرض المنظم"] },
          { name: "الأبعاد", slots: ["التعلمات: الحصة", "التعلمات: التحويل", "التعلمات: الملخص", "الوسائل: المحددة", "الوسائل: المجردة", "الوسائل: المبنية", "التفاعلات: التواصل", "التفاعلات: التنشيط", "التفاعلات: القيادة"] }
        ]
      },
      {
        name: "تقويم التعلمات",
        elements: [
          { name: "الوثائق", slots: ["الإطار المرجعي", "واجهة السيرورة", "المذكرة 4.07", "المذكرة 04.142", "التعليمات التربوية"] },
          { name: "البطاقات", slots: ["الاستعدادات المنهجية", "التقييم الذاتي"] },
          { name: "الأساليب", slots: ["التشخيصي القبلي: الجذاذة", "التشخيصي القبلي: الروائز", "التشخيصي القبلي: الدعم والمعالجة", "التكويني المرحلي: الجذاذة", "التكويني المرحلي: الأنشطة", "التكويني المرحلي: الدعم والمعالجة", "البعدي: الجذاذة", "البعدي: الوضعيات", "البعدي: الدعم والمعالجة"] }
        ]
      }
    ]
  },
  {
    id: "takwini",
    name: "القسم التكويني المهني",
    short: "تكويني",
    tagline: "الممارسة التبصرية والنقد الذاتي",
    desc: "توثيق الالتزام بالممارسة التبصرية، والتكوين المستمر، والمحافظة على الصحة المهنية في خدمة تجويد الأداء.",
    axes: [
      {
        name: "الممارسة المهنية",
        elements: [
          { name: "الأسس", slots: ["الأسس النفسية الاجتماعية", "البعد السريري الكلينيكي", "البعد الوظيفي التبصري", "الأسس الديداكتيكية"] },
          { name: "الأبعاد", slots: ["البعد المعرفي", "البعد التواصلي", "البعد البيداغوجي"] },
          { name: "الشبكات", slots: ["الشبكة الديداكتيكية", "الشبكة العلائقية", "المبادئ والآليات"] }
        ]
      },
      {
        name: "محاور التكوين",
        elements: [
          { name: "التخصص", slots: ["التاريخ والمباحث", "علوم إنسانية وترجمة", "القضايا الفلسفية"] },
          { name: "الديداكتيك", slots: ["المقاربات", "المناهج", "فلسفة التربية"] },
          { name: "علوم التربية", slots: ["علم النفس التربوي", "سوسيولوجيا التربية"] }
        ]
      },
      {
        name: "الصحة المهنية",
        elements: [
          { name: "الأسس", slots: ["الاستدامة", "الوقاية", "الالتزام"] },
          { name: "الأبعاد", slots: ["البعد الجسدي", "البعد النفسي", "البعد التواصلي", "الإجهاد البدني والنفسي والتواصلي"] },
          { name: "الشبكات", slots: ["المناخ الصفي", "تشخيص بيئة العمل"] }
        ]
      }
    ]
  }
];

function slotKey(s, a, e, q) { return s + "." + a + "." + e + "." + q; }

function elementSlotCount(s, a, e) { return TAXONOMY[s].axes[a].elements[e].slots.length; }

function sectionTotals(si) {
  let total = 0, filled = 0;
  TAXONOMY[si].axes.forEach((axis, ai) => {
    axis.elements.forEach((el, ei) => {
      el.slots.forEach((slot, qi) => {
        total += 1;
        if (FILES.some(f => f.key === slotKey(si, ai, ei, qi))) filled += 1;
      });
    });
  });
  return { total, filled };
}

function axisTotals(si, ai) {
  let total = 0, filled = 0;
  TAXONOMY[si].axes[ai].elements.forEach((el, ei) => {
    el.slots.forEach((slot, qi) => {
      total += 1;
      if (FILES.some(f => f.key === slotKey(si, ai, ei, qi))) filled += 1;
    });
  });
  return { total, filled };
}

let FILES = [
  { key: slotKey(0, 0, 0, 1), name: "النظام الأساسي الجديد، مرسوم 2.24.140.pdf", size: 2.1e6, added: new Date(2026, 2, 3), note: "نسخة رسمية من الجريدة الرسمية" },
  { key: slotKey(0, 0, 1, 2), name: "مذكرة الدعم التربوي الوقائي.pdf", size: 7.8e5, added: new Date(2026, 4, 11), note: "" },
  { key: slotKey(0, 1, 0, 5), name: "قرار التعيين بالمؤسسة.pdf", size: 4.2e5, added: new Date(2025, 8, 5), note: "" },
  { key: slotKey(0, 1, 1, 0), name: "ملف الترقية بالأقدمية.pdf", size: 1.1e6, added: new Date(2026, 5, 15), note: "بحاجة إلى تحديث الشهادات" },
  { key: slotKey(0, 2, 0, 4), name: "جدول الحصص الأسبوعي.xlsx", size: 9.2e4, added: new Date(2025, 8, 7), note: "" },
  { key: slotKey(0, 2, 1, 0), name: "دفتر النصوص، الجذع المشترك.docx", size: 1.48e5, added: new Date(2026, 0, 20), note: "" },
  { key: slotKey(1, 0, 1, 2), name: "التوزيع الدوري، الثانية باك.xlsx", size: 1.1e5, added: new Date(2025, 8, 14), note: "" },
  { key: slotKey(1, 1, 1, 0), name: "أنشطة بيداغوجيا الخطأ.pptx", size: 3.6e6, added: new Date(2025, 10, 22), note: "عرض مؤطر ضمن يوم تكويني" },
  { key: slotKey(1, 2, 0, 0), name: "الإطار المرجعي للامتحان الوطني.pdf", size: 1.8e6, added: new Date(2026, 0, 9), note: "" },
  { key: slotKey(1, 2, 2, 0), name: "جذاذة التقويم التشخيصي.xlsx", size: 9.6e4, added: new Date(2025, 8, 18), note: "" },
  { key: slotKey(2, 1, 0, 2), name: "ملخص القضايا الفلسفية المعاصرة.docx", size: 2.1e5, added: new Date(2026, 1, 4), note: "" },
  { key: slotKey(2, 1, 1, 2), name: "محاضرة في ديداكتيك الفلسفة.mp4", size: 4.6e7, added: new Date(2026, 3, 12), note: "تسجيل ندوة الأكاديمية" }
];

const FORMAT_FAMILIES = [
  { id: "pdf", label: "PDF", test: /\.pdf$/i },
  { id: "office", label: "مشتقات أوفيس", test: /\.(docx?|xlsx?|pptx?)$/i },
  { id: "media", label: "صور وفيديو", test: /\.(jpe?g|png|gif|webp|mp4|mov|avi|mkv)$/i }
];

function fileFamily(name) {
  const fam = FORMAT_FAMILIES.find(f => f.test.test(name));
  return fam ? fam.id : "other";
}

function familyLabel(id) {
  const fam = FORMAT_FAMILIES.find(f => f.id === id);
  return fam ? fam.label : "صيغ أخرى";
}

function formatChip(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  if (!m) return { label: "ملف", cls: "chip" };
  const ext = m[1].toLowerCase();
  if (ext === "pdf") return { label: "PDF", cls: "chip chip-pdf" };
  if (["doc", "docx"].includes(ext)) return { label: "DOC", cls: "chip chip-doc" };
  if (["xls", "xlsx"].includes(ext)) return { label: "XLS", cls: "chip chip-xls" };
  if (["ppt", "pptx"].includes(ext)) return { label: "PPT", cls: "chip chip-ppt" };
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return { label: "IMG", cls: "chip chip-img" };
  if (["mp4", "mov", "avi", "mkv"].includes(ext)) return { label: "VID", cls: "chip chip-vid" };
  return { label: ext.toUpperCase(), cls: "chip" };
}

function humanSize(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1).replace(/\.0$/, "") + " غيغابايت";
  if (bytes >= 1e6) return Math.round(bytes / 1e6) + " ميغابايت";
  if (bytes >= 1e3) return Math.round(bytes / 1e3) + " كيلوبايت";
  return bytes + " بايت";
}

function formatDate(d) {
  return d.getDate() + " " + AR_MONTHS[d.getMonth()] + " " + d.getFullYear();
}

function todayLine() {
  const now = new Date();
  return AR_DAYS[now.getDay()] + " " + now.getDate() + " " + AR_MONTHS[now.getMonth()] + " " + now.getFullYear();
}

const SYNONYMS = { "جدول": "الحصص", "توزيع": "الدوري", "إطار": "المرجعي", "روائز": "الروائز", "وضعيات": "الوضعيات", "دفتر": "النصوص" };

function suggestTarget(fileName) {
  const tokens = fileName.toLowerCase().split(/[\s._,-]+/).filter(t => t.length > 2);
  let best = null, bestScore = 0;
  TAXONOMY.forEach((sec, si) => sec.axes.forEach((axis, ai) => axis.elements.forEach((el, ei) => {
    el.slots.forEach((slot, qi) => {
      let score = 0;
      tokens.forEach(tok => {
        const needle = SYNONYMS[tok] || tok;
        if ((slot + " " + el.name + " " + axis.name).includes(needle)) score += 1;
      });
      if (score > bestScore) { bestScore = score; best = { si, ai, ei, qi }; }
    });
  })));
  return bestScore > 0 ? best : null;
}

function storageStats() {
  const byFamily = { pdf: 0, office: 0, media: 0, other: 0 };
  let total = 0;
  FILES.forEach(f => { byFamily[fileFamily(f.name)] += f.size; total += f.size; });
  return { byFamily, total, quota: 5e9 };
}
