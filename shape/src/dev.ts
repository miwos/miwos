import svg from '../../app/src/assets/shapes/Input.svg?raw'
import { parseSVG } from './svg'

parseSVG('Input', svg, document.querySelector('canvas')!)
