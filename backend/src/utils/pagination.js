/**
 * Runs a paginated query and returns a consistent response shape:
 *   { items, page, limit, total, totalPages }
 *
 * `_id` is added to the sort as a tie-breaker so documents created in the same
 * millisecond never jump between pages.
 */
export const paginate = async (Model, filter, { page, limit, sort = { createdAt: -1 }, select }) => {
  const [items, total] = await Promise.all([
    Model.find(filter)
      .select(select)
      .sort({ ...sort, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Model.countDocuments(filter),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};
