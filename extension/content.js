const connect = () =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("open", () => resolve(socket));
    socket.addEventListener("error", reject);
  });

(async () => {
  try {
    const socket = await connect();
    socket.addEventListener("message", (event) =>
      window.postMessage(JSON.parse(event.data))
    );
    window.addEventListener("message", ({ data }) => {
      const knownMethods = ["deviceConnected", "launchEditor"]
      const isKnownMethod = knownMethods.includes(data.method)
      const isResponse = data.id !== undefined && data.state !== undefined
      if (isKnownMethod || isResponse)
        socket.send(JSON.stringify(data));
    });
  } catch (e) {}
})();
