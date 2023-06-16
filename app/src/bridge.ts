import { Bridge } from '@miwos/bridge'
import { WebSerialTransport } from '@miwos/bridge/src/WebSerialTransport'
import { markRaw } from 'vue'

let bridge: Bridge | undefined
const debug = false
export const useBridge = () =>
  (bridge ??= markRaw(new Bridge(new WebSerialTransport(), { debug })))
