/**
 * utils/helpers.js
 * Pure utility functions shared across controllers.
 */

/** Safely parse a MySQL JSON column value. */
export function parseJsonField(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify a value for MySQL JSON columns.
 * Prevents mysql2 from interpreting nested arrays as comma-separated SQL arguments.
 */
export function stringifyJsonField(val, fallback = []) {
  if (val !== undefined && val !== null) {
    if (typeof val === 'string') {
      try { JSON.parse(val); return val; } catch { return JSON.stringify([val]); }
    }
    return JSON.stringify(val);
  }
  if (fallback !== undefined && fallback !== null) {
    return typeof fallback === 'string' ? fallback : JSON.stringify(fallback);
  }
  return JSON.stringify([]);
}

/** Format a raw project DB row into a clean API response object. */
export function formatProject(row) {
  return {
    id: row.id,
    slug: row.slug || row.id,
    numericId: row.numericId,
    title: row.title,
    shortDescription: row.shortDescription,
    fullDescription: row.fullDescription,
    image: row.image,
    category: row.category,
    tags: parseJsonField(row.tags, []),
    gallery: parseJsonField(row.gallery, []),
    features: parseJsonField(row.features, []),
    techStack: parseJsonField(row.techStack, []),
    liveDemoUrl: row.liveDemoUrl,
    githubUrl: row.githubUrl,
    published: Boolean(row.published),
    featured: Boolean(row.featured),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
