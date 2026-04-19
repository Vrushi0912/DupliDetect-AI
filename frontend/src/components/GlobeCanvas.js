import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './GlobeCanvas.css';

const GlobeCanvas = ({ width = 500, height = 500 }) => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // The D3 Earth implementation requested by the user, colored in neon themes!
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const containerWidth = width;
    const containerHeight = height;
    const radius = Math.min(containerWidth, containerHeight) / 2.2;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    context.scale(dpr, dpr);

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90);

    const path = d3.geoPath().projection(projection).context(context);

    const pointInPolygon = (point, polygon) => {
      const [x, y] = point;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    };

    const pointInFeature = (point, feature) => {
      const geometry = feature.geometry;
      if (geometry.type === 'Polygon') {
        const coordinates = geometry.coordinates;
        if (!pointInPolygon(point, coordinates[0])) return false;
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) return false;
        }
        return true;
      } else if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false;
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true;
                break;
              }
            }
            if (!inHole) return true;
          }
        }
        return false;
      }
      return false;
    };

    const generateDotsInPolygon = (feature, dotSpacing = 16) => {
      const dots = [];
      const bounds = d3.geoBounds(feature);
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;
      const stepSize = dotSpacing * 0.08;

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point = [lng, lat];
          if (pointInFeature(point, feature)) {
            dots.push(point);
          }
        }
      }
      return dots;
    };

    const allDots = [];
    let landFeatures;

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight);

      const currentScale = projection.scale();
      const scaleFactor = currentScale / radius;

      // Draw ocean (globe background) - deep dark purple neon glow
      const bgGrad = context.createRadialGradient(
        containerWidth / 2 - currentScale * 0.4, 
        containerHeight / 2 - currentScale * 0.4, 
        0, 
        containerWidth / 2, 
        containerHeight / 2, 
        currentScale
      );
      bgGrad.addColorStop(0, "rgba(30, 20, 60, 0.95)");
      bgGrad.addColorStop(1, "rgba(5, 5, 20, 0.95)");

      context.beginPath();
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI);
      context.fillStyle = bgGrad;
      context.fill();
      
      // Globe border - Neon Purple
      context.strokeStyle = "rgba(124, 58, 237, 0.5)";
      context.lineWidth = 1.5 * scaleFactor;
      context.stroke();

      if (landFeatures) {
        // Draw graticule - faint neon cyan overlay
        const graticule = d3.geoGraticule();
        context.beginPath();
        path(graticule());
        context.strokeStyle = "rgba(6, 182, 212, 0.15)";
        context.lineWidth = 0.8 * scaleFactor;
        context.stroke();

        // Draw land outlines - faintly colored
        context.beginPath();
        landFeatures.features.forEach((feature) => {
          path(feature);
        });
        context.strokeStyle = "rgba(168, 85, 247, 0.3)";
        context.lineWidth = 1 * scaleFactor;
        context.stroke();

        // Draw halftone dots - Bright Neon Cyan to Blue gradient effect roughly based on X pos
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat]);
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            // Check if dot is on the visible side of the globe
            // Actually D3 geoOrthographic clips automatically if we just test path(point) or look at projected boundaries
            // But we already set clipAngle(90). If projected returns null it's clipped, but we tested projected != null.
            // D3 projection returns valid coords even if clipped sometimes, so we must be careful.
            // A simpler way to check visibility for orthographic is the distance to center.
            const dx = projected[0] - containerWidth / 2;
            const dy = projected[1] - containerHeight / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist <= currentScale) {
              // Interpolate color from left (purple) to right (cyan)
              const ratio = projected[0] / containerWidth;
              const r = Math.round(168 - (168 - 6) * ratio);
              const g = Math.round(85 - (85 - 182) * ratio);
              const b = Math.round(247 - (247 - 212) * ratio);
              
              context.beginPath();
              context.arc(projected[0], projected[1], 1.4 * scaleFactor, 0, 2 * Math.PI);
              context.fillStyle = `rgb(${r}, ${g}, ${b})`;
              context.fill();

              // Add tiny glow to dots on the right side
              if (ratio > 0.6 && Math.random() > 0.6) {
                context.beginPath();
                context.arc(projected[0], projected[1], 2.5 * scaleFactor, 0, 2 * Math.PI);
                context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
                context.fill();
              }
            }
          }
        });
      }
    };

    const loadWorldData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json"
        );
        if (!response.ok) throw new Error("Failed to load land data");

        landFeatures = await response.json();

        landFeatures.features.forEach((feature) => {
          const dots = generateDotsInPolygon(feature, 16);
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat, visible: true });
          });
        });

        render();
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };

    // Rotation state
    const baseRotation = [0, 0];
    const mouseRotationOffset = [0, 0];
    const targetRotationOffset = [0, 0];
    const currentRotation = [0, 0];
    const rotationSpeed = 0.4;

    const rotate = () => {
      // Auto-increment base rotation (X axis)
      baseRotation[0] += rotationSpeed;

      // Smoothly lerp towards target mouse offset
      mouseRotationOffset[0] += (targetRotationOffset[0] - mouseRotationOffset[0]) * 0.05;
      mouseRotationOffset[1] += (targetRotationOffset[1] - mouseRotationOffset[1]) * 0.05;

      // Apply
      currentRotation[0] = baseRotation[0] + mouseRotationOffset[0];
      currentRotation[1] = mouseRotationOffset[1];

      projection.rotate(currentRotation);
      render();
    };
    
    const rotationTimer = d3.timer(rotate);

    // Hover Interaction
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // Base sensitivity 
      // e.g. edge of canvas equals ~45 degrees of tilt
      targetRotationOffset[0] = (dx / (rect.width / 2)) * 45;
      targetRotationOffset[1] = -(dy / (rect.height / 2)) * 45; // invert Y for proper 3D feel
    };

    const handleMouseLeave = () => {
      // Reset targets smoothly when mouse leaves
      targetRotationOffset[0] = 0;
      targetRotationOffset[1] = 0;
    };

    // Attach hover listeners instead of drag/zoom
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    loadWorldData();

    return () => {
      rotationTimer.stop();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [width, height]);

  return (
    <div className="globe-canvas-wrapper" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justify: 'center', position: 'relative' }}>
      
      {/* Background Ellipses (Rings behind the earth) */}
      <svg width="700" height="700" viewBox="0 0 700 700" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0 }}>
        <ellipse cx="350" cy="350" rx="330" ry="110" fill="none" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" transform="rotate(-15 350 350)" />
        <ellipse cx="350" cy="350" rx="350" ry="130" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="1.5" transform="rotate(10 350 350)" />
      </svg>

      {/* The Globe Canvas */}
      <div style={{ position: 'relative', width: 500, height: 500, zIndex: 1 }}>
        <canvas
          ref={canvasRef}
          style={{ width: 500, height: 500, contain: 'layout paint size', cursor: 'default' }}
        />
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justify: 'center', color: '#a855f7', fontWeight: 'bold' }}>
            Loading AI Map...
          </div>
        )}
      </div>

      {/* Foreground SVG (Connectors and Central Brain) */}
      <svg width="500" height="500" viewBox="0 0 500 500" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 10 }}>
        <defs>
          <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <radialGradient id="dotGradPu" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#9333ea" />
          </radialGradient>
          <radialGradient id="dotGradCy" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="100%" stopColor="#0891b2" />
          </radialGradient>
          <filter id="svgGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* --- Curved Connectors --- */}
        <path d="M 250 205 C 270 120, 250 50, 250 -5" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" />
        <circle cx="250" cy="-5" r="4" fill="url(#dotGradPu)" filter="url(#svgGlow)"/>

        <path d="M 295 215 C 380 180, 420 120, 440 75" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" />
        <circle cx="440" cy="75" r="4" fill="url(#dotGradPu)" filter="url(#svgGlow)"/>

        <path d="M 295 285 C 380 320, 420 350, 440 375" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1.5" />
        <circle cx="440" cy="375" r="4" fill="url(#dotGradCy)" filter="url(#svgGlow)"/>

        <path d="M 250 295 C 230 380, 250 420, 250 450" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1.5" />
        <circle cx="250" cy="450" r="4" fill="url(#dotGradCy)" filter="url(#svgGlow)"/>

        <path d="M 205 285 C 120 320, 80 350, 60 375" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1.5" />
        <circle cx="60" cy="375" r="4" fill="url(#dotGradCy)" filter="url(#svgGlow)"/>

        <path d="M 205 215 C 120 180, 80 120, 60 75" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" />
        <circle cx="60" cy="75" r="4" fill="url(#dotGradPu)" filter="url(#svgGlow)"/>

        {/* --- Central Glowing Box --- */}
        <rect x="200" y="200" width="100" height="100" rx="18" fill="rgba(10, 5, 20, 0.95)" stroke="url(#boxGrad)" strokeWidth="2.5" filter="url(#svgGlow)" />
        
        {/* --- Brain Icon --- */}
        <g transform="translate(222, 222) scale(2)" filter="url(#svgGlow)">
          <path d="M 14 18 C 6 18, 2 13, 4 8 C 4 4, 8 2, 12 4 C 12 2, 16 2, 17 5 M 14 18 C 22 18, 26 13, 24 8 C 24 4, 20 2, 16 4 C 16 2, 12 2, 11 5" fill="none" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="14" y1="4" x2="14" y2="18" stroke="rgba(168,85,247,0.4)" strokeWidth="0.8" />
          <line x1="14" y1="18" x2="14" y2="22" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" />

          {/* Left Hemisphere Inner Neural Network */}
          <circle cx="8" cy="10" r="0.6" fill="#a855f7" />
          <circle cx="11" cy="6" r="0.6" fill="#a855f7" />
          <circle cx="6" cy="14" r="0.6" fill="#a855f7" />
          <circle cx="10" cy="15" r="0.6" fill="#a855f7" />
          <polyline points="8,10 11,6" stroke="#a855f7" strokeWidth="0.5" />
          <polyline points="8,10 6,14" stroke="#a855f7" strokeWidth="0.5" />
          <polyline points="6,14 10,15 13,14" stroke="#a855f7" strokeWidth="0.5" />

          {/* Right Hemisphere Inner Neural Network */}
          <circle cx="20" cy="10" r="0.6" fill="#3b82f6" />
          <circle cx="17" cy="6" r="0.6" fill="#3b82f6" />
          <circle cx="22" cy="14" r="0.6" fill="#3b82f6" />
          <circle cx="18" cy="15" r="0.6" fill="#3b82f6" />
          <polyline points="20,10 17,6" stroke="#3b82f6" strokeWidth="0.5" />
          <polyline points="20,10 22,14" stroke="#3b82f6" strokeWidth="0.5" />
          <polyline points="22,14 18,15 15,14" stroke="#3b82f6" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
};

export default GlobeCanvas;
