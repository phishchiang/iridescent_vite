import './style.css'
import { WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera, ShaderMaterial, PlaneGeometry, Mesh, DoubleSide, Vector2, Vector4, Color, TextureLoader, NearestFilter, Texture, WebGLRenderTarget, LinearFilter, RGBAFormat, Raycaster} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gltf_loader } from "./glb_loader"
import { Debug } from "./Debug"

import iridescent_vs from './shader/iridescent_vs.vert?raw'
import iridescent_fs from './shader/iridescent_fs.frag?raw'
import T_monkey_N_url from "./img/T_monkey_N.png?url"
import MSH_Monkey_url from "./model/MSH_Monkey.glb?url"

import colors from 'nice-color-palettes'
let color_index = Math.floor(Math.random() * colors.length)
// color_index = 18;
let palette : string[] = colors[color_index]; // Array of 5 colors 

let palette_THREE = palette.map((color) => new Color(color))

export class Sketch {
  private renderer: WebGLRenderer
  private scene_iridescent: Scene
  private container: HTMLElement
  private width: number
  private height: number
  private camera: PerspectiveCamera
  private controls: OrbitControls
  private time: number
  private imageAspect: number
  private isPlaying: boolean
  private mat_iridescent: ShaderMaterial
  private geo_plane: PlaneGeometry
  private msh_plane: Mesh
  private debug: Debug
  private msh_monkey: Mesh
  private loaded_map_monkey_N: Texture
  private render_target_01: WebGLRenderTarget
  private raycaster: Raycaster
  private pointer: Vector2

  constructor(options: { dom: HTMLElement }) {
    this.scene_iridescent = new Scene()
    this.container = options.dom
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer = new WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.physicallyCorrectLights = true
    this.render = this.render.bind(this)
    this.imageAspect = 1
    this.debug = new Debug()

    this.raycaster = new Raycaster()
    this.pointer = new Vector2()

    this.container.appendChild(this.renderer.domElement)

    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    )

    this.camera.position.set(0, 0, 3)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.panSpeed = 0
    this.controls.minDistance = 2
    this.controls.maxDistance = 12

    this.time = 0
    this.isPlaying = true

    this.addObjects_monkey()
    this.resize()
    this.render()
    this.setupEvent()
    this.clickEvent()
  }

  clickEvent() {
    window.addEventListener('click', (event) => {
      event.preventDefault()

      this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      console.log(this.pointer)

      this.raycaster.setFromCamera( this.pointer, this.camera )
      const intersects = this.raycaster.intersectObjects( this.scene_iridescent.children ); 
      if (intersects.length > 0) {
        color_index = Math.floor(Math.random() * colors.length)
        // console.log(color_index);
  
        palette = colors[color_index]; // Array of 5 colors
        palette_THREE = palette.map((color) => new Color(color));
  
        // this.mat_iridescent  u_color: { value: palette },
        this.mat_iridescent.uniforms.u_color.value = palette_THREE;
      }
    })
  }


  setupEvent() {
    window.addEventListener("resize", this.resize.bind(this))
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.camera.aspect = this.width / this.height

    this.camera.updateProjectionMatrix()
  }

  addObjects_monkey() {
    let that = this

    this.loaded_map_monkey_N = new TextureLoader().load(T_monkey_N_url, texture => {
      texture.minFilter = NearestFilter
    })

    this.mat_iridescent = new ShaderMaterial({
      side: DoubleSide,
      uniforms: {
        time: { value: 0 },
        u_color: { value: palette_THREE },
        u_fresnel_speed: { value: 0.1 },
        u_fresnel_tile: { value: 2.0 },
        u_map_monkey_N : { value: this.loaded_map_monkey_N},
        resolution: { value: new Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: iridescent_vs,
      fragmentShader: iridescent_fs
    })

    // this.geo_plane = new PlaneGeometry(1, 1, 10, 10)
    // this.msh_plane = new Mesh(this.geo_plane, this.mat_iridescent)
    gltf_loader.load(MSH_Monkey_url, glb => {
      this.msh_monkey = glb.scenes[0].children[0] as Mesh
      this.msh_monkey.traverse(o=>{
        if(o instanceof Mesh){
          o.material = this.mat_iridescent;
        }
      })
      this.scene_iridescent.add(this.msh_monkey)
    })
    
    // this.scene_iridescent.add(this.msh_plane)
  }

  stop() {
    this.isPlaying = false
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true
    }
  }

  render() {
    if (!this.isPlaying) return
    this.controls.update()
    this.time += 0.05
    this.mat_iridescent.uniforms.time.value = this.time
    // this.mat_iridescent.uniforms.progress.value = this.debug.settings.progress
    this.mat_iridescent.uniforms.u_fresnel_speed.value = this.debug.settings.u_fresnel_speed
    this.mat_iridescent.uniforms.u_fresnel_tile.value = this.debug.settings.u_fresnel_tile
    requestAnimationFrame(this.render)
    
    this.renderer.render(this.scene_iridescent, this.camera)
  }
}

new Sketch({
  dom: document.getElementById("app")!
})