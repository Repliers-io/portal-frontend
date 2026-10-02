import { type ExpressionSpecification, type Map as MapboxMap } from 'mapbox-gl'

import mapConfig from '@configs/map'

import { patchBuildingShaders } from './shaders'

export const buildingsLayer = 'map-3d-buildings'

// Reuse Mapbox's feature paint buffer to pass an ID seed without custom geometry.
// The vertex shader restores the original white material before lighting.
export const buildingWindowColor: string | ExpressionSpecification = mapConfig
  .map3D.windows.enabled
  ? ['rgb', ['%', ['to-number', ['id'], 0], 256], 255, 255]
  : '#ffffff'

type WindowActivity = { visible: number; lit: number }

const activityByMap = new WeakMap<MapboxMap, WindowActivity>()
const installed = new WeakSet<MapboxMap['painter']>()

export const setBuildingWindowActivity = (
  map: MapboxMap,
  activity: WindowActivity
) => {
  activityByMap.set(map, activity)
  map.triggerRepaint()
}

// Private renderer adapter, scoped to one map and pinned to Mapbox GL JS 3.25.0.
export const installBuildingWindows = (map: MapboxMap) => {
  const { windows } = mapConfig.map3D
  const { painter } = map
  if (!windows.enabled || installed.has(painter)) return

  const { context } = painter
  const { gl } = context
  const getSource = painter.getShaderSource.bind(painter)
  const getProgram = painter.getOrCreateProgram.bind(painter)
  const source = patchBuildingShaders(getSource('fillExtrusion'))
  const wrapped = new WeakSet()

  painter.getShaderSource = (name) =>
    name === 'fillExtrusion' ? source : getSource(name)

  painter.getOrCreateProgram = (name, options) => {
    const program = getProgram(name, options)
    if (name !== 'fillExtrusion' || wrapped.has(program)) return program

    const draw = program.draw
    let location: WebGLUniformLocation | null | undefined
    let litLocation: WebGLUniformLocation | null | undefined
    program.draw = function (...args) {
      program._ensureReady()
      if (program.failedToCreate) return
      location ??= gl.getUniformLocation(program.program, 'uPortalWindows')
      litLocation ??= gl.getUniformLocation(program.program, 'uPortalWindowLit')
      context.program.set(program.program)
      const layer = args[7]
      const activity = activityByMap.get(map)
      gl.uniform4f(
        location,
        layer === buildingsLayer ? 1 : 0,
        windows.unitWidth,
        windows.floorHeight,
        activity?.visible ?? 0
      )
      gl.uniform1f(litLocation, activity?.lit ?? 0)
      return draw.apply(program, args)
    }
    wrapped.add(program)
    return program
  }
  installed.add(painter)
}
