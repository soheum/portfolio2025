declare module 'three/addons/loaders/SVGLoader.js' {
  export { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
}

declare module 'three/addons/environments/RoomEnvironment.js' {
  import { Scene } from 'three';

  export class RoomEnvironment extends Scene {}
}
