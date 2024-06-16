import type { Transport, TransportDataHandler } from './Transport'
import { SlipEncoder, SlipDecoder } from './utils/web-serial-slip'

export type OpenOptions = SerialOptions & {
  usbVendorId: number
  usbProductId: number
}

export class WebSerialTransport implements Transport {
  private port: SerialPort | undefined
  private reader: ReadableStreamDefaultReader | undefined
  private writer: WritableStreamDefaultWriter | undefined
  private readableStreamClosed: Promise<void> | undefined
  private writableStreamClosed: Promise<void> | undefined
  private dataHandler: TransportDataHandler | undefined
  private openHandler: (() => any) | undefined
  private closeHandler: (() => any) | undefined
  private autoConnectIsSetup = false

  async open(options: OpenOptions) {
    const { usbVendorId, usbProductId } = options

    // First, try to automatically connect to a port that the user already has
    // granted permission to.
    const ports = await navigator.serial.getPorts()
    this.port = ports.find((port) => {
      const info = port.getInfo()
      return (
        info.usbVendorId === usbVendorId && info.usbProductId === usbProductId
      )
    })

    // If no port is found, request the user. But since this requires a user
    // gesture (which might or might not have happened) we try-catch it.
    try {
      this.port ??= await navigator.serial.requestPort({
        filters: [{ usbVendorId, usbProductId }],
      })
    } catch (e) {}

    if (this.port) this.setupPort(this.port, options)

    // In case the port is unplugged and then plugged back in again, or if the
    // user hasn't plugged in the device yet, we will also listen for any new
    // connections.
    if (!this.autoConnectIsSetup) {
      navigator.serial.addEventListener('connect', (event) => {
        console.log('connect', event)
        const port = event.target as SerialPort
        const info = port.getInfo()
        const isCorrectPort =
          info.usbVendorId === usbVendorId && info.usbProductId === usbProductId
        if (isCorrectPort) this.setupPort(port, options)
      })
      this.autoConnectIsSetup = true
    }
  }

  async close() {
    this.reader?.cancel()
    // Ignore any errors.
    await this.readableStreamClosed?.catch(() => {})

    this.writer?.close()
    await this.writableStreamClosed

    await this.port?.close()
    this.closeHandler?.()
  }

  private async setupPort(port: SerialPort, options: SerialOptions) {
    // `setupPort` should only be called on closed ports, but sometimes when
    // working with HMR in vite, it is called for an already opened port ...
    if (port && this.portIsOpen(port)) return

    this.port = port
    this.port.addEventListener('disconnect', () => this.closeHandler?.())
    await this.port.open(options)

    this.setupReader()
    this.setupWriter()
    this.listen()

    this.openHandler?.()
  }

  private setupWriter() {
    if (!this.port?.writable)
      throw new Error('Port is either not initialized or not writable.')

    const slipEncoder = new SlipEncoder()
    this.writableStreamClosed = slipEncoder.readable.pipeTo(this.port.writable)

    this.writer = slipEncoder.writable.getWriter()
  }

  private setupReader() {
    if (!this.port?.readable)
      throw new Error('Port is either not initialized or not readable.')

    const slipDecoder = new SlipDecoder()
    this.readableStreamClosed = this.port.readable.pipeTo(slipDecoder.writable)
    this.reader = slipDecoder.readable.getReader()
  }

  async listen() {
    if (!this.reader) throw new Error(`Reader is not setup.`)

    while (true) {
      const { value, done } = await this.reader.read()
      if (done) {
        this.reader.releaseLock()
        break
      }

      this.dataHandler?.(value)
    }
  }

  async write(data: Uint8Array) {
    await this.writer?.write(data)
  }

  private portIsOpen(port: SerialPort) {
    return port.writable && port.writable
  }


  onData(handler: TransportDataHandler) {
    this.dataHandler = handler
  }

  onClose(handler: () => any) {
    this.closeHandler = handler
  }

  onOpen(handler: () => any) {
    this.openHandler = handler
  }
}
