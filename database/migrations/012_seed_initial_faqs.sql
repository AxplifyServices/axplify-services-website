SET client_encoding = 'UTF8';

BEGIN;

-- =========================================================
-- FAQ 01
-- Quels types de projets réalisez-vous ?
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible,
    created_at,
    updated_at
)
VALUES (
    '10000000-0000-4000-8000-000000000001',
    'OFFER',
    10,
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET
    category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000001',
    'fr',
    'Quels types de projets réalisez-vous ?',
    'Nous accompagnons les entreprises sur des projets digitaux allant de la création de sites, applications et plateformes métier à l’automatisation de processus, l’exploitation des données, l’intelligence artificielle et la mise en place de produits digitaux. Nous intervenons aussi bien sur des besoins entièrement nouveaux que sur l’amélioration d’un système existant. Notre point de départ reste toujours le même : comprendre le besoin, les utilisateurs et les résultats recherchés avant de déterminer la solution la plus pertinente.'
),
(
    '10000000-0000-4000-8000-000000000001',
    'en',
    'What types of projects do you deliver?',
    'We support companies with digital projects ranging from websites, applications and business platforms to process automation, data exploitation, artificial intelligence and digital products. We can work on completely new needs or improve an existing system. Our starting point is always the same: understand the need, the users and the expected outcomes before deciding which solution is the most appropriate.'
),
(
    '10000000-0000-4000-8000-000000000001',
    'ar',
    'ما أنواع المشاريع التي تنجزونها؟',
    'نرافق الشركات في مشاريع رقمية تشمل إنشاء المواقع والتطبيقات والمنصات المهنية وأتمتة العمليات واستغلال البيانات والذكاء الاصطناعي والمنتجات الرقمية. يمكننا العمل على احتياج جديد بالكامل أو تحسين نظام موجود. نبدأ دائما بفهم الاحتياج والمستخدمين والنتائج المنتظرة قبل تحديد الحل الأنسب.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET
    question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 02
-- Produit Axplify ou solution sur mesure ?
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000002',
    'OFFER',
    20,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET
    category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000002',
    'fr',
    'Quelle est la différence entre un produit Axplify et une solution sur mesure ?',
    'Un produit Axplify répond à une problématique que nous avons déjà traitée et pour laquelle une base fonctionnelle existe déjà. Nous configurons alors le produit, activons les modules utiles et l’adaptons au contexte de l’entreprise. Une solution sur mesure est privilégiée lorsque le besoin est nouveau, très spécifique ou ne peut pas être couvert correctement par un produit existant. Dans ce cas, nous concevons la solution autour de vos processus tout en nous appuyant sur notre expérience et nos composants déjà éprouvés.'
),
(
    '10000000-0000-4000-8000-000000000002',
    'en',
    'What is the difference between an Axplify product and a custom solution?',
    'An Axplify product addresses a problem we have already worked on and for which a functional foundation already exists. We configure the product, enable the relevant modules and adapt it to the company context. A custom solution is preferred when the need is new, highly specific or cannot be properly covered by an existing product. In that case, we design the solution around your processes while relying on our experience and proven components.'
),
(
    '10000000-0000-4000-8000-000000000002',
    'ar',
    'ما الفرق بين منتج Axplify والحل المخصص؟',
    'منتج Axplify يعالج احتياجا سبق لنا العمل عليه وتتوفر له قاعدة وظيفية جاهزة. نقوم بتهيئة المنتج وتفعيل الوحدات المناسبة وتكييفه مع سياق المؤسسة. أما الحل المخصص فنلجأ إليه عندما يكون الاحتياج جديدا أو خاصا جدا أو لا يمكن تغطيته بشكل جيد بمنتج موجود. في هذه الحالة نصمم الحل حول عملياتكم مع الاستفادة من خبرتنا ومكوناتنا المجربة.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 03
-- Comment déterminer la solution adaptée ?
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000003',
    'OFFER',
    30,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000003',
    'fr',
    'Comment déterminez-vous la solution adaptée à mon besoin ?',
    'Nous ne choisissons pas une solution avant d’avoir compris votre situation. Nous analysons le fonctionnement actuel, les utilisateurs concernés, les difficultés rencontrées, les objectifs et les contraintes. Nous reformulons ensuite le besoin et vous présentons notre compréhension ainsi que des exemples comparables lorsque cela est pertinent. Après validation, nous déterminons si un produit Axplify peut répondre correctement au besoin ou si une solution sur mesure est plus adaptée.'
),
(
    '10000000-0000-4000-8000-000000000003',
    'en',
    'How do you determine which solution is right for my need?',
    'We do not select a solution before understanding your situation. We analyse your current processes, users, difficulties, objectives and constraints. We then restate the need and present our understanding, along with comparable examples when relevant. Once this is approved, we determine whether an Axplify product can properly address the need or whether a custom solution is more appropriate.'
),
(
    '10000000-0000-4000-8000-000000000003',
    'ar',
    'كيف تحددون الحل الأنسب لاحتياجي؟',
    'لا نختار الحل قبل فهم وضعكم. نحلل طريقة العمل الحالية والمستخدمين والصعوبات والأهداف والقيود، ثم نعيد صياغة الاحتياج ونقدم فهمنا وأمثلة مشابهة عند الحاجة. بعد المصادقة نحدد ما إذا كان أحد منتجات Axplify مناسبا أو إذا كان الحل المخصص هو الخيار الأفضل.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 04
-- Comment commence un projet ?
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000004',
    'METHODOLOGY',
    40,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000004',
    'fr',
    'Comment commence un projet avec Axplify Services ?',
    'Un projet commence par une phase de compréhension. Nous échangeons sur votre activité, le problème rencontré, les utilisateurs concernés, les outils existants et les résultats recherchés. Lorsque cela est utile, nous observons également le processus actuel. Nous reformulons ensuite le besoin de manière structurée et vous présentons notre compréhension avant de poursuivre. Cette étape permet de s’assurer que nous travaillons sur le bon problème avant de parler de solution.'
),
(
    '10000000-0000-4000-8000-000000000004',
    'en',
    'How does a project start with Axplify Services?',
    'A project starts with an understanding phase. We discuss your activity, the problem, the users involved, existing tools and expected outcomes. When useful, we also study the current process. We then restate the need in a structured way and present our understanding before moving forward. This ensures that we are solving the right problem before discussing the solution.'
),
(
    '10000000-0000-4000-8000-000000000004',
    'ar',
    'كيف يبدأ المشروع مع Axplify Services؟',
    'يبدأ المشروع بمرحلة فهم الاحتياج. نتبادل معكم حول النشاط والمشكلة والمستخدمين والأدوات الحالية والنتائج المطلوبة. عند الحاجة ندرس أيضا طريقة العمل الحالية. بعد ذلك نعيد صياغة الاحتياج بشكل منظم ونقدم فهمنا قبل الانتقال إلى المرحلة التالية، حتى نتأكد من أننا نعالج المشكلة الصحيحة.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 05
-- Développement dès le premier échange ?
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000005',
    'METHODOLOGY',
    50,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000005',
    'fr',
    'Commencez-vous le développement dès le premier échange ?',
    'Non. Nous commençons par comprendre, analyser et reformuler le besoin. Nous vous présentons ensuite notre compréhension, les priorités identifiées et, lorsque cela est pertinent, des exemples ou des pistes comparables. Nous ne poursuivons la conception ou le développement qu’après validation. Cette étape évite de construire rapidement une solution qui ne répondrait pas au vrai problème.'
),
(
    '10000000-0000-4000-8000-000000000005',
    'en',
    'Do you start development after the first discussion?',
    'No. We first understand, analyse and reframe the need. We then present our understanding, identified priorities and, when relevant, comparable examples or approaches. We only move into design or development after approval. This prevents us from quickly building a solution that does not address the real problem.'
),
(
    '10000000-0000-4000-8000-000000000005',
    'ar',
    'هل تبدأون التطوير مباشرة بعد أول لقاء؟',
    'لا. نبدأ بفهم الاحتياج وتحليله وإعادة صياغته، ثم نقدم لكم فهمنا والأولويات والأمثلة المناسبة عند الحاجة. لا ننتقل إلى التصميم أو التطوير إلا بعد المصادقة. هذا يمنع بناء حل سريع لا يعالج المشكلة الحقيقية.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 06
-- Validation du besoin
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000006',
    'METHODOLOGY',
    60,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000006',
    'fr',
    'Comment validez-vous que vous avez bien compris notre besoin ?',
    'Nous reformulons le besoin avec nos propres mots et le structurons autour du problème à résoudre, des utilisateurs, des priorités et des résultats attendus. Nous pouvons également présenter des exemples, des parcours ou des projets comparables pour rendre notre compréhension plus concrète. Vous validez cette base avant que nous poursuivions. Si un point reste ambigu, nous revenons à l’étape nécessaire jusqu’à obtenir un cadrage partagé.'
),
(
    '10000000-0000-4000-8000-000000000006',
    'en',
    'How do you validate that you have correctly understood our need?',
    'We restate the need in our own words and structure it around the problem to solve, users, priorities and expected outcomes. We may also present examples, user journeys or comparable projects to make our understanding more concrete. You approve this foundation before we continue. If something remains unclear, we return to the relevant stage until there is a shared understanding.'
),
(
    '10000000-0000-4000-8000-000000000006',
    'ar',
    'كيف تتحققون من أنكم فهمتم احتياجنا بشكل صحيح؟',
    'نعيد صياغة الاحتياج بكلماتنا وننظمه حول المشكلة والمستخدمين والأولويات والنتائج المنتظرة. يمكننا أيضا تقديم أمثلة أو مسارات أو مشاريع مشابهة لجعل الفهم أكثر وضوحا. تتم المصادقة على هذه القاعدة قبل المتابعة، وإذا بقي أي غموض نعود إلى المرحلة المناسبة حتى نصل إلى فهم مشترك.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 07
-- Demo / POC / MVP
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000007',
    'PROTOTYPE',
    70,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000007',
    'fr',
    'Pouvez-vous créer une démo, un POC ou un MVP avant le développement complet ?',
    'Oui. Lorsque cela apporte de la valeur au projet, nous pouvons créer rapidement une démonstration, une preuve de concept ou un MVP avant d’engager le développement complet. Cela permet de visualiser la future solution, tester une hypothèse technique ou métier, recueillir des retours et corriger les choix importants suffisamment tôt. L’objectif est de rendre le résultat tangible avant d’investir dans l’ensemble du projet.'
),
(
    '10000000-0000-4000-8000-000000000007',
    'en',
    'Can you create a demo, POC or MVP before full development?',
    'Yes. When it adds value to the project, we can quickly create a demonstration, proof of concept or MVP before committing to full development. This helps visualise the future solution, test a technical or business assumption, collect feedback and correct important choices early. The objective is to make the result tangible before investing in the entire project.'
),
(
    '10000000-0000-4000-8000-000000000007',
    'ar',
    'هل يمكنكم إنشاء عرض تجريبي أو POC أو MVP قبل التطوير الكامل؟',
    'نعم. عندما يكون ذلك مفيدا للمشروع يمكننا إنشاء عرض تجريبي أو إثبات مفهوم أو نسخة MVP بسرعة قبل الالتزام بالتطوير الكامل. يساعد ذلك على تصور الحل واختبار الفرضيات التقنية أو المهنية وجمع الملاحظات وتصحيح الاختيارات المهمة مبكرا قبل الاستثمار في المشروع كاملا.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 08
-- Différence Demo / POC / MVP
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000008',
    'PROTOTYPE',
    80,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000008',
    'fr',
    'Quelle est la différence entre une démo, un POC et un MVP ?',
    'Une démo sert principalement à visualiser une interface, un parcours ou le fonctionnement envisagé. Un POC, ou preuve de concept, vérifie qu’une idée, une technologie ou une règle métier est réellement faisable. Un MVP est une première version utilisable avec les fonctionnalités essentielles, destinée à être testée dans des conditions plus proches de la réalité. Nous choisissons le format selon ce que le projet doit valider avant d’aller plus loin.'
),
(
    '10000000-0000-4000-8000-000000000008',
    'en',
    'What is the difference between a demo, POC and MVP?',
    'A demo is mainly used to visualise an interface, journey or expected behaviour. A POC, or proof of concept, verifies that an idea, technology or business rule is actually feasible. An MVP is a first usable version containing the essential features and intended to be tested in conditions closer to real usage. We select the format according to what needs to be validated before moving forward.'
),
(
    '10000000-0000-4000-8000-000000000008',
    'ar',
    'ما الفرق بين العرض التجريبي وPOC وMVP؟',
    'العرض التجريبي يهدف أساسا إلى تصور الواجهة أو المسار أو طريقة عمل الحل. أما POC أو إثبات المفهوم فيتحقق من إمكانية تنفيذ فكرة أو تقنية أو قاعدة مهنية. وMVP هو نسخة أولى قابلة للاستخدام تتضمن الوظائف الأساسية ويمكن اختبارها في ظروف أقرب إلى الواقع. نختار الصيغة حسب ما يجب التحقق منه قبل متابعة المشروع.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 09
-- Accès au projet
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000009',
    'DELIVERY',
    90,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000009',
    'fr',
    'Aurai-je accès au projet pendant son développement ?',
    'Oui. Nous mettons généralement à disposition un environnement de test accessible aux personnes autorisées. Vous pouvez y consulter les interfaces, tester les fonctionnalités disponibles et vérifier les évolutions sans attendre la mise en production finale. L’objectif est de vous donner une visibilité continue sur le projet et de permettre des retours suffisamment tôt pour éviter les surprises à la fin du développement.'
),
(
    '10000000-0000-4000-8000-000000000009',
    'en',
    'Will I have access to the project during development?',
    'Yes. We generally provide a testing environment accessible to authorised people. You can review interfaces, test available features and verify changes without waiting for the final production release. The objective is to provide continuous visibility throughout the project and allow feedback early enough to avoid surprises at the end of development.'
),
(
    '10000000-0000-4000-8000-000000000009',
    'ar',
    'هل سيكون لدي وصول إلى المشروع أثناء التطوير؟',
    'نعم. نوفر عادة بيئة اختبار يمكن للأشخاص المخولين الوصول إليها. يمكنكم الاطلاع على الواجهات وتجربة الوظائف ومتابعة التطورات دون انتظار الإطلاق النهائي. الهدف هو توفير رؤية مستمرة للمشروع وإتاحة الملاحظات مبكرا لتجنب المفاجآت في نهاية التطوير.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 10
-- Fréquence suivi
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000010',
    'DELIVERY',
    100,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000010',
    'fr',
    'À quelle fréquence échangeons-nous pendant le projet ?',
    'Le rythme dépend de la nature et de la durée du projet, mais nous organisons généralement un point de suivi chaque semaine. Cet échange permet de présenter les avancées, recueillir les retours, arbitrer les sujets ouverts et confirmer les prochaines priorités. Entre ces points, l’environnement de test reste accessible afin que les personnes concernées puissent suivre l’évolution du projet.'
),
(
    '10000000-0000-4000-8000-000000000010',
    'en',
    'How often do we communicate during the project?',
    'The frequency depends on the nature and duration of the project, but we generally organise a weekly follow-up meeting. This allows us to present progress, collect feedback, resolve open points and confirm the next priorities. Between these meetings, the testing environment remains available so that the relevant people can continue following the project.'
),
(
    '10000000-0000-4000-8000-000000000010',
    'ar',
    'كم مرة نتواصل أثناء المشروع؟',
    'يعتمد الإيقاع على طبيعة المشروع ومدته، لكننا ننظم عادة اجتماعا للمتابعة كل أسبوع. نعرض خلاله التقدم ونجمع الملاحظات ونحسم النقاط المفتوحة ونحدد الأولويات التالية. وبين الاجتماعات تبقى بيئة الاختبار متاحة لمتابعة تطور المشروع.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 11
-- Délais
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000011',
    'BUDGET',
    110,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000011',
    'fr',
    'Combien de temps faut-il pour réaliser un projet ?',
    'La durée dépend du périmètre, du nombre de profils utilisateurs, des règles métier, des intégrations externes et du niveau de personnalisation. Une fois le besoin compris et cadré, nous proposons un découpage réaliste avec des étapes et des estimations de délai. Lorsque cela est pertinent, nous pouvons également commencer par une démo, un POC ou un MVP afin d’obtenir rapidement un premier résultat tangible.'
),
(
    '10000000-0000-4000-8000-000000000011',
    'en',
    'How long does it take to deliver a project?',
    'The timeline depends on the scope, number of user profiles, business rules, external integrations and level of customisation. Once the need has been understood and framed, we propose a realistic breakdown with stages and timeline estimates. When relevant, we can also begin with a demo, POC or MVP to obtain a tangible first result quickly.'
),
(
    '10000000-0000-4000-8000-000000000011',
    'ar',
    'كم يستغرق إنجاز المشروع؟',
    'تعتمد المدة على نطاق المشروع وعدد أنواع المستخدمين والقواعد المهنية والتكاملات الخارجية ومستوى التخصيص. بعد فهم الاحتياج وتحديد النطاق نقترح تقسيما واقعيا للمراحل مع تقديرات زمنية. وعند الحاجة يمكن البدء بعرض تجريبي أو POC أو MVP للحصول على نتيجة أولية ملموسة بسرعة.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 12
-- Budget
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000012',
    'BUDGET',
    120,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000012',
    'fr',
    'Combien coûte une solution sur mesure ?',
    'Le coût dépend de la complexité du besoin, du nombre de fonctionnalités, des intégrations, des contraintes techniques et du niveau de personnalisation. Nous évitons donc de donner un tarif standard avant d’avoir compris le projet. Notre objectif est d’identifier le périmètre réellement utile et, lorsque cela est pertinent, de proposer une réalisation en plusieurs phases, un POC ou un MVP afin de mieux maîtriser l’investissement initial.'
),
(
    '10000000-0000-4000-8000-000000000012',
    'en',
    'How much does a custom solution cost?',
    'The cost depends on the complexity of the need, number of features, integrations, technical constraints and level of customisation. We therefore avoid giving a standard price before understanding the project. Our objective is to identify the scope that truly delivers value and, when appropriate, propose phased delivery, a POC or an MVP to better control the initial investment.'
),
(
    '10000000-0000-4000-8000-000000000012',
    'ar',
    'كم تبلغ تكلفة الحل المخصص؟',
    'تعتمد التكلفة على تعقيد الاحتياج وعدد الوظائف والتكاملات والقيود التقنية ومستوى التخصيص. لذلك لا نعطي سعرا موحدا قبل فهم المشروع. هدفنا هو تحديد النطاق الذي يقدم قيمة فعلية ويمكن عند الحاجة تنفيذ المشروع على مراحل أو البدء بـ POC أو MVP للتحكم بشكل أفضل في الاستثمار الأولي.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 13
-- Intégrations
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000013',
    'TECHNICAL',
    130,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000013',
    'fr',
    'Pouvez-vous connecter la solution à nos outils existants ?',
    'Oui, lorsque les outils concernés permettent l’intégration. Nous pouvons connecter la solution à des API, bases de données, services externes ou autres applications afin d’éviter les doubles saisies et de fluidifier la circulation de l’information. Avant de valider une intégration, nous vérifions les possibilités techniques, les règles de sécurité, les droits d’accès et les limites éventuelles du service externe.'
),
(
    '10000000-0000-4000-8000-000000000013',
    'en',
    'Can you connect the solution to our existing tools?',
    'Yes, when the relevant tools support integration. We can connect the solution to APIs, databases, external services or other applications to avoid duplicate data entry and improve information flow. Before confirming an integration, we review technical possibilities, security requirements, access permissions and any limitations of the external service.'
),
(
    '10000000-0000-4000-8000-000000000013',
    'ar',
    'هل يمكنكم ربط الحل بأدواتنا الحالية؟',
    'نعم عندما تسمح الأدوات المعنية بالتكامل. يمكننا ربط الحل بواجهات API أو قواعد البيانات أو الخدمات الخارجية أو التطبيقات الأخرى لتجنب إدخال البيانات مرتين وتحسين تدفق المعلومات. قبل اعتماد التكامل نتحقق من الإمكانيات التقنية والأمان والصلاحيات وحدود الخدمة الخارجية.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 14
-- Evolutivité
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000014',
    'TECHNICAL',
    140,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000014',
    'fr',
    'La solution peut-elle évoluer après son lancement ?',
    'Oui. Nous concevons les solutions pour pouvoir les faire évoluer progressivement lorsque le projet le nécessite. Les nouvelles fonctionnalités peuvent être priorisées à partir des usages réels, des retours des utilisateurs, des changements métier ou de nouveaux objectifs. Une architecture correctement pensée dès le départ permet d’ajouter des capacités sans devoir reconstruire l’ensemble de la solution à chaque évolution.'
),
(
    '10000000-0000-4000-8000-000000000014',
    'en',
    'Can the solution evolve after launch?',
    'Yes. We design solutions so that they can evolve progressively when the project requires it. New features can be prioritised based on real usage, user feedback, business changes or new objectives. A properly designed architecture from the beginning makes it possible to add capabilities without rebuilding the entire solution for every evolution.'
),
(
    '10000000-0000-4000-8000-000000000014',
    'ar',
    'هل يمكن تطوير الحل بعد إطلاقه؟',
    'نعم. نصمم الحلول بحيث يمكن تطويرها تدريجيا عند الحاجة. يمكن ترتيب الوظائف الجديدة حسب الاستخدام الحقيقي وملاحظات المستخدمين والتغيرات في النشاط أو الأهداف الجديدة. تسمح الهندسة الجيدة منذ البداية بإضافة قدرات جديدة دون إعادة بناء الحل كاملا مع كل تطور.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();


-- =========================================================
-- FAQ 15
-- Accompagnement après lancement
-- =========================================================

INSERT INTO faq_items (
    id,
    category_code,
    sort_order,
    is_visible
)
VALUES (
    '10000000-0000-4000-8000-000000000015',
    'SUPPORT',
    150,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET category_code = EXCLUDED.category_code,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW();

INSERT INTO faq_item_translations (
    faq_item_id,
    locale,
    question,
    answer
)
VALUES
(
    '10000000-0000-4000-8000-000000000015',
    'fr',
    'Proposez-vous un accompagnement après la mise en ligne ?',
    'Oui. Selon le projet, l’accompagnement peut comprendre le suivi après lancement, la correction d’anomalies, la maintenance, l’assistance aux utilisateurs, la documentation et les évolutions fonctionnelles. La mise en production n’est pas considérée comme la fin du parcours : les usages réels et les retours obtenus après le lancement permettent souvent d’identifier les améliorations les plus utiles pour la suite.'
),
(
    '10000000-0000-4000-8000-000000000015',
    'en',
    'Do you provide support after the solution goes live?',
    'Yes. Depending on the project, post-launch support can include follow-up, bug fixing, maintenance, user assistance, documentation and functional improvements. Going live is not considered the end of the journey: real usage and feedback after launch often help identify the most valuable improvements for the next stages.'
),
(
    '10000000-0000-4000-8000-000000000015',
    'ar',
    'هل تقدمون المواكبة بعد إطلاق الحل؟',
    'نعم. حسب المشروع يمكن أن تشمل المواكبة بعد الإطلاق المتابعة وتصحيح الأخطاء والصيانة ومساعدة المستخدمين والتوثيق والتطويرات الوظيفية. لا نعتبر النشر نهاية المشروع، لأن الاستخدام الحقيقي والملاحظات بعد الإطلاق تساعد غالبا على تحديد التحسينات الأكثر فائدة للمراحل التالية.'
)
ON CONFLICT (faq_item_id, locale) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    updated_at = NOW();

COMMIT;