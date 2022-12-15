import './style.css'
import { WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera, ShaderMaterial, PlaneGeometry, Mesh, DoubleSide, Vector2, Vector4, Color, TextureLoader, NearestFilter, Texture, WebGLRenderTarget, LinearFilter, RGBAFormat, Raycaster} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gltf_loader } from "./glb_loader"
import { Debug } from "./Debug"

import render_target_01_vs from './shader/render_target_01_vs.vert?raw'
import render_target_01_fs from './shader/render_target_01_fs.frag?raw'
import render_target_02_vs from './shader/render_target_02_vs.vert?raw'
import render_target_02_fs from './shader/render_target_02_fs.frag?raw'
import T_monkey_N_url from "./img/T_monkey_N.png?url";
import MSH_Monkey_url from "./model/MSH_Monkey.glb?url"

import colors from 'nice-color-palettes'
let color_index = Math.floor(Math.random() * colors.length)
// color_index = 18;
let palette : string[] = colors[color_index]; // Array of 5 colors 

let palette_THREE = palette.map((color) => new Color(color))

export class Sketch {
  private renderer: WebGLRenderer
  private scene_render_target_01: Scene
  private scene_fianl_render: Scene
  private container: HTMLElement
  private width: number
  private height: number
  private camera_fianl_render: PerspectiveCamera
  private camera_render_target_01: OrthographicCamera
  private controls: OrbitControls
  private time: number
  private imageAspect: number
  private isPlaying: boolean
  private mat_render_target_01: ShaderMaterial
  private mat_final_render: ShaderMaterial
  private geo_plane: PlaneGeometry
  private msh_plane: Mesh
  private debug: Debug
  private msh_monkey: Mesh
  private loaded_map_monkey_N: Texture
  private render_target_01: WebGLRenderTarget
  private raycaster: Raycaster
  private pointer: Vector2

  constructor(options: { dom: HTMLElement }) {
    this.scene_render_target_01 = new Scene()
    this.scene_fianl_render = new Scene()
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

    let frustumSize = 1;
    let aspect = window.innerWidth / window.innerHeight;
    this.camera_render_target_01 = new OrthographicCamera( frustumSize / - 2, frustumSize / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    

    this.camera_fianl_render = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    )

    this.camera_fianl_render.position.set(0, 0, 3)
    this.controls = new OrbitControls(this.camera_fianl_render, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.panSpeed = 0
    this.controls.minDistance = 2
    this.controls.maxDistance = 12

    this.time = 0
    this.isPlaying = true

    this.addObjects_render_target_01()
    this.addObjects_fianl_render()
    this.resize()
    this.render()
    this.setupEvent()
    this.clickEvent()
  }

  clickEvent() {
    window.addEventListener('click', (event) => {
      event.preventDefault();

      this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      console.log(this.pointer)

      this.raycaster.setFromCamera( this.pointer, this.camera_fianl_render )
      const intersects = this.raycaster.intersectObjects( this.scene_fianl_render.children ); 
      if (intersects.length > 0) {
        color_index = Math.floor(Math.random() * colors.length)
        // console.log(color_index);
  
        palette = colors[color_index]; // Array of 5 colors
        palette_THREE = palette.map((color) => new Color(color));
  
        // this.mat_render_target_01  u_color: { value: palette },
        this.mat_render_target_01.uniforms.u_color.value = palette_THREE;
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
    this.camera_fianl_render.aspect = this.width / this.height

    this.camera_fianl_render.updateProjectionMatrix()
  }

  addObjects_render_target_01() {
    let that = this
    this.mat_render_target_01 = new ShaderMaterial({
      side: DoubleSide,
      uniforms: {
        time: { value: 0 },
        u_color: { value: palette_THREE },
        u_fresnel_speed: { value: 0.1 },
        u_fresnel_tile: { value: 2.0 },
        resolution: { value: new Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: render_target_01_vs,
      fragmentShader: render_target_01_fs
    })

    this.geo_plane = new PlaneGeometry(1, 1, 10, 10)
    this.msh_plane = new Mesh(this.geo_plane, this.mat_render_target_01)
    this.scene_render_target_01.add(this.msh_plane)
  }

  addObjects_fianl_render() {
    let that = this;

    this.loaded_map_monkey_N = new TextureLoader().load(T_monkey_N_url, texture => {
      texture.minFilter = NearestFilter
    })

    this.render_target_01 = new WebGLRenderTarget(this.width, this.height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat
    })
    
    this.mat_final_render = new ShaderMaterial({
      side: DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new Vector4() },
        u_render_target_01 : { value: null },
        u_map_monkey_N : { value: this.loaded_map_monkey_N},
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: render_target_02_vs,
      fragmentShader: render_target_02_fs
    });

    gltf_loader.load(MSH_Monkey_url, glb => {
      this.msh_monkey = glb.scenes[0].children[0] as Mesh
      this.msh_monkey.traverse(o=>{
        if(o instanceof Mesh){
          o.material = this.mat_final_render;
        }
      })
      this.scene_fianl_render.add(this.msh_monkey)
    })
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
    this.mat_render_target_01.uniforms.time.value = this.time
    // this.mat_render_target_01.uniforms.progress.value = this.debug.settings.progress
    this.mat_render_target_01.uniforms.u_fresnel_speed.value = this.debug.settings.u_fresnel_speed
    this.mat_render_target_01.uniforms.u_fresnel_tile.value = this.debug.settings.u_fresnel_tile
    requestAnimationFrame(this.render)
    
    // // Comment out for testing 1st render
    // this.renderer.render(this.scene_render_target_01, this.camera_render_target_01);

    // Render Target 01
    this.renderer.setRenderTarget(this.render_target_01);
    this.renderer.render(this.scene_render_target_01, this.camera_render_target_01);
    this.mat_final_render.uniforms.u_render_target_01.value = this.render_target_01.texture;

    // Final Render
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene_fianl_render, this.camera_fianl_render);
  }
}

new Sketch({
  dom: document.getElementById("app")!
})