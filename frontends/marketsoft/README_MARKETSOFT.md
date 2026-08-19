# MarketSoft frontend

Frontend indépendant, connecté au backend Axplify existant.

## Port local
- MarketSoft: `3002`
- Backend Axplify: `3000`
- Frontend Axplify Services actuel: `3001`

## Images
Toutes les images MarketSoft doivent rester dans `public/`.

- Logo complet : `public/brand/marketsoft-logo-wordmark.png`
- Icône : `public/brand/marketsoft-icon.png`
- Logo Axplify footer : `public/brand/axplify-logo.svg`
- Screenshots produit : `public/screenshots/`

La galerie attend actuellement :
- `public/screenshots/dashboard-01.svg`
- `public/screenshots/storefront-01.svg`
- `public/screenshots/orders-01.svg`

Ces SVG sont uniquement des placeholders. Quand les vrais screenshots seront fournis, remplace-les ou modifie `src/components/marketsoft/screenshot-gallery.tsx` pour pointer vers les nouveaux fichiers `.webp`/`.png`.

## Product requests
Les boutons `Commander` et `Booker une démo` envoient tous les deux vers l'endpoint backend existant :
`POST /api/product-requests/public`

Types envoyés :
- commande : `ORDER`
- démo : `DEMO`

Le package choisi est ajouté au `request_message`, donc aucune nouvelle table n'est nécessaire.

Configurer la clé d'intégration du produit MarketSoft :
`NEXT_PUBLIC_MARKETSOFT_PRODUCT_KEY=<products.integration_key>`

## Agentation
Agentation est déjà monté dans `src/app/[locale]/layout.tsx` via `AgentationDevtools`, exactement comme dans le frontend Axplify actuel.
