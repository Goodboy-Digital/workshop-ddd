import { Resource } from 'resource-loader';
import objParser from './objParser';

export default class ObjLoader {
  constructor(PIXI) {
    this.PIXI = PIXI;

    if (!PIXI.utils.GeometryCache) {
      PIXI.utils.GeometryCache = {};
    }

    if (!PIXI.MeshGeometry.from) {
      PIXI.MeshGeometry.from = function(name) {
        return PIXI.utils.GeometryCache[name];
      }
    }
  }

  useHook() {
    const PIXI = this.PIXI;

    return function(resource, next) {
      // create a new texture if the data is an Image object
      if (resource.data && resource.type === Resource.TYPE.TEXT) {
        const data = objParser(resource.data);
        const geometry = new PIXI.Geometry()
          .addAttribute('uv', flatten(data.coords, 2), 2)
          .addAttribute('position', flatten(data.positions), 3)
          .addAttribute('normals', flatten(data.normals), 3)
          .addIndex(new Uint16Array(data.indices));

        geometry.drawCalls = data.groups;
        resource.geometry = geometry;
        PIXI.utils.GeometryCache[resource.name] = geometry;
      }
      next();
    }
  }
}

//===================================

function flatten(array, size = 3) {
  const flat = new Float32Array(array.length * size);

  for (let i = 0; i < array.length; i++) {
    flat.set(array[i], i * size);
  }
  return flat;
}