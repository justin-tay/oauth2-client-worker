/**
 * Send message to service worker and get response.
 *
 * @param serviceWorker the service worker to send the message
 * @param message the message
 * @returns the response
 */
const sendMessage = (serviceWorker: ServiceWorker, message: any) => {
  return new Promise<any>((resolve) => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };
    serviceWorker.postMessage(message, [messageChannel.port2]);
  });
};

export default sendMessage;
