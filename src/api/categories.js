import api from "./client";

// GET /api/categories returns the Category enum values as plain strings,
// e.g. ["FOOD","TRAVEL","RENT","SHOPPING","FUN","OTHER"].
export async function getCategories() {
  const { data } = await api.get("/categories");
  return data;
}
