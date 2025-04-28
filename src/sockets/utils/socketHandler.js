function handleSocketEvent(handler) {
    return async function (payload, callback) {
      try {
        const data = await handler(payload);
        callback({ success: true, data });
      } catch (error) {
        console.error('Socket Event Error:', error.message);
        callback({ success: false, error: error.message || 'An unknown error occurred' });
      }
    };
}
  
module.exports = { handleSocketEvent };