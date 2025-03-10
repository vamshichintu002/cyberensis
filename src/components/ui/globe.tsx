"use client"

import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "../../lib/utils"

// Light theme configuration
const LIGHT_GLOBE_CONFIG: COBEOptions = {
  width: 1000,
  height: 1000,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
}

// Dark theme configuration
const DARK_GLOBE_CONFIG: COBEOptions = {
  width: 1000,
  height: 1000,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.3, 0.3, 0.3],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [0.4, 0.4, 0.4],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
}

export function Globe({
  className,
  config,
}: {
  className?: string
  config?: COBEOptions
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const globeInstance = useRef<any>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  let phi = 0
  let width = 0

  // Detect theme changes
  useEffect(() => {
    // Check initial theme
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)

    // Create a mutation observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setIsDarkMode(isDark)
        }
      })
    })

    // Start observing
    observer.observe(document.documentElement, { attributes: true })

    // Cleanup
    return () => observer.disconnect()
  }, [])

  // Get the appropriate config based on theme
  const themeConfig = isDarkMode 
    ? { ...DARK_GLOBE_CONFIG, ...(config || {}) }
    : { ...LIGHT_GLOBE_CONFIG, ...(config || {}) }

  const updatePointerInteraction = useCallback((value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }, [])

  const updateMovement = useCallback((clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
    }
  }, [])

  const onRender = useCallback((state: any) => {
    if (!pointerInteracting.current) {
      phi += 0.005
    }
    state.phi = phi + pointerInteractionMovement.current / 200
    state.width = width * 2
    state.height = width * 2
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth
      }
    }
    
    window.addEventListener("resize", onResize)
    onResize()

    try {
      // Destroy previous instance if it exists
      if (globeInstance.current && globeInstance.current.destroy) {
        globeInstance.current.destroy()
      }

      // Create new globe with theme-specific config
      globeInstance.current = createGlobe(canvasRef.current, {
        ...themeConfig,
        width: width * 2,
        height: width * 2,
        onRender,
      })

      // Fade in the globe
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.style.opacity = "1"
        }
      }, 100)
    } catch (error) {
      console.error("Error creating globe:", error)
    }

    return () => {
      window.removeEventListener("resize", onResize)
      if (globeInstance.current && globeInstance.current.destroy) {
        globeInstance.current.destroy()
      }
    }
  }, [themeConfig, onRender, isDarkMode]) // Add isDarkMode as a dependency

  return (
    <div className={cn("relative aspect-square w-full max-w-[600px] mx-auto", className)}>
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-0 transition-opacity duration-500"
        onPointerDown={(e) => {
          updatePointerInteraction(e.clientX - pointerInteractionMovement.current)
        }}
        onPointerUp={() => {
          updatePointerInteraction(null)
        }}
        onPointerOut={() => {
          updatePointerInteraction(null)
        }}
        onMouseMove={(e) => {
          updateMovement(e.clientX)
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            updateMovement(e.touches[0].clientX)
          }
        }}
      />
    </div>
  )
}
