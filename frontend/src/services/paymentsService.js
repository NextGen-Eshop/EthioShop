import api from '../utils/api';

/**
 * @param {string} orderId
 * @param {File} file
 */
export function uploadPaymentProof(orderId, file) {
  const form = new FormData();
  form.append('screenshot', file);
  return api.post(`/api/payments/order/${orderId}/proof`, form);
}

export function approvePayment(orderId) {
  return api.post(`/api/payments/order/${orderId}/approve`);
}

export function rejectPayment(orderId, reason) {
  return api.post(`/api/payments/order/${orderId}/reject`, { reason });
}
