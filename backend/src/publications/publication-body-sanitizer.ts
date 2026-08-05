import sanitizeHtml from 'sanitize-html';

const ALLOWED_TEXT_SIZE_CLASSES = [
  'publication-text--small',
  'publication-text--normal',
  'publication-text--large',
  'publication-text--xlarge',
];

export function sanitizePublicationBody(
  body: string | null | undefined,
): string | null {
  if (!body || body.trim().length === 0) {
    return null;
  }

  const sanitizedBody = sanitizeHtml(body, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'h2',
      'h3',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
      'span',
    ],

    allowedAttributes: {
      a: [
        'href',
        'target',
        'rel',
      ],

      span: [
        'class',
      ],
    },

    allowedClasses: {
      span: ALLOWED_TEXT_SIZE_CLASSES,
    },

    allowedSchemes: [
      'http',
      'https',
      'mailto',
      'tel',
    ],

    allowedSchemesAppliedToAttributes: [
      'href',
    ],

    allowProtocolRelative: false,

    transformTags: {
      b: 'strong',

      i: 'em',

      a: (
        tagName,
        attributes,
      ) => {
        const transformedAttributes: Record<
          string,
          string
        > = {
          ...attributes,
        };

        if (
          attributes.target ===
          '_blank'
        ) {
          transformedAttributes.target =
            '_blank';

          transformedAttributes.rel =
            'noopener noreferrer';
        } else {
          delete transformedAttributes.target;
          delete transformedAttributes.rel;
        }

        return {
          tagName,
          attribs:
            transformedAttributes,
        };
      },
    },

    exclusiveFilter:
      frame =>
        frame.tag ===
          'span' &&
        !frame.text.trim() &&
        !frame.mediaChildren?.length,
  });

  const normalizedBody =
    sanitizedBody.trim();

  return normalizedBody.length > 0
    ? normalizedBody
    : null;
}