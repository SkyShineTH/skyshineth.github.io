// Only the parts of Three.js the home page uses, so the rest is left out of the bundle.
// Rebuild with: npm run build:three
import {
  AdditiveBlending, BackSide, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color,
  CylinderGeometry, DoubleSide, EdgesGeometry, Float32BufferAttribute, FogExp2, GridHelper, Group, InstancedMesh,
  LineBasicMaterial, LineSegments, MathUtils, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, PlaneGeometry,
  Points, PointsMaterial, RepeatWrapping, SRGBColorSpace, Scene, ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial,
  TorusGeometry, Vector3, WebGLRenderer
} from 'three';
window.THREE = {
  AdditiveBlending, BackSide, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color,
  CylinderGeometry, DoubleSide, EdgesGeometry, Float32BufferAttribute, FogExp2, GridHelper, Group, InstancedMesh,
  LineBasicMaterial, LineSegments, MathUtils, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, PlaneGeometry,
  Points, PointsMaterial, RepeatWrapping, SRGBColorSpace, Scene, ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial,
  TorusGeometry, Vector3, WebGLRenderer
};
