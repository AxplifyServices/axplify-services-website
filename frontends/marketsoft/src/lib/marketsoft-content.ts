import type { AppLocale } from '@/i18n/routing';

export type PackageSlug = 'store' | 'advanced' | 'marketplace' | 'custom';
export type MarketSoftPackage = {
  slug: PackageSlug;
  name: string;
  target: string;
  price: string;
  delay: string;
  shortFeatures: string[];
  audiences: string[];
  modules: { title: string; items: string[] }[];
  outcomes: string[];
  options: string[];
};

type Copy = {
  nav: { platform: string; packages: string; benefits: string; compare: string; faq: string; contact: string; order: string; demo: string };
  hero: { eyebrow: string; title: string; description: string; primary: string; secondary: string };
  homeBenefits: { title: string; description: string; items: { title: string; text: string }[] };
  packagesTitle: string;
  packagesDescription: string;
  packageActions: { details: string; order: string; demo: string };
  why: { title: string; items: { title: string; text: string }[] };
  finalCta: { title: string; text: string; order: string; expert: string };
  platform: { eyebrow: string; title: string; intro: string; sections: { title: string; text: string; bullets: string[] }[]; galleryTitle: string; galleryText: string };
  benefits: { eyebrow: string; title: string; intro: string; items: { title: string; text: string }[] };
  compare: { eyebrow: string; title: string; intro: string; feature: string; rows: { label: string; values: [string,string,string,string] }[] };
  faq: { eyebrow: string; title: string; intro: string; items: { q: string; a: string }[] };
  order: { eyebrow: string; orderTitle: string; demoTitle: string; intro: string; fields: { firstName:string; lastName:string; company:string; email:string; phone:string; message:string; package:string; privacy:string }; submitOrder:string; submitDemo:string; success:string; missingKey:string };
  packages: MarketSoftPackage[];
};

const fr: Copy = {
  nav: { platform:'La plateforme', packages:'Packages', benefits:'Avantages', compare:'Comparer', faq:'FAQ', contact:'Contact', order:'Commander', demo:'Booker une démo' },
  hero: { eyebrow:'Commerce. Centralisé. Évolutif.', title:'Votre commerce grandit. Votre plateforme doit suivre.', description:'MarketSoft réunit boutique en ligne, commandes, stocks, paiements et opérations dans une plateforme conçue autour de votre activité.', primary:'Voir les packages', secondary:'Commander' },
  homeBenefits: { title:'Un seul système pour vendre et piloter', description:'Commencez avec l’essentiel, puis faites évoluer votre commerce sans repartir de zéro.', items:[
    {title:'Vendez en ligne',text:'Catalogue, panier, paiement et commandes dans un parcours fluide.'},
    {title:'Centralisez vos opérations',text:'Produits, stocks, commandes et points de vente au même endroit.'},
    {title:'Automatisez vos tâches',text:'Notifications, promotions et actions répétitives peuvent être automatisées.'},
    {title:'Boutique ou marketplace',text:'Passez d’une boutique mono-vendeur à une plateforme multi-vendeur selon votre modèle.'},
    {title:'Faites évoluer la plateforme',text:'Ajoutez langues, devises, vendeurs, magasins ou intégrations progressivement.'}
  ]},
  packagesTitle:'Choisissez le niveau adapté à votre commerce', packagesDescription:'Quatre offres claires : d’une boutique professionnelle à une plateforme entièrement personnalisée.',
  packageActions:{details:'Voir l’offre',order:'Commander',demo:'Booker une démo'},
  why:{title:'Pourquoi MarketSoft ?',items:[
    {title:'Adapté à votre métier',text:'La plateforme s’adapte à vos règles de vente, pas l’inverse.'},
    {title:'Vous gardez le contrôle',text:'Vos données, votre identité et votre évolution restent sous votre maîtrise.'},
    {title:'Pas limité par un template',text:'Le parcours et les modules peuvent évoluer bien au-delà d’un thème standard.'},
    {title:'Architecture évolutive',text:'Commencez simple et ajoutez des capacités quand votre activité grandit.'}
  ]},
  finalCta:{title:'Prêt à lancer votre commerce ?',text:'Choisissez votre package ou échangez avec un expert avant de démarrer.',order:'Commander MarketSoft',expert:'Parler à un expert'},
  platform:{eyebrow:'La plateforme',title:'Tout ce qui fait tourner votre commerce, réuni dans un seul système.',intro:'MarketSoft couvre les fonctions de vente essentielles et peut évoluer vers des opérations avancées, B2B ou multi-vendeurs.',galleryTitle:'Découvrez l’expérience MarketSoft',galleryText:'Les captures finales seront ajoutées ici. La galerie est déjà prête pour le plein écran et la navigation entre plusieurs écrans.',sections:[
    {title:'Produits & catalogue',text:'Présentez, organisez et faites évoluer votre offre.',bullets:['Produits, catégories et variantes','Images, prix et promotions','Recherche, filtres et disponibilité']},
    {title:'Commandes & paiements',text:'Transformez l’achat en un parcours simple et maîtrisé.',bullets:['Panier et commande invité ou connecté','Paiement en ligne, livraison ou virement','Suivi des statuts et factures']},
    {title:'Stocks & livraison',text:'Gardez une vision opérationnelle de ce qui peut être vendu et livré.',bullets:['Stock par produit ou variante','Alertes et ruptures','Zones, frais et modes de livraison']},
    {title:'Promotions & fidélisation',text:'Activez les leviers commerciaux sans multiplier les outils.',bullets:['Codes promotionnels','Offres limitées dans le temps','Avis et relances de panier']},
    {title:'Clients',text:'Facilitez l’achat et l’après-vente sans transformer MarketSoft en CRM.',bullets:['Compte client et adresses','Historique et suivi des commandes','Factures, retours et favoris']},
    {title:'Marketplace & vendeurs',text:'Passez au multi-vendeur lorsque votre modèle l’exige.',bullets:['Espace vendeur séparé','Validation des produits','Commandes, ventes et performances par vendeur']},
    {title:'Points de vente',text:'Reliez vente en ligne, retrait et magasins.',bullets:['Stocks par point de vente','Retrait sur place','Suivi des ventes par emplacement']},
    {title:'Analytics',text:'Pilotez le commerce avec des indicateurs utiles.',bullets:['Chiffre d’affaires et commandes','Panier moyen et meilleures ventes','Stocks faibles, promotions et satisfaction']},
    {title:'Contenu & marketing',text:'Faites vivre votre vitrine commerciale depuis la même plateforme.',bullets:['Bannières et mises en avant','Actualités et guides','Tracking et connexions marketing']},
    {title:'Sécurité & rôles',text:'Chaque équipe voit uniquement ce dont elle a besoin.',bullets:['Rôles et autorisations','Périmètres d’accès','Historique des actions sensibles']},
    {title:'Intégrations',text:'Connectez MarketSoft à votre environnement existant.',bullets:['Paiement et livraison','CRM ou outils marketing','API et logiciels métiers']},
    {title:'Multi-langue & multi-devise',text:'Préparez votre commerce à plusieurs marchés.',bullets:['Français, anglais et arabe','Devises et zones de livraison','Adaptation aux moyens de paiement locaux']}
  ]},
  benefits:{eyebrow:'Avantages & résultats',title:'Une plateforme qui suit votre croissance au lieu de la freiner.',intro:'L’objectif n’est pas seulement de mettre des produits en ligne. MarketSoft doit réduire la dispersion des outils et donner une base solide à votre commerce.',items:[
    {title:'Vendez depuis un seul système',text:'Site, commandes, stocks et paiements réunis pour limiter les ruptures entre outils.'},
    {title:'Réduisez les tâches manuelles',text:'Automatisez confirmations, alertes, promotions, relances et notifications.'},
    {title:'Développez sans changer de plateforme',text:'Ajoutez vendeurs, magasins, pays ou fonctionnalités progressivement.'},
    {title:'Gardez le contrôle de vos données',text:'Choisissez votre infrastructure et conservez la maîtrise de vos données et évolutions.'},
    {title:'Adaptez l’outil à votre organisation',text:'Rôles, règles de prix, validation et parcours peuvent suivre votre fonctionnement réel.'},
    {title:'Unifiez online et terrain',text:'Combinez vente en ligne, retrait, magasins et stocks par emplacement lorsque nécessaire.'}
  ]},
  compare:{eyebrow:'Comparer les offres',title:'Choisissez en moins d’une minute.',intro:'Les différences essentielles entre les quatre niveaux MarketSoft.',feature:'Fonctionnalité',rows:[
    {label:'Produits',values:['✓','✓','✓','✓']},{label:'Compte client',values:['—','✓','✓','Selon besoin']},{label:'Stocks avancés',values:['—','✓','✓','✓']},{label:'Promotions',values:['Basique','✓','✓','✓']},{label:'Multi-vendeur',values:['—','—','✓','Option']},{label:'B2B',values:['—','Option','✓','✓']},{label:'Personnalisation',values:['Limitée','Moyenne','Forte','Sur mesure']},{label:'Prix',values:['10–15K DH','25–35K DH','65–75K DH','Sur devis']}
  ]},
  faq:{eyebrow:'FAQ',title:'Les réponses avant de démarrer.',intro:'Les questions les plus fréquentes avant le lancement d’un projet MarketSoft.',items:[
    {q:'Combien de temps faut-il pour lancer la plateforme ?',a:'La boutique standard est prévue autour d’une semaine, l’offre avancée autour de dix jours et la marketplace entre deux et quatre semaines. Le délai Custom dépend du besoin.'},
    {q:'Le paiement en ligne est-il inclus ?',a:'Oui, l’intégration d’un moyen de paiement peut être prévue selon le package, le pays et le prestataire retenu.'},
    {q:'Puis-je utiliser mon propre domaine ?',a:'Oui. MarketSoft est destiné à être déployé sous l’identité et le domaine de votre entreprise.'},
    {q:'Puis-je ajouter des fonctionnalités plus tard ?',a:'Oui. L’architecture est pensée pour ajouter progressivement des fonctions, intégrations, vendeurs, langues ou points de vente.'},
    {q:'L’hébergement est-il inclus ?',a:'L’architecture peut être hébergée dans l’environnement défini avec vous. Les modalités exactes sont précisées dans l’offre et le contrat de maintenance.'},
    {q:'Que comprend la maintenance ?',a:'Le périmètre peut couvrir mises à jour, sauvegardes, surveillance, sécurité, corrections et accompagnement selon le niveau choisi.'},
    {q:'Puis-je migrer mes produits existants ?',a:'Oui, une reprise de catalogue peut être étudiée selon le format et la qualité des données disponibles.'},
    {q:'La plateforme m’appartient-elle ?',a:'MarketSoft est proposé comme une solution personnalisable avec une maîtrise plus forte de l’infrastructure et des données qu’une plateforme SaaS standard. Les conditions contractuelles précisent les droits de chaque projet.'}
  ]},
  order:{eyebrow:'Démarrer',orderTitle:'Commander votre package MarketSoft',demoTitle:'Booker une démo MarketSoft',intro:'Sélectionnez votre package et envoyez votre demande. Elle arrivera directement dans les commandes produits Axplify.',fields:{firstName:'Prénom',lastName:'Nom',company:'Entreprise',email:'Email',phone:'Téléphone',message:'Votre besoin',package:'Package',privacy:'J’accepte que mes informations soient utilisées pour traiter ma demande.'},submitOrder:'Envoyer ma commande',submitDemo:'Demander une démo',success:'Votre demande a bien été envoyée.',missingKey:'La clé d’intégration produit MarketSoft n’est pas configurée.'},
  packages:[
    {slug:'store',name:'Boutique en ligne',target:'Pour lancer une boutique professionnelle simple à administrer.',price:'10 000 – 15 000 DH',delay:'Environ 1 semaine',shortFeatures:['Catalogue produits','Panier & commandes','Paiement','Administration produits','Responsive mobile'],audiences:['Commerces','Marques','Artisans','Distributeurs','Catalogue limité ou moyen'],modules:[{title:'Site public',items:['Accueil, présentation, catalogue et fiches produit','Contact, réseaux sociaux et pages légales','Responsive téléphone, tablette et desktop']},{title:'Vente',items:['Panier et commande sans compte','Coordonnées et récapitulatif de commande','Paiement en ligne, livraison ou virement selon besoin']},{title:'Administration',items:['Gestion des produits','Gestion des commandes','Consultation des messages de contact']}],outcomes:['Lancer rapidement un canal de vente propriétaire','Administrer produits et commandes sans complexité','Offrir un parcours d’achat professionnel'],options:['UX/UI plus personnalisé : +3 500 DH','Support & maintenance : 10 000 – 15 000 DH/an']},
    {slug:'advanced',name:'Boutique avancée',target:'Pour faire du e-commerce un véritable canal de vente récurrent.',price:'25 000 – 35 000 DH',delay:'Environ 10 jours',shortFeatures:['Compte client','Stocks avancés','Promotions','Livraison avancée','Analytics'],audiences:['Marques avec catalogue important','Produits à variantes','Ventes régulières en ligne','Entreprises avec promotions','Équipes gérant contenu et stock'],modules:[{title:'Clients & conversion',items:['Comptes clients, adresses, favoris et factures','Paniers sauvegardés et relances','Avis et communication automatisée']},{title:'Stock & livraison',items:['Stock par variante et historique','Alertes de stock faible','Zones, tarifs et modes de livraison']},{title:'Marketing & pilotage',items:['Promotions et codes','Bannières et contenus','Dashboard et exports principaux']}],outcomes:['Augmenter la récurrence d’achat','Mieux piloter stocks et promotions','Réduire les tâches répétitives'],options:['UX/UI plus personnalisé : +6 000 DH','Support & maintenance : 15 000 – 20 000 DH/an']},
    {slug:'marketplace',name:'Marketplace multi-vendeur',target:'Pour réunir plusieurs vendeurs, marques ou partenaires sur une seule plateforme.',price:'65 000 – 75 000 DH',delay:'Environ 2 à 4 semaines',shortFeatures:['Espaces vendeurs','Catalogue multi-vendeur','Commandes réparties','Retours & litiges','Statistiques vendeurs'],audiences:['Marketplaces sectorielles','Distributeurs multi-fournisseurs','Groupements de commerçants','Réseaux et fédérations','Plateformes à commission'],modules:[{title:'Vendeurs',items:['Inscription, validation et suspension','Espace vendeur et profil public','Produits, prix, stock et commandes limités au vendeur']},{title:'Marketplace',items:['Catalogue et panier multi-vendeur','Répartition des commandes','Livraisons et statuts séparés']},{title:'Contrôle',items:['Validation produits','Retours, litiges et avis vendeurs','Rôles internes et statistiques détaillées']}],outcomes:['Créer un modèle de vente multi-partenaire','Conserver le contrôle global de la marketplace','Donner de l’autonomie aux vendeurs sans exposer les autres données'],options:['UX/UI plus personnalisé : +12 000 DH','Support & maintenance : 40 000 – 50 000 DH/an']},
    {slug:'custom',name:'Plateforme Custom',target:'Pour partir d’un package existant et ajouter des besoins sur mesure.',price:'Sur devis',delay:'Selon le besoin',shortFeatures:['Base MarketSoft','Fonctions sur mesure','API externes','UX/UI spécifique','Architecture adaptée'],audiences:['Process métier spécifiques','Intégrations externes importantes','Parcours très personnalisés','Déploiement multi-pays','Évolutions complexes'],modules:[{title:'Base',items:['Choix d’un package MarketSoft comme fondation','Modules activés selon le besoin','Architecture adaptée au périmètre']},{title:'Sur mesure',items:['Fonctionnalités métier spécifiques','Intégrations API et logiciels externes','Parcours et interfaces dédiés']},{title:'Accompagnement',items:['Cadrage du besoin','Estimation dédiée','Plan de déploiement et maintenance adaptés']}],outcomes:['Éviter de reconstruire ce qui existe déjà','Concentrer le budget sur les besoins réellement spécifiques','Faire évoluer MarketSoft autour du SI existant'],options:['UX/UI : selon besoin','Support & maintenance : base du package + suppléments']}
  ]
};

const en: Copy = {
  ...fr,
  nav:{platform:'Platform',packages:'Packages',benefits:'Benefits',compare:'Compare',faq:'FAQ',contact:'Contact',order:'Order',demo:'Book a demo'},
  hero:{eyebrow:'Commerce. Centralized. Scalable.',title:'Your commerce grows. Your platform should keep up.',description:'MarketSoft brings storefront, orders, inventory, payments and operations into one platform built around your business.',primary:'View packages',secondary:'Order now'},
  homeBenefits:{title:'One system to sell and operate',description:'Start with the essentials, then expand your commerce without starting over.',items:[{title:'Sell online',text:'Catalog, cart, payments and orders in a smooth buying journey.'},{title:'Centralize operations',text:'Products, inventory, orders and stores in one place.'},{title:'Automate repetitive work',text:'Notifications, promotions and routine actions can be automated.'},{title:'Store or marketplace',text:'Move from a single-seller store to a multi-vendor platform when your model requires it.'},{title:'Scale the platform',text:'Add languages, currencies, sellers, stores and integrations over time.'}]},
  packagesTitle:'Choose the right level for your commerce',packagesDescription:'Four clear offers, from a professional store to a fully customized platform.',packageActions:{details:'View offer',order:'Order',demo:'Book a demo'},
  why:{title:'Why MarketSoft?',items:[{title:'Built around your business',text:'The platform adapts to your selling rules, not the other way around.'},{title:'Stay in control',text:'Keep control over your data, identity and evolution.'},{title:'Beyond templates',text:'Journeys and modules can evolve far beyond a standard theme.'},{title:'Scalable architecture',text:'Start simple and add capabilities as the business grows.'}]},
  finalCta:{title:'Ready to launch your commerce?',text:'Choose a package or talk to an expert before you start.',order:'Order MarketSoft',expert:'Talk to an expert'},
  platform:{...fr.platform,eyebrow:'The platform',title:'Everything that runs your commerce, in one system.',intro:'MarketSoft covers core selling capabilities and can grow into advanced, B2B or multi-vendor operations.',galleryTitle:'Explore the MarketSoft experience',galleryText:'Final screenshots will be added here. Fullscreen viewing and multi-screen navigation are already implemented.'},
  benefits:{...fr.benefits,eyebrow:'Benefits & results',title:'A platform that follows your growth instead of slowing it down.',intro:'The goal is not just to put products online. MarketSoft reduces tool fragmentation and gives your commerce a solid operating base.'},
  compare:{...fr.compare,eyebrow:'Compare offers',title:'Choose in under a minute.',intro:'The essential differences between the four MarketSoft levels.',feature:'Feature'},
  faq:{...fr.faq,eyebrow:'FAQ',title:'Answers before you start.',intro:'The most common questions before launching a MarketSoft project.'},
  order:{...fr.order,eyebrow:'Get started',orderTitle:'Order your MarketSoft package',demoTitle:'Book a MarketSoft demo',intro:'Select your package and send the request. It will arrive directly in Axplify product requests.',fields:{firstName:'First name',lastName:'Last name',company:'Company',email:'Email',phone:'Phone',message:'Your need',package:'Package',privacy:'I agree that my information may be used to process my request.'},submitOrder:'Send my order',submitDemo:'Request a demo',success:'Your request was sent successfully.',missingKey:'The MarketSoft product integration key is not configured.'}
};

const ar: Copy = {
  ...en,
  nav:{platform:'المنصة',packages:'الباقات',benefits:'المزايا',compare:'مقارنة',faq:'الأسئلة',contact:'تواصل معنا',order:'اطلب الآن',demo:'احجز عرضاً'},
  hero:{eyebrow:'تجارة. موحدة. قابلة للتوسع.',title:'تجارتك تنمو. ومنصتك يجب أن تنمو معها.',description:'يجمع MarketSoft المتجر والطلبات والمخزون والمدفوعات والعمليات في منصة واحدة مبنية حول نشاطك.',primary:'شاهد الباقات',secondary:'اطلب الآن'},
  homeBenefits:{title:'نظام واحد للبيع والإدارة',description:'ابدأ بالأساسيات ثم وسّع تجارتك دون إعادة البناء من الصفر.',items:[{title:'بع عبر الإنترنت',text:'كتالوج وسلة ودفع وطلبات ضمن تجربة شراء بسيطة.'},{title:'وحّد العمليات',text:'المنتجات والمخزون والطلبات ونقاط البيع في مكان واحد.'},{title:'أتمت المهام',text:'يمكن أتمتة الإشعارات والعروض والمهام المتكررة.'},{title:'متجر أو سوق متعدد البائعين',text:'انتقل من متجر واحد إلى Marketplace عندما يتطلب نموذجك ذلك.'},{title:'طوّر المنصة',text:'أضف اللغات والعملات والبائعين والمتاجر والتكاملات تدريجياً.'}]},
  packagesTitle:'اختر المستوى المناسب لتجارتك',packagesDescription:'أربع باقات واضحة من متجر احترافي إلى منصة مخصصة بالكامل.',packageActions:{details:'تفاصيل الباقة',order:'اطلب',demo:'احجز عرضاً'},
  why:{title:'لماذا MarketSoft؟',items:[{title:'متوافق مع نشاطك',text:'تتكيف المنصة مع قواعد عملك وليس العكس.'},{title:'احتفظ بالتحكم',text:'تحكم أكبر في بياناتك وهويتك وتطور منصتك.'},{title:'أبعد من القوالب',text:'يمكن تطوير المسارات والوحدات بما يتجاوز القوالب الجاهزة.'},{title:'معمارية قابلة للتوسع',text:'ابدأ ببساطة وأضف القدرات مع نمو النشاط.'}]},
  finalCta:{title:'جاهز لإطلاق تجارتك؟',text:'اختر باقتك أو تحدث مع خبير قبل الانطلاق.',order:'اطلب MarketSoft',expert:'تحدث مع خبير'},
  platform:{...fr.platform,eyebrow:'المنصة',title:'كل ما يشغّل تجارتك في نظام واحد.',intro:'يغطي MarketSoft وظائف البيع الأساسية ويمكن أن يتطور إلى عمليات متقدمة أو B2B أو متعددة البائعين.',galleryTitle:'اكتشف تجربة MarketSoft',galleryText:'ستضاف لقطات الشاشة النهائية هنا. العرض بملء الشاشة والتنقل بين عدة صور جاهزان.'},
  benefits:{...fr.benefits,eyebrow:'المزايا والنتائج',title:'منصة تواكب نموك بدلاً من أن تعيقه.',intro:'الهدف ليس فقط عرض المنتجات، بل توحيد الأدوات وبناء قاعدة تشغيل قوية للتجارة.'},
  compare:{...fr.compare,eyebrow:'مقارنة الباقات',title:'اختر خلال أقل من دقيقة.',intro:'الفروقات الأساسية بين مستويات MarketSoft الأربعة.',feature:'الخاصية'},
  faq:{...fr.faq,eyebrow:'الأسئلة الشائعة',title:'إجابات قبل الانطلاق.',intro:'أكثر الأسئلة شيوعاً قبل بدء مشروع MarketSoft.'},
  order:{...fr.order,eyebrow:'ابدأ الآن',orderTitle:'اطلب باقة MarketSoft',demoTitle:'احجز عرض MarketSoft',intro:'اختر الباقة وأرسل طلبك ليصل مباشرة إلى طلبات منتجات Axplify.',fields:{firstName:'الاسم',lastName:'النسب',company:'الشركة',email:'البريد الإلكتروني',phone:'الهاتف',message:'احتياجك',package:'الباقة',privacy:'أوافق على استخدام معلوماتي لمعالجة طلبي.'},submitOrder:'إرسال الطلب',submitDemo:'طلب عرض',success:'تم إرسال طلبك بنجاح.',missingKey:'مفتاح تكامل منتج MarketSoft غير مضبوط.'}
};

export const MARKETSOFT_CONTENT: Record<AppLocale, Copy> = { fr, en, ar };
export function getMarketSoftCopy(locale: AppLocale) { return MARKETSOFT_CONTENT[locale] ?? MARKETSOFT_CONTENT.fr; }
export function getPackage(locale: AppLocale, slug: string) { return getMarketSoftCopy(locale).packages.find(pkg => pkg.slug === slug); }
