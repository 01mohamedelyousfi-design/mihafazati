-- Migration 0002: official ministry taxonomy seed (FR-005, Constitution IV).
-- Source of truth: comprehensive 3-section ministerial hierarchy matching C:\Users\Pc\Downloads\الملف التراكمي.
-- Idempotent: upsert by stable slug ids. Depth invariant section→axis→element.

insert into public.taxonomy_nodes (id, parent_id, kind, label_ar, levels) values
-- ===== القسم التربوي الإداري =====
('tarbawi',                    null,              'section', 'القسم التربوي الإداري',                         '{}'),
('tarbawi.tashrii',            'tarbawi',         'axis',    'التشريع المدرسي',                               '{}'),
('tarbawi.tashrii.maraseem',   'tarbawi.tashrii', 'element', 'المراسيم والقوانين التنظيمية',                  '{}'),
('tarbawi.tashrii.mudhakkirat','tarbawi.tashrii', 'element', 'المذكرات والقرارات الوزارية',                  '{}'),
('tarbawi.tashrii.akhlaqiyat', 'tarbawi.tashrii', 'element', 'ميثاق وأخلاقيات المهنة',                      '{}'),

('tarbawi.masar',              'tarbawi',         'axis',    'المسار المهني',                                 '{}'),
('tarbawi.masar.indimaj',      'tarbawi.masar',   'element', 'الاندماج المهني (التوظيف، التعيين، الترسيم)',  '{}'),
('tarbawi.masar.istiqrar',     'tarbawi.masar',   'element', 'الاستقرار المهني (الترقية، الحركة، الرخص)',    '{}'),
('tarbawi.masar.tatawwur',     'tarbawi.masar',   'element', 'التطور المهني (تغيير الإطار والتقاعد)',        '{}'),

('tarbawi.daftar',             'tarbawi',         'axis',    'دفتر النصوص',                                   '{}'),
('tarbawi.daftar.mutayat',     'tarbawi.daftar',  'element', 'المعطيات التربوية والمقرر الوزاري',             '{}'),
('tarbawi.daftar.injez',       'tarbawi.daftar',  'element', 'تتبع إنجاز الدروس والمستويات',                 '{جذع مشترك,أولى باك,ثانية باك}'),
('tarbawi.daftar.amal',        'tarbawi.daftar',  'element', 'تتبع عمل التلميذ(ة)',                           '{جذع مشترك,أولى باك,ثانية باك}'),

-- ===== القسم الديداكتيكي =====
('didaktiki',                  null,              'section', 'القسم الديداكتيكي',                             '{}'),
('didaktiki.takhtit',          'didaktiki',       'axis',    'تخطيط التعلمات',                                '{}'),
('didaktiki.takhtit.wathaiq',  'didaktiki.takhtit','element','الوثائق التربوية ودلائل المنهاج',             '{}'),
('didaktiki.takhtit.bitaqat',  'didaktiki.takhtit','element','البطاقات التقنية والتوزيع الدوري',             '{جذع مشترك,أولى باك,ثانية باك}'),
('didaktiki.takhtit.barnamaj', 'didaktiki.takhtit','element','البرنامج الدراسي والمصوغات والمجزوءات',       '{جذع مشترك,أولى باك,ثانية باك}'),

('didaktiki.tadbir',           'didaktiki',       'axis',    'تدبير التعلمات',                                '{}'),
('didaktiki.tadbir.wathaiq',   'didaktiki.tadbir','element', 'الوثائق التربوية وميثاق القسم والتنشيط',        '{}'),
('didaktiki.tadbir.bitaqat',   'didaktiki.tadbir','element', 'البطاقات التقنية والطرائق البيداغوجية',        '{}'),
('didaktiki.tadbir.abead',     'didaktiki.tadbir','element', 'أبعاد الممارسة الصفية والتفاعلات',             '{}'),

('didaktiki.taqwim',           'didaktiki',       'axis',    'تقويم التعلمات',                                '{}'),
('didaktiki.taqwim.wathaiq',   'didaktiki.taqwim','element', 'الوثائق التربوية والأطر المرجعية والمذكرات',   '{}'),
('didaktiki.taqwim.bitaqat',   'didaktiki.taqwim','element', 'البطاقات التقنية والاستعدادات والتقييمات',     '{}'),
('didaktiki.taqwim.asalib',    'didaktiki.taqwim','element', 'الأساليب التقويمية والوضعيات الاختبارية والدعم','{جذع مشترك,أولى باك,ثانية باك}'),

-- ===== القسم التكويني المهني =====
('takwini',                    null,              'section', 'القسم التكويني المهني',                         '{}'),
('takwini.mumarsa',            'takwini',         'axis',    'الممارسة المهنية',                              '{}'),
('takwini.mumarsa.tawsif',     'takwini.mumarsa', 'element', 'التوصيف المعتمد والأسس التحليلية',             '{}'),
('takwini.mumarsa.shabakat',   'takwini.mumarsa', 'element', 'الشبكات التبصرية وتقييم الأداء التواصلي',       '{}'),

('takwini.takwin',             'takwini',         'axis',    'التكوين المستمر ومحاور التكوين',                '{}'),
('takwini.takwin.tawsif',      'takwini.takwin',  'element', 'توصيف التخصص (الفلسفة وعلوم التربية)',          '{}'),
('takwini.takwin.shabakat',    'takwini.takwin',  'element', 'الشبكات التقويمية للمعارف التخصصية',           '{}'),

('takwini.sihha',              'takwini',         'axis',    'الصحة المهنية',                                 '{}'),
('takwini.sihha.shabakat',     'takwini.sihha',   'element', 'الشبكات التشخيصية والإجهاد السيكو-فيزيولوجي',   '{}')

on conflict (id) do update
set parent_id = excluded.parent_id,
    kind      = excluded.kind,
    label_ar  = excluded.label_ar,
    levels    = excluded.levels;
