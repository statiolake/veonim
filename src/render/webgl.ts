import CreateWebGLBuffer from '../render/webgl-grid-buffer'
import CreateWebGL from '../render/webgl-utils'
import TextFG from '../render/webgl-text-fg'
import TextBG from '../render/webgl-text-bg'

const nutella = () => {
  const foregroundGL = CreateWebGL({ alpha: true, preserveDrawingBuffer: true })
  const backgroundGL = CreateWebGL({ alpha: true, preserveDrawingBuffer: true })

  const textFGRenderer = TextFG(foregroundGL)
  const textBGRenderer = TextBG(backgroundGL)
  const gridBuffer = CreateWebGLBuffer()
  let sharedDataBuffer = new Float32Array()

  textBGRenderer.share(sharedDataBuffer)
  textFGRenderer.share(sharedDataBuffer)

  // TODO: when we resize, do we have to redraw the scene?
  // yes and no. it squishes all the pixels together as if you
  // were to resize <-width-> in potatoshoppe
  const resize = (rows: number, cols: number) => {
    sharedDataBuffer = new Float32Array(rows * cols * 4)
    textBGRenderer.share(sharedDataBuffer)
    textFGRenderer.share(sharedDataBuffer)
    gridBuffer.resize(rows, cols)
    textBGRenderer.resize(rows, cols)
    textFGRenderer.resize(rows, cols)
  }

  const render = (elements?: number) => {
    textBGRenderer.render(elements)
    textFGRenderer.render(elements)
  }

  const updateColorAtlas = (colorAtlas: HTMLCanvasElement) => {
    textBGRenderer.updateColorAtlas(colorAtlas)
    textFGRenderer.updateColorAtlas(colorAtlas)
  }

  const clear = () => {
    textBGRenderer.clear()
    textFGRenderer.clear()
  }

  const moveRegionUp = (lines: number, top: number, bottom: number) => {
    gridBuffer.moveRegionUp(lines, top, bottom)
    const buf = gridBuffer.getBuffer()
    textBGRenderer.renderFromBuffer(buf)
    textFGRenderer.renderFromBuffer(buf)
  }

  const moveRegionDown = (lines: number, top: number, bottom: number) => {
    const [ start, end ] = gridBuffer.moveRegionDown(lines, top, bottom)
    const dataSlice = gridBuffer.getBuffer().subarray(start, end)
    textBGRenderer.renderFromBuffer(dataSlice)
    textFGRenderer.renderFromBuffer(dataSlice)
  }

  return {
    clear,
    render,
    resize,
    moveRegionUp,
    moveRegionDown,
    updateColorAtlas,
    getGridBuffer: gridBuffer.getBuffer,
    getBuffer: () => sharedDataBuffer,
    foregroundElement: foregroundGL.canvasElement,
    backgroundElement: backgroundGL.canvasElement,
  }
}

export default nutella
export type WebGLWrenderer = ReturnType<typeof nutella>
