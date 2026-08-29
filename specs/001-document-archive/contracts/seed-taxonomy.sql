-- Migration 0002: official ministry taxonomy seed (FR-005, Constitution IV).
-- Source of truth: prototype js/data.js extracted to DB (research R8).
-- Idempotent: upsert by stable slug ids. Depth invariant section→axis→element.

insert into public.taxonomy_nodes (id, parent_id, kind, label_ar, levels) values
-- ===== القسم التربوي الإداري =====
('tarbawi',            null,      'section', 'القسم التربوي الإداري', '{}'),
('tarbawi.tashrii',    'tarbawi', 'axis',    'التشريع المدرسي',       '{}'),
('tarbawi.tashrii.lawa',  'tarbawi.tashrii', 'element', 'القوانين والآليات التنظيمية', '{}'),
('tarbawi.tashrii.mudhakkirat', 'tarbawi.tashrii', 'element', 'المذكرات والقرارات الوزارية', '{}'),
('tarbawi.masar',      'tarbawi', 'axis',    'المسار المهني',         '{}'),
('tarbawi.masar.wathaiq', 'tarbawi.masar', 'element', 'الوثائق الإدارية والمسار', '{}'),
('tarbawi.masar.taqiim',  'tarbawi.masar', 'element', 'تقييمات الأداء والترقية', '{}'),
('tarbawi.daftar',     'tarbawi', 'axis',    'دفتر النصوص',           '{}'),
('tarbawi.daftar.hawashi', 'tarbawi.daftar', 'element', 'الحصص والملاحظات اليومية', '{}'),
('tarbawi.daftar.tawqiiat', 'tarbawi.daftar', 'element', 'التوقيعات والزيارات', '{}'),

-- ===== القسم الديداكتيكي =====
('didaktiki',          null,      'section', 'القسم الديداكتيكي',     '{}'),
('didaktiki.takhtit',  'didaktiki','axis',   'تخطيط التعلمات',        '{}'),
('didaktiki.takhtit.judhur',  'didaktiki.takhtit', 'element', 'الجذع المشترك', '{جذع مشترك}'),
('didaktiki.takhtit.awla',    'didaktiki.takhtit', 'element', 'الأولى باك', '{أولى باك}'),
('didaktiki.takhtit.thania',  'didaktiki.takhtit', 'element', 'الثانية باك', '{ثانية باك}'),
('didaktiki.tadbir',   'didaktiki','axis',   'تدبير التعلمات',        '{}'),
('didaktiki.tadbir.judhur',   'didaktiki.tadbir', 'element', 'الجذع المشترك', '{جذع مشترك}'),
('didaktiki.tadbir.awla',     'didaktiki.tadbir', 'element', 'الأولى باك', '{أولى باك}'),
('didaktiki.tadbir.thania',   'didaktiki.tadbir', 'element', 'الثانية باك', '{ثانية باك}'),
('didaktiki.taqwim',   'didaktiki','axis',   'تقويم التعلمات',        '{}'),
('didaktiki.taqwim.faradiya', 'didaktiki.taqwim', 'element', 'الفروض والامتحانات', '{}'),
('didaktiki.taqwim.nataij',   'didaktiki.taqwim', 'element', 'النتائج والإحصائيات', '{}'),
('didaktiki.taqwim.iilaji',   'didaktiki.taqwim', 'element', 'معالجة المكتسبات', '{}'),

-- ===== القسم التكويني المهني =====
('takwini',            null,      'section', 'القسم التكويني المهني', '{}'),
('takwini.mumarsa',    'takwini', 'axis',    'الممارسة المهنية',      '{}'),
('takwini.mumarsa.abhath', 'takwini.mumarsa', 'element', 'البحوث والمقالات المهنية', '{}'),
('takwini.mumarsa.ziyarat', 'takwini.mumarsa', 'element', 'زيارات التفتيش والتتبع', '{}'),
('takwini.mihwarat',   'takwini', 'axis',    'محاور التكوين',         '{}'),
('takwini.mihwarat.dawrat', 'takwini.mihwarat', 'element', 'الدورات والتكوينات المستمرة', '{}'),
('takwini.mihwarat.shahadat', 'takwini.mihwarat', 'element', 'شهادات الحضور والمشاركة', '{}'),
('takwini.sihha',      'takwini', 'axis',    'الصحة المهنية',         '{}'),
('takwini.sihha.ijraat', 'takwini.sihha', 'element', 'الإجراءات الوقائية', '{}'),
('takwini.sihha.taqrirat', 'takwini.sihha', 'element', 'التقارير الصحية والاجتماعية', '{}')
on conflict (id) do update
set parent_id = excluded.parent_id,
    kind      = excluded.kind,
    label_ar  = excluded.label_ar,
    levels    = excluded.levels;
