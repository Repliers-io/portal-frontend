'use client'

import { useEffect, useRef } from 'react'

import { Box } from '@mui/material'

interface NoiseLoaderProps {
  width?: number
  height?: number
  intensity?: number
  speed?: number
}

export const NoiseLoader = ({
  width = 340,
  height = 520,
  intensity = 0.2,
  speed = 50
}: NoiseLoaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    const generateNoise = () => {
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255 * intensity
        data[i] = noise // R
        data[i + 1] = noise // G
        data[i + 2] = noise // B
        data[i + 3] = 255 // A
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const animate = () => {
      generateNoise()
      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate)
      }, speed)
    }

    animate()

    return () => {
      clearTimeout(animationRef.current)
    }
  }, [width, height, intensity, speed])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Loading animation with white noise effect"
        style={{
          top: 0,
          left: 0,
          width,
          height,
          opacity: 0.8,
          position: 'absolute'
        }}
      />
      <Box
        sx={{
          zIndex: 1,
          fontSize: 18,
          color: '#FFF',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        Connecting...
      </Box>
    </Box>
  )
}
