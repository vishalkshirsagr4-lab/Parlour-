export const handleSocketEvents = (io, socket) => {
  console.log(`✓ User connected: ${socket.id}`);

  socket.on('join-chat', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`✓ User ${userId} joined chat`);
  });

  socket.on('send-message', (data) => {
    io.to(`user-${data.receiverId}`).emit('receive-message', data);
  });

  socket.on('typing', (data) => {
    io.to(`user-${data.receiverId}`).emit('user-typing', { senderId: data.senderId });
  });

  socket.on('stop-typing', (data) => {
    io.to(`user-${data.receiverId}`).emit('user-stop-typing', { senderId: data.senderId });
  });

  socket.on('notification', (data) => {
    io.to(`user-${data.userId}`).emit('receive-notification', data);
  });

  socket.on('disconnect', () => {
    console.log(`✗ User disconnected: ${socket.id}`);
  });
};
