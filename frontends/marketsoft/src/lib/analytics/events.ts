import type {
  AppLocale,
} from '@/i18n/routing';

/*
 * =========================================================
 * AXPLIFY ANALYTICS — EVENT NAMES
 * =========================================================
 *
 * Ce fichier constitue le contrat de tracking du frontend.
 *
 * Les composants ne doivent pas inventer leurs propres
 * noms d'événements.
 *
 * Toute nouvelle interaction suivie doit être ajoutée ici.
 */

export const ANALYTICS_EVENTS = {
  /*
   * Navigation
   */
  PAGE_VIEW:
    'page_view',

  NAVIGATION_CLICK:
    'navigation_click',

  LANGUAGE_CHANGE:
    'language_change',

  /*
   * Services
   */
  SERVICE_VIEW:
    'service_view',

  SERVICE_CTA_CLICK:
    'service_cta_click',

  /*
   * Produits
   */
  PRODUCT_VIEW:
    'product_view',

  PRODUCT_CARD_CLICK:
    'product_card_click',

  PRODUCT_CONTACT_CLICK:
    'product_contact_click',

  PRODUCT_DEMO_CLICK:
    'product_demo_click',

  PRODUCT_ORDER_CLICK:
    'product_order_click',

  /*
   * Réalisations
   */
  PROJECT_VIEW:
    'project_view',

  /*
   * Publications
   */
  PUBLICATION_VIEW:
    'publication_view',

  PUBLICATION_CTA_CLICK:
    'publication_cta_click',

  /*
   * FAQ
   */
  FAQ_OPEN:
    'faq_open',

  /*
   * Contact
   */
  CONTACT_START:
    'contact_start',

  CONTACT_SUBMIT:
    'contact_submit',

  CONTACT_SUCCESS:
    'contact_success',

  /*
   * Moyens de contact
   */
  WHATSAPP_CLICK:
    'whatsapp_click',

  PHONE_CLICK:
    'phone_click',

  EMAIL_CLICK:
    'email_click',

  /*
   * Réseaux sociaux
   */
  SOCIAL_CLICK:
    'social_click',

  /*
   * Brochures homepage
   */
  BROCHURE_VIEW:
    'brochure_view',

  BROCHURE_CLICK:
    'brochure_click',
} as const;

export type AnalyticsEventName =
  (
    typeof ANALYTICS_EVENTS
  )[keyof typeof ANALYTICS_EVENTS];

/*
 * Valeurs autorisées dans le Data Layer.
 *
 * On interdit volontairement les objets complexes.
 * Les données doivent rester simples et facilement
 * exploitables par GTM / GA4.
 */
export type AnalyticsParameterValue =
  | string
  | number
  | boolean
  | null;

export type AnalyticsParameters =
  Record<
    string,
    AnalyticsParameterValue | undefined
  >;

/*
 * Paramètres communs que l'on retrouvera
 * régulièrement dans les événements.
 */
export type AnalyticsCommonContext = {
  locale?:
    AppLocale;

  page_path?:
    string;

  page_title?:
    string;

  cta_location?:
    string;

  entity_id?:
    string;

  entity_slug?:
    string;
};