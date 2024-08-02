import { watch } from 'chokidar'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { WebSocket, WebSocketServer } from 'ws'
import mitt, { Emitter } from 'mitt'
// @ts-ignore (missing types)
import launch from 'launch-editor'

type Message = { id: number; method: string; file?: string }
type Events = { message: Message }

const pathToPosix = (path: string) => path.replace(/\\/g, '/')

const wss = new WebSocketServer({ port: 8080 })
let requestId = 0

const emitter: Emitter<Events> = mitt()
const watcher = watch('**/*', { cwd: resolve(process.cwd(), 'src') })
let filesToSync: string[] = []
const handleInitialAdd = (path: string) => {
  const isProject = pathToPosix(path).startsWith('projects/')
  if (!isProject) filesToSync.push(path)
}
watcher.on('add', handleInitialAdd)
watcher.on('ready', async () => watcher.off('add', handleInitialAdd))

const setupConnection = (socket: WebSocket) => {
  socket.on('message', async (buffer: ArrayBuffer) => {
    const data = JSON.parse(new TextDecoder().decode(buffer))
    emitter.emit('message', data)
  })

  emitter.on('message', async ({ method, file }: Message) => {
    if (method === 'deviceConnected') {
      for (let path of filesToSync) {
        await syncFile(path, false)
      }
      filesToSync = []
      return
    }

    if (method === 'launchEditor') {
      file = file!.replace(/^lua\//, 'src/')
      launch(file, 'code')
    }
  })

  const syncFile = async (path: string, update = true) => {
    path = pathToPosix(path)
    console.log('sync', path)
    const content = await readFile(resolve('src', path), 'utf8')
    const method = update ? 'updateFile' : 'writeFile'
    const id = requestId++
    socket.send(JSON.stringify({ id, method, params: { path, content } }))
    try {
      await waitForResponse(id)
    } catch (e) {
      console.warn(e)
    }
  }

  const waitForResponse = (id: number) =>
    new Promise<void>((resolve, reject) => {
      const handler = (data: Message) => {
        if (id === data.id) {
          emitter.off('message', handler)
          resolve()
        }
      }
      emitter.on('message', handler)
      setTimeout(() => reject('response timeout'), 3000)
    })

  watcher.on('change', syncFile)

  const cleanup = () => {
    socket.close()
    emitter.all.clear()
    watcher.off('change', syncFile)
  }

  return { cleanup }
}

let connection: ReturnType<typeof setupConnection> | undefined
wss.on('connection', (socket) => {
  connection?.cleanup()
  connection = setupConnection(socket)
})
