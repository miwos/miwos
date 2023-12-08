import { WebSocketServer } from 'ws';
import chokidar from "chokidar";
import fs from "fs/promises";
import { resolve } from 'path';
import launch from 'launch-editor'

const pathToPosix = (path) => path.replace(/\\/g, "/");

const wss = new WebSocketServer({ port: 8080 });
let initialFilesSynced = false

let requestId = 0

const delay = async (duration) => new Promise(resolve => setTimeout(resolve, duration)) 

let prevSocket
wss.on('connection', (socket) => {
  // For now we allow only one active connection.
  prevSocket?.close()
  prevSocket = socket

  const waitForResponse = (id) => new Promise((resolve, reject) => {
    const handler = (buffer) => {
      const data = JSON.parse(new TextDecoder().decode(buffer))
      if (id === data.id) {
        socket.off('message', handler)
        resolve()
      }
    }
    socket.on('message', handler)
    setTimeout(() => reject('response timeout'), 3000)
  })

  socket.on('message', async (buffer) => {
    const data = JSON.parse(new TextDecoder().decode(buffer))

    if (data.method === 'deviceConnected' && !initialFilesSynced) {
      for (let path of filesToSync) {
        await syncFile(path, false)
        console.log('sync', path)
      }
      initialFilesSynced = true
      return
    }

    if (data.method === 'launchEditor') {
      const file = data.file.replace(/^lua\//, 'src/')
      launch(file, 'code')
    }
  })

  const syncFile = async (path, update = true) => {
    path = pathToPosix(path);
    const content = await fs.readFile(resolve('src', path), "utf8")
    const method = update ? 'updateFile' : 'writeFile'
    const id = requestId++
    socket.send(JSON.stringify({ id, method, params: { path, content } }))
    return waitForResponse(id)
  }

  const watcher = chokidar.watch("**/*", { cwd: resolve(process.cwd(), 'src')});
  watcher.on("change", syncFile);
  
  const filesToSync = [];
  const handleInitialAdd = (path) => filesToSync.push(path);
  watcher.on("add", handleInitialAdd);
  watcher.on("ready", async () => watcher.off("add", handleInitialAdd));
})