import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = "C:\\Users\\Pc\\Downloads\\الملف التراكمي";

function walk(dir) {
  let results = [];
  try {
    const list = readdirSync(dir);
    list.forEach(file => {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else {
        const ext = extname(file).toLowerCase();
        if (!file.startsWith("~") && ext !== ".crdownload" && ext !== ".tmp") {
          results.push({ path: fullPath, size: stat.size, name: file, ext });
        }
      }
    });
  } catch (e) {
    console.error("Error reading", dir, e.message);
  }
  return results;
}

const files = walk(root);

function getElementIdAndTitle(f) {
  const rel = relative(root, f.path);
  const parts = rel.split("\\");
  const sec = parts[0] || "";
  const axis = parts[1] || "";
  const sub = parts[2] || "";

  let element_id = "";
  let title = f.name.replace(/\.[^/.]+$/, "");
  let tags = [];

  if (sec.includes("التربوي")) {
    if (axis.includes("التشريع")) {
      if (sub.includes("مراسيم")) {
        element_id = "tarbawi.tashrii.maraseem";
        tags = ["تشريع", "مراسيم", "قانون"];
      } else if (sub.includes("أخلاقيات")) {
        element_id = "tarbawi.tashrii.akhlaqiyat";
        tags = ["تشريع", "أخلاقيات", "ميثاق"];
      } else {
        element_id = "tarbawi.tashrii.mudhakkirat";
        tags = ["تشريع", "مذكرات"];
      }
    } else if (axis.includes("المسار")) {
      if (sub.includes("الاندماج")) element_id = "tarbawi.masar.indimaj";
      else if (sub.includes("الاستقرار")) element_id = "tarbawi.masar.istiqrar";
      else element_id = "tarbawi.masar.tatawwur";
      tags = ["مسار مهني"];
    } else if (axis.includes("دفتر النصوص")) {
      if (sub.includes("المعطيات")) {
        element_id = "tarbawi.daftar.mutayat";
        tags = ["دفتر النصوص", "معطيات تربوية"];
      } else if (sub.includes("تتبع إنجاز")) {
        element_id = "tarbawi.daftar.injez";
        tags = ["دفتر النصوص", "إنجاز الدروس"];
      } else if (sub.includes("تتبع عمل")) {
        element_id = "tarbawi.daftar.amal";
        tags = ["دفتر النصوص", "تتبع التلميذ"];
      }
    }
  } else if (sec.includes("الديداكتيكي")) {
    if (axis.includes("تخطيط")) {
      if (sub.includes("الوثائق")) {
        element_id = "didaktiki.takhtit.wathaiq";
        tags = ["تخطيط التعلمات", "وثائق تربوية"];
      } else if (sub.includes("البطاقات")) {
        element_id = "didaktiki.takhtit.bitaqat";
        tags = ["تخطيط التعلمات", "بطاقات تقنية"];
      } else if (sub.includes("البرنامج")) {
        element_id = "didaktiki.takhtit.barnamaj";
        tags = ["تخطيط التعلمات", "برنامج دراسي"];
      }
    } else if (axis.includes("تدبير")) {
      if (sub.includes("الوثائق")) {
        element_id = "didaktiki.tadbir.wathaiq";
        tags = ["تدبير التعلمات", "وثائق تربوية"];
      } else if (sub.includes("البطاقات")) {
        element_id = "didaktiki.tadbir.bitaqat";
        tags = ["تدبير التعلمات", "بطاقات تقنية"];
      } else {
        element_id = "didaktiki.tadbir.abead";
        tags = ["تدبير التعلمات"];
      }
    } else if (axis.includes("تقويم")) {
      if (sub.includes("الوثائق")) {
        element_id = "didaktiki.taqwim.wathaiq";
        tags = ["تقويم التعلمات", "وثائق تربوية"];
      } else if (sub.includes("البطاقات")) {
        element_id = "didaktiki.taqwim.bitaqat";
        tags = ["تقويم التعلمات", "بطاقات تقنية"];
      } else if (sub.includes("الأساليب")) {
        element_id = "didaktiki.taqwim.asalib";
        tags = ["تقويم التعلمات", "أساليب تقويمية", "وضعيات اختبارية"];
      }
    }
  } else if (sec.includes("التكويني")) {
    if (axis.includes("الممارسة")) {
      if (sub.includes("التوصيف")) {
        element_id = "takwini.mumarsa.tawsif";
        tags = ["الممارسة المهنية", "توصيف"];
      } else {
        element_id = "takwini.mumarsa.shabakat";
        tags = ["الممارسة المهنية", "شبكات"];
      }
    } else if (axis.includes("التكوين")) {
      if (sub.includes("التوصيف")) {
        element_id = "takwini.takwin.tawsif";
        tags = ["التكوين المستمر", "توصيف"];
      } else {
        element_id = "takwini.takwin.shabakat";
        tags = ["التكوين المستمر", "شبكات"];
      }
    } else if (axis.includes("الصحة")) {
      element_id = "takwini.sihha.shabakat";
      tags = ["الصحة المهنية", "شبكات"];
    }
  }

  // Include level tags if in path
  if (rel.includes("1 TC") || rel.includes("TC")) tags.push("جذع مشترك");
  if (rel.includes("2 1BAC") || rel.includes("1BAC")) tags.push("أولى باك");
  if (rel.includes("3 2BAC") || rel.includes("2BAC")) tags.push("ثانية باك");

  return {
    file: rel,
    element_id,
    title,
    tags: Array.from(new Set(tags))
  };
}

const manifest = {
  comment: "Comprehensive platform manifest for Moroccan Philosophy Teacher Portfolio. Contains all 206 valid content files from C:\\Users\\Pc\\Downloads\\الملف التراكمي across all 3 sections.",
  version: "2026-08-29",
  source_root: root,
  fiches: files.map(getElementIdAndTitle)
};

const outPath = join(__dirname, "manifests", "platform-fiches.json");
writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf-8");
console.log("Successfully wrote", manifest.fiches.length, "fiches to:", outPath);
