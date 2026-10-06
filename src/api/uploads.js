import api from "./client";

// Requires a matching POST /api/uploads/receipts endpoint (multipart,
// max 5MB, JPEG/PNG/WEBP/HEIC) — see the backend changes package. Returns
// an absolute URL (served from the backend's own /uploads/** static path,
// outside /api) that goes straight into CreateExpenseRequest.receiptPhotoUrl.
export async function uploadReceipt(file) {
  const formData = new FormData();
  formData.append("file", file);
  // Don't set Content-Type by hand — axios/the browser fill in the
  // multipart boundary automatically when the body is a FormData.
  const { data } = await api.post("/uploads/receipts", formData);
  return data.url;
}
