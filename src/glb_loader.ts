import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export const gltf_loader = new GLTFLoader()
export const draco_loader = new DRACOLoader()
draco_loader.setDecoderConfig({ type: 'js' })
draco_loader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/') // use a full url path
gltf_loader.setDRACOLoader(draco_loader)