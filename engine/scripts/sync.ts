import { watch } from 'chokidar'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { WebSocket, WebSocketServer } from 'ws'
// @ts-ignore (missing types)
import launch from 'launch-editor'

const pathToPosix = (path: string) => path.replace(/\\/g, '/')

const wss = new WebSocketServer({ port: 8080 })
let initialFilesSynced = false
let requestId = 0
let prevSocket: WebSocket | undefined

wss.on('connection', (socket) => {
  // For now we allow only one active connection.
  prevSocket?.close()
  prevSocket = socket

  const waitForResponse = (id: number) =>
    new Promise<void>((resolve, reject) => {
      const handler = (buffer: ArrayBuffer) => {
        const data = JSON.parse(new TextDecoder().decode(buffer))
        if (id === data.id) {
          socket.off('message', handler)
          resolve()
        }
      }
      socket.on('message', handler)
      setTimeout(() => reject('response timeout'), 3000)
    })

  socket.on('message', async (buffer: ArrayBuffer) => {
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

  const syncFile = async (path: string, update = true) => {
    path = pathToPosix(path)
    const content = await readFile(resolve('src', path), 'utf8')
    const method = update ? 'updateFile' : 'writeFile'
    const id = requestId++
    socket.send(JSON.stringify({ id, method, params: { path, content } }))
    return waitForResponse(id)
  }

  const watcher = watch('**/*', { cwd: resolve(process.cwd(), 'src') })
  watcher.on('change', syncFile)

  const filesToSync: string[] = []
  const handleInitialAdd = (path: string) => {
    const isProject = pathToPosix(path).startsWith('projects/')
    if (!isProject) filesToSync.push(path)
  }
  watcher.on('add', handleInitialAdd)
  watcher.on('ready', async () => watcher.off('add', handleInitialAdd))
})
