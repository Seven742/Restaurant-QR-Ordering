import { str, num, int, bool } from './validate';
import { ApiError } from './api';

/**
 * Validate a product body. With partial=true (PATCH) only the fields that were sent are checked.
 * Returns an object with clean values, ready for the database.
 */
export function parseProduct(body, partial = false) {
  const has = (k) => body[k] !== undefined;
  const out = {};

  if (!partial || has('name')) out.name = str(body.name, 'name', { required: true, max: 120 });
  if (!partial || has('description')) out.description = str(body.description, 'description', { max: 1000 });
  if (!partial || has('price')) out.price = num(body.price, 'price', { min: 0, max: 10000 });
  if (!partial || has('category_id'))
    out.category_id = body.category_id == null ? null : int(body.category_id, 'category_id', { min: 1 });
  if (!partial || has('available')) out.available = bool(body.available ?? true, 'available') ? 1 : 0;
  if (!partial || has('image')) {
    out.image = str(body.image, 'image', { max: 255 });
    // Only local paths (/uploads/...) or https URLs are allowed
    if (out.image && !/^(\/|https:\/\/)/.test(out.image)) throw new ApiError(422, 'image must be a /path or https:// URL');
  }
  return out;
}
