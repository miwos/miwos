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
      if (["deviceConnected", "launchEditor"].includes(data.method))
        socket.send(JSON.stringify(data));
    });
  } catch (e) {}
})();
