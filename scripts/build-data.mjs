import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const manifestPath = join(__dirname, 'manifests', 'platform-fiches.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const fiches = manifest.fiches.map((f, idx) => {
  let level = null;
  if (f.tags.includes('جذع مشترك') || f.file.includes('TC') || f.file.includes('tc')) level = 'جذع مشترك';
  else if (f.tags.includes('أولى باك') || f.file.includes('1BAC') || f.file.includes('1bac')) level = 'أولى باك';
  else if (f.tags.includes('ثانية باك') || f.file.includes('2BAC') || f.file.includes('2bac')) level = 'ثانية باك';

  const filename = basename(f.file);
  return {
    id: 'pf-' + (idx + 1),
    element_id: f.element_id,
    name: filename,
    title: f.title || filename.replace(/\.[^.]+$/, ''),
    file_path: f.file,
    level: level,
    tags: f.tags || [],
    size: filename.endsWith('.pdf') ? 1450000 : 125000,
    scope: 'platform'
  };
});

const fileHeader = `"use strict";

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو", "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر"];
const AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const TAXONOMY = [
  {
    id: "tarbawi",
    folderName: "القسم التربوي-الإدراي",
    name: "القسم التربوي الإداري",
    short: "تربوي",
    tagline: "تربويا، إداريا، ديداكتيكيا",
    desc: "توثيق الانخراط في مشروع المؤسسة المندمج، ودعم الحكامة التشاركية، وتتبع المسار الإداري والمهني من الاندماج إلى التقاعد.",
    axes: [
      {
        id: "tarbawi.tashrii",
        folderName: "1التشريع المدرسي",
        name: "التشريع المدرسي",
        elements: [
          {
            id: "tarbawi.tashrii.maraseem",
            folderName: "1مراسيم",
            name: "المراسيم والقوانين التنظيمية",
            slots: ["القانون الأساسي للمؤسسات التعليمية", "النظام الأساسي للوظيفة العمومية", "النظام الأساسي الخاص بموظفي الوزارة", "النظام الداخلي للمؤسسة"]
          },
          {
            id: "tarbawi.tashrii.mudhakkirat",
            folderName: "2مذكرات",
            name: "المذكرات والقرارات الوزارية",
            slots: ["مذكرة التأمين المدرسي والرياضي", "مذكرة تنظيم وتدبير الزمن المدرسي", "مذكرة الدعم التربوي الوقائي", "مذكرة زجر الغش في الامتحانات"]
          },
          {
            id: "tarbawi.tashrii.akhlaqiyat",
            folderName: "3أخلاقيات",
            name: "ميثاق وأخلاقيات المهنة",
            slots: ["ميثاق أخلاقيات المهنة", "ميثاق حسن سلوك الموظف العمومي", "دليل واجبات والتزامات المربي"]
          }
        ]
      },
      {
        id: "tarbawi.masar",
        folderName: "2المسار المهني",
        name: "المسار المهني",
        elements: [
          {
            id: "tarbawi.masar.indimaj",
            folderName: "1الاندماج المهني",
            name: "الاندماج المهني (التوظيف، التعيين، الترسيم)",
            slots: ["التوظيف: دراسة الملف والانتقاء", "التوظيف: اجتياز المباراة", "التوظيف: استيفاء التكوين بالمراكز", "التعيين: مصالح الأكاديمية الجهوية", "التعيين: المديرية الإقليمية", "التعيين: المؤسسة التعليمية", "الترسيم: تقرير المفتش والملف التربوي", "الترسيم: الملف الإداري", "الترسيم: محضر المناقشة النهائية"]
          },
          {
            id: "tarbawi.masar.istiqrar",
            folderName: "2الاستقرار المهني",
            name: "الاستقرار المهني (الترقية، الحركة، الرخص)",
            slots: ["الترقية: بالأقدمية والجدول", "الترقية: بالاختيار والكفاءة", "الترقية: بالامتحان المهني", "الحركة الانتقالية: الوطنية", "الحركة الانتقالية: الجهوية", "الحركة الانتقالية: الإقليمية", "الرخص: الصحية والمرضية", "الرخص: الشخصية والاستثنائية", "الرخص: الإدارية والولادة", "الإلحاق والاستيداع"]
          },
          {
            id: "tarbawi.masar.tatawwur",
            folderName: "3التطور المهني",
            name: "التطور المهني (تغيير الإطار، التقاعد)",
            slots: ["تغيير الإطار: مسلك الإدارة والمتصرف التربوي", "تغيير الإطار: مركز التفتيش التربوي", "تغيير الإطار: التوجيه والتخطيط والمختص التربوي", "التقاعد: النسبي واستيفاء الشروط", "التقاعد: بلوغ حد السن القانوني"]
          }
        ]
      },
      {
        id: "tarbawi.daftar",
        folderName: "3دفتر النصوص",
        name: "دفتر النصوص",
        elements: [
          {
            id: "tarbawi.daftar.mutayat",
            folderName: "1المعطيات التربوية",
            name: "المعطيات التربوية والمقرر الوزاري",
            slots: ["المقرر الوزاري لتنظيم السنة الدراسية", "البطاقة الشخصية والمعلومات العامة", "مجلس التدبير بالمؤسسة", "المجلس التعليمي لمادة الفلسفة", "مجالس الأقسام والتوجيه", "جدول الحصص واستعمالات الزمن"]
          },
          {
            id: "tarbawi.daftar.injez",
            folderName: "2تتبع إنجاز الدروس",
            name: "تتبع إنجاز الدروس والمستويات",
            levels: ["جذع مشترك", "أولى باك", "ثانية باك"],
            slots: ["الجذع المشترك: تتبع إنجاز الدورة الأولى", "الجذع المشترك: تتبع إنجاز الدورة الثانية", "الأولى باكالوريا: تتبع إنجاز الدورة الأولى", "الأولى باكالوريا: تتبع إنجاز الدورة الثانية", "الثانية باكالوريا: تتبع إنجاز الدورة الأولى", "الثانية باكالوريا: تتبع إنجاز الدورة الثانية"]
          },
          {
            id: "tarbawi.daftar.amal",
            folderName: "3تتبع عمل التلميذ(ة)",
            name: "تتبع عمل التلميذ(ة) والمواظبة",
            levels: ["جذع مشترك", "أولى باك", "ثانية باك"],
            slots: ["الجذع المشترك: بطاقات التتبع والمواظبة", "الأولى باكالوريا: بطاقات التتبع والمواظبة", "الثانية باكالوريا: بطاقات التتبع والمواظبة"]
          }
        ]
      }
    ]
  },
  {
    id: "didaktiki",
    folderName: "2القسم الديداكتيكي-المدرسي",
    name: "القسم الديداكتيكي المدرسي",
    short: "ديداكتيكي",
    tagline: "هندسة الممارسة الصفية",
    desc: "هندسة الممارسة الصفية عبر تخطيط التعلمات وتدبيرها وتقويمها، وفق مقاربات ديداكتيكية حديثة وبيداغوجيا الكفايات.",
    axes: [
      {
        id: "didaktiki.takhtit",
        folderName: "1تخطيط التعلمات",
        name: "تخطيط التعلمات",
        elements: [
          {
            id: "didaktiki.takhtit.wathaiq",
            folderName: "1الوثائق التربوية",
            name: "الوثائق التربوية ودلائل المنهاج",
            slots: ["التوجيهات التربوية الرسمية الخاصة بتدريس الفلسفة", "دليل إدماج تكنولوجيا المعلومات والاتصال (CIME)", "دليل الحياة المدرسية بالمؤسسات التعليمية"]
          },
          {
            id: "didaktiki.takhtit.bitaqat",
            folderName: "2البطاقات التقنية",
            name: "البطاقات التقنية والتوزيع الدوري",
            levels: ["جذع مشترك", "أولى باك", "ثانية باك"],
            slots: ["السيرورة التعليمية التعلمية", "اللوازم المدرسية الإلزامية للتلميذ(ة)", "التوزيع الدوري: الجذع المشترك (S1/S2)", "التوزيع الدوري: الأولى باكالوريا (S1/S2)", "التوزيع الدوري: الثانية باكالوريا (S1/S2)"]
          },
          {
            id: "didaktiki.takhtit.barnamaj",
            folderName: "3البرنامج الدراسي",
            name: "البرنامج الدراسي والمجزوءات والمصوغات",
            levels: ["جذع مشترك", "أولى باك", "ثانية باك"],
            slots: ["الجذع المشترك S1: مصوغة الفلسفة", "الجذع المشترك S2: مصوغة الطبيعة والثقافة", "الأولى باك S1: مصوغة الوضع البشري", "الأولى باك S2: مصوغة المعرفة", "الثانية باك S1: الوضع البشري والمعرفة", "الثانية باك S2: السياسة والأخلاق", "سيرورات القدرات والمهارات والدعامات"]
          }
        ]
      },
      {
        id: "didaktiki.tadbir",
        folderName: "2تدبير التعلمات",
        name: "تدبير التعلمات",
        elements: [
          {
            id: "didaktiki.tadbir.wathaiq",
            folderName: "1الوثائق التربوية",
            name: "الوثائق التربوية وميثاق القسم",
            slots: ["دليل التواصل البيداغوجي والتنشيط الصفي", "دليل الحياة المدرسية وأنشطة التفتح", "ميثاق القسم لمادة الفلسفة"]
          },
          {
            id: "didaktiki.tadbir.bitaqat",
            folderName: "2البطاقات التقنية",
            name: "البطاقات التقنية والطرائق البيداغوجية",
            slots: ["بطاقة التواصل البيداغوجي وآليات التفاعل", "بطاقة الطرائق البيداغوجية الحديثة", "بطاقة أساليب التدريس والقيادة الصفية", "بطاقة تدبير الحصة والتحويل الديداكتيكي"]
          },
          {
            id: "didaktiki.tadbir.abead",
            folderName: "3أبعاد الممارسة الصفية",
            name: "أبعاد الممارسة الصفية والتفاعلات",
            slots: ["أبعاد التعلمات: تدبير الحصة والملخص التكويني", "أبعاد الوسائل: المحددة والمجردة والمبنية", "أبعاد التفاعلات: التواصل والتنشيط والقيادة"]
          }
        ]
      },
      {
        id: "didaktiki.taqwim",
        folderName: "3تقويم التعلمات",
        name: "تقويم التعلمات",
        elements: [
          {
            id: "didaktiki.taqwim.wathaiq",
            folderName: "1الوثائق التربوية",
            name: "الوثائق التربوية والأطر المرجعية والمذكرات",
            slots: ["المذكرة الوزارية 04-142 المنظمة للتقويم التربوي", "الإطار المرجعي المحين للامتحان الوطني الموحد", "المذكرة 04-7 المنظمة للمراقبة المستمرة"]
          },
          {
            id: "didaktiki.taqwim.bitaqat",
            folderName: "2البطاقات التقنية",
            name: "البطاقات التقنية والاستعدادات المنهجية",
            slots: ["تعليمات تربوية وموجهات التقويم", "استعدادات منهجية للامتحانات الإشهادية", "شبكات التقييم الذاتي والتكويني للمتعلم"]
          },
          {
            id: "didaktiki.taqwim.asalib",
            folderName: "3الأساليب التقويمية",
            name: "الأساليب التقويمية وبنك الوضعيات الاختبارية والدعم",
            levels: ["جذع مشترك", "أولى باك", "ثانية باك"],
            slots: ["التقويم التشخيصي القبلي: جذاذات وروائز ودعم", "التقويم التكويني المرحلي: فروض وأنشطة شهرية", "التقويم الإجمالي البعدي: امتحانات تجريبية ووضعيات", "أنشطة الدعم والمعالجة الديداكتيكية المستمرة"]
          }
        ]
      }
    ]
  },
  {
    id: "takwini",
    folderName: "3القسم التكويني-المهني",
    name: "القسم التكويني المهني",
    short: "تكويني",
    tagline: "الممارسة التبصرية والنقد الذاتي",
    desc: "توثيق الالتزام بالممارسة التبصرية، والتكوين المستمر، والمحافظة على الصحة المهنية في خدمة تجويد الأداء التدريسي.",
    axes: [
      {
        id: "takwini.mumarsa",
        folderName: "1الممارسة المهنية",
        name: "الممارسة المهنية",
        elements: [
          {
            id: "takwini.mumarsa.tawsif",
            folderName: "1التوصيف والأسس",
            name: "التوصيف المعتمد والأسس التحليلية",
            slots: ["تحليل الممارسة المهنية الصفية: المفهوم والأبعاد ومعايير التحليل", "الأسس النفسية والاجتماعية والديداكتيكية للممارسة"]
          },
          {
            id: "takwini.mumarsa.shabakat",
            folderName: "2الشبكات وبطاقات التقييم",
            name: "الشبكات التبصرية وبطاقات تقييم الأداء",
            slots: ["بطاقة تقييم الأداء التواصلي للمدرس(ة)", "الشبكة الديداكتيكية والعلائقية لتحليل الحصة الصفية"]
          }
        ]
      },
      {
        id: "takwini.takwin",
        folderName: "2التكوين المستمر",
        name: "التكوين المستمر ومحاور التكوين",
        elements: [
          {
            id: "takwini.takwin.tawsif",
            folderName: "1توصيف التخصص والمجالات",
            name: "توصيف التخصص (الفلسفة وعلوم التربية)",
            slots: ["توصيف مادة الفلسفة بالتعليم الثانوي التأهيلي", "توصيف المباحث الفلسفية والقضايا المعاصرة", "توصيف علوم التربية ونظريات التعلم"]
          },
          {
            id: "takwini.takwin.shabakat",
            folderName: "2الشبكات وبطاقات التقييم",
            name: "الشبكات التقويمية للمعارف التخصصية",
            slots: ["بطاقة تقييم المعارف التخصصية والبيداغوجية", "تقرير المشاركة في الندوات والأيام الدراسية والبحث التربوي"]
          }
        ]
      },
      {
        id: "takwini.sihha",
        folderName: "3الصحة المهنية",
        name: "الصحة المهنية والوقاية",
        elements: [
          {
            id: "takwini.sihha.shabakat",
            folderName: "1الشبكات التشخيصية",
            name: "الشبكات التشخيصية والإجهاد السيكو-فيزيولوجي",
            slots: ["بطاقة تقييم الإجهاد السيكو-فيزيولوجي للأستاذ(ة)", "شبكة تشخيص بيئة العمل الصفي ومناخ المؤسسة", "دليل استدامة الطاقة والوقاية من الاحتراق النفسي"]
          }
        ]
      }
    ]
  }
];

function slotKey(s, a, e, q) { return s + "." + a + "." + e + "." + q; }

function elementSlotCount(s, a, e) { return TAXONOMY[s].axes[a].elements[e].slots.length; }

function getElementById(elementId) {
  for (let si = 0; si < TAXONOMY.length; si++) {
    for (let ai = 0; ai < TAXONOMY[si].axes.length; ai++) {
      for (let ei = 0; ei < TAXONOMY[si].axes[ai].elements.length; ei++) {
        if (TAXONOMY[si].axes[ai].elements[ei].id === elementId) {
          return { si, ai, ei, element: TAXONOMY[si].axes[ai].elements[ei], axis: TAXONOMY[si].axes[ai], section: TAXONOMY[si] };
        }
      }
    }
  }
  return null;
}

const PLATFORM_FICHES = `;

const fileFooter = `;\n
function platformFichesOfElement(si, ai, ei) {
  const elId = TAXONOMY[si].axes[ai].elements[ei].id;
  return PLATFORM_FICHES.filter(f => f.element_id === elId);
}

function sectionTotals(si) {
  let total = 0, filled = 0, platformCount = 0;
  TAXONOMY[si].axes.forEach((axis, ai) => {
    axis.elements.forEach((el, ei) => {
      el.slots.forEach((slot, qi) => {
        total += 1;
        if (FILES.some(f => f.key === slotKey(si, ai, ei, qi))) filled += 1;
      });
      platformCount += platformFichesOfElement(si, ai, ei).length;
    });
  });
  return { total, filled, platformCount };
}

function axisTotals(si, ai) {
  let total = 0, filled = 0, platformCount = 0;
  TAXONOMY[si].axes[ai].elements.forEach((el, ei) => {
    el.slots.forEach((slot, qi) => {
      total += 1;
      if (FILES.some(f => f.key === slotKey(si, ai, ei, qi))) filled += 1;
    });
    platformCount += platformFichesOfElement(si, ai, ei).length;
  });
  return { total, filled, platformCount };
}

let FILES = [
  { key: slotKey(0, 0, 0, 0), name: "القانون الأساسي للمؤسسات التعليمية.pdf", size: 1.8e6, added: new Date(2026, 2, 3), note: "نسخة محينة من الجريدة الرسمية", scope: "personal" },
  { key: slotKey(0, 0, 0, 1), name: "النظام الأساسي للوظيفة العمومية.pdf", size: 2.1e6, added: new Date(2026, 2, 3), note: "النظام الأساسي العام رقم 1.58.008", scope: "personal" },
  { key: slotKey(0, 0, 2, 0), name: "ميثاق أخلاقيات المهنة.pdf", size: 1.1e6, added: new Date(2026, 4, 11), note: "الميثاق التربوي والأخلاقي", scope: "personal" },
  { key: slotKey(0, 1, 0, 5), name: "قرار التعيين بالمؤسسة.pdf", size: 4.2e5, added: new Date(2025, 8, 5), note: "المديرية الإقليمية", scope: "personal" },
  { key: slotKey(0, 1, 1, 0), name: "ملف الترقية بالأقدمية.pdf", size: 1.1e6, added: new Date(2026, 5, 15), note: "بحاجة إلى تحديث الشهادات", scope: "personal" },
  { key: slotKey(0, 2, 0, 0), name: "المقرر الوزاري لتنظيم السنة الدراسية 2026-2027.pdf", size: 3.4e6, added: new Date(2026, 6, 10), note: "المقرر الرسمي", scope: "personal" },
  { key: slotKey(0, 2, 0, 5), name: "جدول الحصص الأسبوعي.xlsx", size: 9.2e4, added: new Date(2025, 8, 7), note: "معتمد من طرف الإدارة", scope: "personal" },
  { key: slotKey(1, 0, 0, 0), name: "التوجيهات التربوية لمادة الفلسفة.pdf", size: 4.2e6, added: new Date(2026, 0, 15), note: "النسخة الرسمية للوزارة", scope: "personal" },
  { key: slotKey(1, 0, 1, 2), name: "التوزيع الدوري، الجذع المشترك S1.docx", size: 1.1e5, added: new Date(2025, 8, 14), note: "التوزيع السنوي والدوري المعتمد", scope: "personal" },
  { key: slotKey(1, 2, 0, 1), name: "الإطار المرجعي للامتحان الوطني المحين.pdf", size: 1.8e6, added: new Date(2026, 0, 9), note: "الإطار المرجعي المحين مادة الفلسفة", scope: "personal" }
];

const FORMAT_FAMILIES = [
  { id: "pdf", label: "PDF", test: /\\.pdf$/i },
  { id: "office", label: "مشتقات أوفيس", test: /\\.(docx?|xlsx?|pptx?)$/i },
  { id: "media", label: "صور وفيديو", test: /\\.(jpe?g|png|gif|webp|mp4|mov|avi|mkv)$/i }
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
  const m = /\\.([a-z0-9]+)$/i.exec(name);
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
  if (!bytes) return "0 بايت";
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1).replace(/\\.0$/, "") + " غيغابايت";
  if (bytes >= 1e6) return Math.round(bytes / 1e6) + " ميغابايت";
  if (bytes >= 1e3) return Math.round(bytes / 1e3) + " كيلوبايت";
  return bytes + " بايت";
}

function formatDate(d) {
  if (!d) return "";
  if (!(d instanceof Date)) d = new Date(d);
  return d.getDate() + " " + AR_MONTHS[d.getMonth()] + " " + d.getFullYear();
}

function todayLine() {
  const now = new Date();
  return AR_DAYS[now.getDay()] + " " + now.getDate() + " " + AR_MONTHS[now.getMonth()] + " " + now.getFullYear();
}

const SYNONYMS = {
  "جدول": "الحصص",
  "توزيع": "الدوري",
  "إطار": "المرجعي",
  "روائز": "الروائز",
  "وضعيات": "الوضعيات",
  "دفتر": "النصوص",
  "توجيهات": "التربوية",
  "مراسيم": "المراسيم",
  "ميثاق": "أخلاقيات",
  "إجهاد": "السيكو",
  "مصوغة": "البرنامج",
  "سيرورة": "السيرورة"
};

function suggestTarget(fileName) {
  const tokens = fileName.toLowerCase().split(/[\\s._,-]+/).filter(t => t.length > 2);
  let best = null, bestScore = 0;
  TAXONOMY.forEach((sec, si) => sec.axes.forEach((axis, ai) => axis.elements.forEach((el, ei) => {
    el.slots.forEach((slot, qi) => {
      let score = 0;
      tokens.forEach(tok => {
        const needle = SYNONYMS[tok] || tok;
        if ((slot + " " + el.name + " " + axis.name + " " + el.folderName + " " + axis.folderName).includes(needle)) score += 1;
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
  PLATFORM_FICHES.forEach(f => { byFamily[fileFamily(f.name)] += (f.size || 100000); total += (f.size || 100000); });
  return { byFamily, total, quota: 5e9, personalCount: FILES.length, platformCount: PLATFORM_FICHES.length };
}
`;

const fullCode = fileHeader + JSON.stringify(fiches, null, 2) + fileFooter;
const targetPath = join(__dirname, '..', 'js', 'data.js');
writeFileSync(targetPath, fullCode, 'utf8');
console.log('Successfully wrote', fiches.length, 'platform fiches into', targetPath);
