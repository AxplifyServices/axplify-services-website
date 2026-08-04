export function trimRequiredString({
  value,
}: {
  value:
    unknown;
}) {
  return typeof value ===
    'string'
    ? value.trim()
    : value;
}

export function optionalTrimmedString({
  value,
}: {
  value:
    unknown;
}) {
  if (
    typeof value !==
    'string'
  ) {
    return value;
  }

  const trimmedValue =
    value.trim();

  return trimmedValue.length
    ? trimmedValue
    : undefined;
}

export function optionalNullableTrimmedString({
  value,
}: {
  value:
    unknown;
}) {
  if (
    value ===
    null
  ) {
    return null;
  }

  if (
    typeof value !==
    'string'
  ) {
    return value;
  }

  const trimmedValue =
    value.trim();

  return trimmedValue.length
    ? trimmedValue
    : null;
}

export function normalizeSlug({
  value,
}: {
  value:
    unknown;
}) {
  if (
    typeof value !==
    'string'
  ) {
    return value;
  }

  return value
    .trim()
    .toLowerCase()
    .normalize(
      'NFD',
    )
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-z0-9]+/g,
      '-',
    )
    .replace(
      /-+/g,
      '-',
    )
    .replace(
      /^-|-$/g,
      '',
    );
}

export function normalizeStringArray({
  value,
}: {
  value:
    unknown;
}) {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return value;
  }

  return value
    .filter(
      (
        item,
      ) =>
        typeof item ===
        'string',
    )
    .map(
      (
        item,
      ) =>
        item.trim(),
    )
    .filter(
      Boolean,
    );
}

export function normalizeBoolean({
  value,
}: {
  value:
    unknown;
}) {
  if (
    typeof value ===
    'boolean'
  ) {
    return value;
  }

  if (
    value ===
      'true' ||
    value ===
      1 ||
    value ===
      '1'
  ) {
    return true;
  }

  if (
    value ===
      'false' ||
    value ===
      0 ||
    value ===
      '0'
  ) {
    return false;
  }

  return value;
}