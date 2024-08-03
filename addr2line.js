import { execSync } from "child_process"
import { join } from "path"
import { homedir } from "os"

const args = process.argv.slice(2)
if (args.length < 1) {
  console.error("Error: No address argument provided.")
  process.exit(1)
}

const [address] = args;
const addr2linePath = join(
  homedir(),
  ".platformio/packages/toolchain-gccarmnoneeabi/bin/arm-none-eabi-addr2line.exe"
);
const firmwarePath = "./firmware/.pio/build/firmware/firmware.elf"
const command = `${addr2linePath} -e ${firmwarePath} ${address}`
execSync(command, { stdio: "inherit" })
