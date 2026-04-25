import api from '../utils/api';

export function createOrder(body) {
  return api.post('/api/orders', body);
}

export function getMyOrders() {
  return api.get('/api/orders/my');
}

export function getOrderById(id) {
  return api.get(`/api/orders/${id}`);
}

export function listAllOrders() {
  return api.get('/api/orders');
}

export function updateOrderStatus(id, status) {
  return api.put(`/api/orders/${id}`, { status });
}

export function deleteOrder(id) {
  return api.delete(`/api/orders/${id}`);
}
