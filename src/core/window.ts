import CreateWindowNameplate, { NameplateState } from '../core/window-nameplate'
import CreateWindowCanvas, { WindowCanvas } from '../core/window-canvas'
import CreateWindowGrid, { WindowGrid } from '../core/window-grid'
import { merge } from '../support/utils'
import { makel } from '../ui/vanilla'

export interface WindowInfo {
  id: number
  gridId: number
  row: number
  col: number
  width: number
  height: number
}

interface GridStyle {
  gridRow: string
  gridColumn: string
}

export interface Window {
  grid: WindowGrid
  canvas: WindowCanvas
  element: HTMLElement
  getWindowInfo(): WindowInfo
  renderBuffer: Float32Array
  setWindowInfo(info: WindowInfo): void
  applyGridStyle(gridStyle: GridStyle): void
  updateNameplate(data: NameplateState): void
  addOverlayElement(element: HTMLElement): void
  removeOverlayElement(element: HTMLElement): void
  resizeWindow(width: number, height: number): void
  destroy(): void
}

export default () => {
  const wininfo: WindowInfo = { id: 0, gridId: 0, row: 0, col: 0, width: 0, height: 0 }
  const grid = CreateWindowGrid()
  // stores webgl buffer data: [ ascii char code, col, row, highlightId ]
  let renderBuffer = new Float32Array(4)

  const container = makel({
    flexFlow: 'column',
    background: 'none',
    display: 'flex',
  })

  const content = makel({
    display: 'flex'
  })

  const overlay = makel({
    display: 'flex',
    position: 'absolute',
  })

  const nameplate = CreateWindowNameplate()
  const canvas = CreateWindowCanvas()

  overlay.setAttribute('wat', 'overlay')
  content.setAttribute('wat', 'content')
  canvas.element.setAttribute('wat', 'canvas')
  nameplate.element.setAttribute('wat', 'nameplate')

  content.appendChild(overlay)
  content.appendChild(canvas.element)

  container.appendChild(nameplate.element)
  container.appendChild(content)

  const api = {
    get grid() { return grid },
    get canvas() { return canvas.api },
    get element() { return container },
    get renderBuffer() { return renderBuffer },
  } as Window

  api.resizeWindow = (width, height) => {
    canvas.api.resize(height, width)
    grid.resize(height, width)
    renderBuffer = new Float32Array(width * height * 4)
  }

  api.setWindowInfo = info => {
    container.id = `${info.id}`
    merge(wininfo, info)
  }

  api.getWindowInfo = () => ({ ...wininfo })

  api.applyGridStyle = ({ gridRow, gridColumn }) => merge(container.style, { gridColumn, gridRow })

  api.addOverlayElement = element => {
    overlay.appendChild(element)
    return () => overlay.removeChild(element)
  }

  api.removeOverlayElement = el => overlay.contains(el) && overlay.removeChild(el)

  api.updateNameplate = data => nameplate.update(data)

  api.destroy = () => {
    console.warn('NYI: window.destroy()')
    // TODO: destroy elements, cleanup, destroy canvas, components, anything else thanks etc.
  }

  return api
}
