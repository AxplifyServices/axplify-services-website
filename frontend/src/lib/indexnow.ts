import { SITE_URL } from '@/lib/site-config';

/**
 * IndexNow permet de notifier Bing (et Yandex) qu'une ou plusieurs pages
 * viennent d'être publiées ou modifiées, pour une indexation quasi
 * immédiate au lieu d'attendre le prochain passage du crawler.
 *
 * Doc : https://www.indexnow.org/documentation
 *
 * La clé ci-dessous doit correspondre exactement au nom du fichier
 * présent dans /public (ex: /public/<key>.txt contenant la clé),
 * qui sert de preuve de propriété du domaine.
 */
export const INDEXNOW_KEY = 'e0833663fcc6dc2755de2d51cb8c42c7';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

function getHost() {
  return new URL(SITE_URL).host;
}

function getKeyLocation() {
  return new URL(`/${INDEXNOW_KEY}.txt`, SITE_URL).toString();
}

/**
 * Soumet une liste d'URLs absolues à IndexNow. À appeler après la
 * publication ou la mise à jour de contenu public (ex: un nouvel article,
 * un projet, un produit).
 *
 * Ne lève jamais d'exception : un échec de notification IndexNow ne doit
 * jamais casser le flux de publication qui l'a déclenché.
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<{ ok: boolean; status?: number }> {
  if (urls.length === 0) {
    return { ok: true };
  }

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: getHost(),
        key: INDEXNOW_KEY,
        keyLocation: getKeyLocation(),
        urlList: urls,
      }),
    });

    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false };
  }
}
