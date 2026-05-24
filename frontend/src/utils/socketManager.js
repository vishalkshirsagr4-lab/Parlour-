import io from 'socket.io-client'

const SOCKET_URL = 'https://parlour-vr34.onrender.com'

let socket = null

export const initSocket = (token) => {
  if (socket) return socket

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const socketEvents = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  SEND_MESSAGE: 'send-message',
  RECEIVE_MESSAGE: 'receive-message',
  TYPING: 'typing',
  USER_TYPING: 'user-typing',
  STOP_TYPING: 'stop-typing',
  USER_STOP_TYPING: 'user-stop-typing',
  NOTIFICATION: 'notification',
  RECEIVE_NOTIFICATION: 'receive-notification',
  JOIN_CHAT: 'join-chat',
}
