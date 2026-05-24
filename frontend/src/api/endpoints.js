import apiClient from './apiClient'

// Auth APIs

export const authAPI = {

register: (data) => apiClient.post('/auth/register', data),

verifyRegister: (data) => apiClient.post('/auth/verify-register', data),

login: (data) => apiClient.post('/auth/login', data),

verifyLogin: (data) => apiClient.post('/auth/verify-login', data),

googleAuth: (data) => apiClient.post('/auth/google', data),

refreshToken: () => apiClient.post('/auth/refresh'),

forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),

resetPassword: (data) => apiClient.post('/auth/reset-password', data),

}

// Service APIs

export const serviceAPI = {

getCategories: () => apiClient.get('/services/categories'),

createCategory: (data, config) => apiClient.post('/services/categories', data, config),

updateCategory: (id, data, config) => apiClient.put(`/services/categories/${id}`, data, config),

deleteCategory: (id) => apiClient.delete(`/services/categories/${id}`),

getServices: (params) => apiClient.get('/services', { params }),

getServiceById: (id) => apiClient.get(`/services/${id}`),

createService: (data, config) => apiClient.post('/services', data, config),

updateService: (id, data, config) => apiClient.put(`/services/${id}`, data, config),

deleteService: (id) => apiClient.delete(`/services/${id}`),

}

// Booking APIs

export const bookingAPI = {

createBooking: (data) => apiClient.post('/bookings', data),

getBookings: () => apiClient.get('/bookings/my-bookings'),

getBookingById: (id) => apiClient.get(`/bookings/${id}`),

updateBookingStatus: (id, data) => apiClient.put(`/bookings/${id}/status`, data),

cancelBooking: (id, data) => apiClient.put(`/bookings/${id}/cancel`, data),

getAllBookings: (params) => apiClient.get('/bookings', { params }),

}

// Gallery APIs

export const galleryAPI = {

getGallery: (params) => apiClient.get('/gallery', { params }),

uploadImage: (data, config) => apiClient.post('/gallery', data, config),

deleteImage: (id) => apiClient.delete(`/gallery/${id}`),

likeImage: (id) => apiClient.post(`/gallery/${id}/like`),

saveImage: (id) => apiClient.post(`/gallery/${id}/save`),

}

// User APIs

export const userAPI = {

getProfile: () => apiClient.get('/users/profile'),

updateProfile: (data, config) => apiClient.put('/users/profile', data, config),

addAddress: (data) => apiClient.post('/users/address', data),

updateAddress: (id, data) => apiClient.put(`/users/address/${id}`, data),

deleteAddress: (id) => apiClient.delete(`/users/address/${id}`),

addFavorite: (data) => apiClient.post('/users/favorites', data),

removeFavorite: (data) => apiClient.delete('/users/favorites', { data }),

getFavorites: () => apiClient.get('/users/favorites'),

getAllUsers: (params) => apiClient.get('/users', { params }),

blockUser: (id) => apiClient.put(`/users/${id}/block`),

unblockUser: (id) => apiClient.put(`/users/${id}/unblock`),

deleteUser: (id) => apiClient.delete(`/users/${id}`),

}

// Review APIs

export const reviewAPI = {

createReview: (data, config) => apiClient.post('/reviews', data, config),

  getRecentReviews: (params) => apiClient.get('/reviews/recent', { params }),
updateReview: (id, data) => apiClient.put(`/reviews/${id}`, data),

deleteReview: (id) => apiClient.delete(`/reviews/${id}`),

likeReview: (id) => apiClient.post(`/reviews/${id}/like`),

reportReview: (id, data) => apiClient.post(`/reviews/${id}/report`, data),

}

// Message APIs

export const messageAPI = {

sendMessage: (data, config) => apiClient.post('/messages', data, config),

getMessages: (userId, params) => apiClient.get(`/messages/conversation/${userId}`, { params }),

getConversations: () => apiClient.get('/messages'),

}

// Notification APIs

export const notificationAPI = {

getNotifications: (params) => apiClient.get('/notifications', { params }),

markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),

markAllAsRead: () => apiClient.put('/notifications/read-all'),

deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),

createNotification: (data) => apiClient.post('/notifications', data),

sendBroadcast: (data) => apiClient.post('/notifications/broadcast', data),

}

// Staff APIs

export const staffAPI = {

getStaff: () => apiClient.get('/staff'),

createStaff: (data, config) => apiClient.post('/staff', data, config),

updateStaff: (id, data, config) => apiClient.put(`/staff/${id}`, data, config),

deleteStaff: (id) => apiClient.delete(`/staff/${id}`),

} 