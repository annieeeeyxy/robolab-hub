import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// The glitter: each colour channel samples the text texture at a slightly
// different, time-varying offset, so the glyph edges shimmer through the brand
// gradient the <pre> is painted with.
const fragmentShader = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uDrift;
uniform float uTime;

// RoboPrompt pink / RoboLab FTC cyan. The edge colour travels between them
// rather than being one or the other, so the block reads as a spectrum.
const vec3 PINK = vec3(0.957, 0.447, 0.714);
const vec3 CYAN = vec3(0.133, 0.827, 0.933);

void main() {
    vec2 pos = vUv;

    float core  = texture2D(uTexture, pos).a;
    float left  = texture2D(uTexture, pos - vec2(uDrift, 0.0)).a;
    float right = texture2D(uTexture, pos + vec2(uDrift, 0.0)).a;

    // Edge masks rather than offset copies of the glyph: a pixel is on an edge
    // where it is covered but its neighbour is not. Colour therefore lands *on*
    // the character outline and the shape stays crisp — offsetting whole tinted
    // copies is what produced the blurred double-image.
    float edgeA = clamp(core - right, 0.0, 1.0);
    float edgeB = clamp(core - left, 0.0, 1.0);

    // Position along the pink↔cyan ramp, sweeping across the block and drifting
    // over time, so opposite edges sit at opposite ends of the spectrum.
    float t = 0.5 + 0.5 * sin(uTime * 0.9 + pos.x * 7.0);

    vec3 col = vec3(core);
    col = mix(col, mix(PINK, CYAN, t), edgeA);
    col = mix(col, mix(CYAN, PINK, t), edgeB);

    // Alpha is the glyph's own coverage: nothing is drawn outside the character.
    gl_FragColor = vec4(col, core);
}
`;

// Edge width, in pixels of the text texture (drawn at textFontSize). Small on
// purpose: this is an outline, not a displacement.
const FRINGE_PX = 2.5;

// The ASCII grid only lines up if the glyphs are fixed-pitch: every row is a
// plain string, so a proportional fallback makes each row drift and the block
// shears. The upstream component pulled IBM Plex Mono off Google Fonts; this
// project already ships Iosevka via next/font, so use that (its generated family
// name lives on --font-iosevka) and fall back to the generic monospace keyword.
function resolveMonoFamily() {
  if (typeof window === 'undefined') return 'monospace';
  const generated = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-iosevka')
    .trim();
  return generated ? `${generated}, monospace` : 'monospace';
}

class AsciiFilter {
  constructor(renderer, { fontSize, fontFamily, charset, invert } = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement('div');
    this.domElement.style.position = 'absolute';
    this.domElement.style.top = '0';
    this.domElement.style.left = '0';
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';

    this.pre = document.createElement('pre');
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.domElement.appendChild(this.canvas);

    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "'Courier New', monospace";
    this.charset = charset ?? ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;

  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();

  }

  reset() {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const charWidth = this.context.measureText('A').width;

    this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
    this.rows = Math.floor(this.height / this.fontSize);

    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    this.pre.style.fontFamily = this.fontFamily;
    this.pre.style.fontSize = `${this.fontSize}px`;
    this.pre.style.margin = '0';
    this.pre.style.padding = '0';
    this.pre.style.lineHeight = '1em';
    this.pre.style.position = 'absolute';
    this.pre.style.left = '0';
    this.pre.style.top = '0';
    this.pre.style.zIndex = '9';

    this.pre.style.mixBlendMode = 'normal';
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    if (this.context && w && h) {
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
    }

    this.asciify(this.context, w, h);
  }



  asciify(ctx, w, h) {
    if (w && h) {
      const imgData = ctx.getImageData(0, 0, w, h).data;
      let str = '';
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = x * 4 + y * 4 * w;
          const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];

          if (a === 0) {
            str += ' ';
            continue;
          }

          let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
          let idx = Math.floor((1 - gray) * (this.charset.length - 1));
          if (this.invert) idx = this.charset.length - idx - 1;
          str += this.charset[idx];
        }
        str += '\n';
      }
      this.pre.innerHTML = str;
    }
  }

  dispose() {}
}

class CanvasTxt {
  constructor(txt, { fontSize = 200, fontFamily = 'Arial', color = '#fdf9f3' } = {}) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.txt = txt;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;

    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  // Split on newlines so a long title can be laid out as a block instead of one
  // very wide line. A single line forced the plane to a ~13:1 aspect, which left
  // the text only a handful of character rows tall once asciified — unreadable.
  get lines() {
    return String(this.txt).split('\n');
  }

  get lineHeight() {
    return Math.ceil(this.fontSize * 1.12);
  }

  resize() {
    this.context.font = this.font;
    const lines = this.lines;

    const textWidth = Math.ceil(Math.max(...lines.map(line => this.context.measureText(line).width))) + 20;
    const textHeight = this.lineHeight * lines.length + 20;

    this.canvas.width = textWidth;
    this.canvas.height = textHeight;
  }

  // Roughly equal luminance across the ramp, so character density stays even
  // along the text instead of thinning out at one end.
  get fillStyle() {
    if (!Array.isArray(this.color)) return this.color;
    const gradient = this.context.createLinearGradient(0, 0, this.canvas.width, 0);
    this.color.forEach((stop, i) => gradient.addColorStop(i / (this.color.length - 1), stop));
    return gradient;
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.fillStyle;
    this.context.font = this.font;
    this.context.textBaseline = 'alphabetic';

    const lines = this.lines;
    const lh = this.lineHeight;
    // Nudge the first baseline down by the cap height so tall glyphs aren't clipped.
    const firstBaseline = 10 + this.context.measureText('M').actualBoundingBoxAscent;

    lines.forEach((line, i) => {
      this.context.fillText(line, 10, firstBaseline + i * lh);
    });
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get texture() {
    return this.canvas;
  }
}

class CanvAscii {
  constructor(
    { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, align },
    containerElem,
    width,
    height
  ) {
    this.textString = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = containerElem;
    this.width = width;
    this.height = height;
    this.align = align;

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 30;

    this.scene = new THREE.Scene();

  }

  async init() {
    this.fontFamily = resolveMonoFamily();
    try {
      await document.fonts.load(`600 ${this.textFontSize}px ${this.fontFamily}`);
      await document.fonts.load(`500 ${this.asciiFontSize}px ${this.fontFamily}`);
    } catch (e) {
      // Font loading failed, continue with fallback
    }
    await document.fonts.ready;

    this.setMesh();
    this.setRenderer();
  }

  setMesh() {
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: this.fontFamily,
      color: this.textColor
    });
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;

    const textAspect = this.textCanvas.width / this.textCanvas.height;
    const baseH = this.planeBaseHeight;
    const planeW = baseH * textAspect;
    const planeH = baseH;

    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        // Constant fringe width in texture pixels, so every block fringes the
        // same amount relative to its glyphs regardless of how wide it is.
        uDrift: { value: FRINGE_PX / this.textCanvas.width },
        uTexture: { value: this.texture },
      }
    });

    this.planeW = planeW;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    this.updateAlignment();
  }

  // The mesh sits at the scene origin, so by default the text is centred in its
  // container and its left edge floats with the text's own width. Shifting it by
  // half the leftover width pins it to the container's left edge instead, which
  // is what lets separate ASCIIText blocks share a margin.
  updateAlignment() {
    if (!this.mesh) return;
    if (this.align !== 'left') {
      this.mesh.position.x = 0;
      return;
    }
    const visibleHeight = 2 * this.camera.position.z * Math.tan((this.camera.fov * Math.PI) / 360);
    const visibleWidth = visibleHeight * this.camera.aspect;
    this.mesh.position.x = -(visibleWidth - this.planeW) / 2;
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: this.fontFamily,
      fontSize: this.asciiFontSize,
      invert: true
    });

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);

  }

  setSize(w, h) {
    this.width = w;
    this.height = h;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    // Left alignment is derived from the visible width, which just changed.
    this.updateAlignment();

    this.filter.setSize(w, h);
    if (this.mesh) this.render();

  }

  load() {
    this.animate();
  }

  animate() {
    const frame = () => {
      this.animationFrameId = requestAnimationFrame(frame);
      this.render();
    };
    frame();
  }

  render() {
    // The text itself never changes, so the texture is uploaded once at setup;
    // only the shader clock advances per frame.
    this.mesh.material.uniforms.uTime.value = performance.now() * 0.001;
    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateRotation() {
    // Held flat and square to the camera on purpose. Upstream tilted the mesh
    // toward the pointer, which read as a 3D slab and sheared the glyphs; here
    // the ASCII block should behave like flat type, so the pose never changes.
    this.mesh.rotation.set(0, 0, 0);
  }

  clear() {
    this.scene.traverse(obj => {
      if (obj.isMesh && typeof obj.material === 'object' && obj.material !== null) {
        Object.keys(obj.material).forEach(key => {
          const matProp = obj.material[key];
          if (matProp !== null && typeof matProp === 'object' && typeof matProp.dispose === 'function') {
            matProp.dispose();
          }
        });
        obj.material.dispose();
        obj.geometry.dispose();
      }
    });
    this.scene.clear();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.filter) {
      this.filter.dispose();
      if (this.filter.domElement.parentNode) {
        this.container.removeChild(this.filter.domElement);
      }
    }
    this.clear();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}

export default function ASCIIText({
  text = 'David!',
  asciiFontSize = 8,
  textFontSize = 200,
  textColor = '#ffffff',
  planeBaseHeight = 8,
  align = 'center'
}) {
  const containerRef = useRef(null);
  const asciiRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let observer = null;
    let ro = null;

    const createAndInit = async (container, w, h) => {
      const instance = new CanvAscii(
        { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, align },
        container,
        w,
        h
      );
      await instance.init();
      return instance;
    };

    const setup = async () => {
      const { width, height } = containerRef.current.getBoundingClientRect();

      if (width === 0 || height === 0) {
        observer = new IntersectionObserver(
          async ([entry]) => {
            if (cancelled) return;
            if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) {
              const { width: w, height: h } = entry.boundingClientRect;
              observer.disconnect();
              observer = null;

              if (!cancelled) {
                asciiRef.current = await createAndInit(containerRef.current, w, h);
                if (!cancelled && asciiRef.current) {
                  asciiRef.current.load();
                }
              }
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(containerRef.current);
        return;
      }

      asciiRef.current = await createAndInit(containerRef.current, width, height);
      if (!cancelled && asciiRef.current) {
        asciiRef.current.load();

        ro = new ResizeObserver(entries => {
          if (!entries[0] || !asciiRef.current) return;
          const { width: w, height: h } = entries[0].contentRect;
          if (w > 0 && h > 0) {
            asciiRef.current.setSize(w, h);
          }
        });
        ro.observe(containerRef.current);
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (ro) ro.disconnect();
      if (asciiRef.current) {
        asciiRef.current.dispose();
        asciiRef.current = null;
      }
    };
  }, [text, asciiFontSize, textFontSize, textColor, planeBaseHeight, align]);

  return (
    <div
      ref={containerRef}
      className="ascii-text-container"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%'
      }}
    >
      <style>{`
        .ascii-text-container canvas {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          image-rendering: optimizeSpeed;
          image-rendering: -moz-crisp-edges;
          image-rendering: -o-crisp-edges;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }

        .ascii-text-container pre {
          margin: 0;
          user-select: none;
          padding: 0;
          line-height: 1em;
          text-align: left;
          position: absolute;
          left: 0;
          top: 0;
          /* White is the type. The brand colours sit either side of it as a
             two-tone shadow, matching the shader's fringe underneath. */
          color: #ffffff;
          text-shadow: -1px 0 rgba(34, 211, 238, 0.7), 1px 0 rgba(244, 114, 182, 0.7);
          z-index: 9;
          mix-blend-mode: normal;
        }
      `}</style>
    </div>
  );
}
