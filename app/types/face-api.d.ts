declare module "face-api.js" {
  export namespace nets {
    export class TinyFaceDetector {
      static loadFromUri(uri: string): Promise<void>;
    }
    export class FaceLandmark68Net {
      static loadFromUri(uri: string): Promise<void>;
    }
  }

  export class TinyFaceDetectorOptions {
    constructor(options?: { inputSize?: number; scoreThreshold?: number });
  }

  export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface FaceDetection {
    box: Box;
    score: number;
  }

  export interface FaceLandmarks {
    getLeftEye(): Point[];
    getRightEye(): Point[];
  }

  export interface Point {
    x: number;
    y: number;
  }

  export function detectSingleFace(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    options: TinyFaceDetectorOptions
  ): Promise<FaceDetection | null>;

  export function detectFaceLandmarks(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    detection: FaceDetection
  ): Promise<FaceLandmarks>;
}

declare module "face-api.js/dist/face-api.min.js" {
  export namespace nets {
    export class tinyFaceDetector {
      static loadFromUri(uri: string): Promise<void>;
      static isLoaded: boolean;
    }
    export class faceLandmark68Net {
      static loadFromUri(uri: string): Promise<void>;
      static isLoaded: boolean;
    }
    export class faceLandmark68TinyNet {
      static loadFromUri(uri: string): Promise<void>;
      static isLoaded: boolean;
    }
  }

  export class TinyFaceDetectorOptions {
    constructor(options?: { inputSize?: number; scoreThreshold?: number });
  }

  export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface FaceDetection {
    box: Box;
    score: number;
  }

  export interface FaceLandmarks {
    getLeftEye(): Point[];
    getRightEye(): Point[];
  }

  export interface Point {
    x: number;
    y: number;
  }

  export function detectSingleFace(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    options: TinyFaceDetectorOptions
  ): Promise<FaceDetection | null>;

  export function detectFaceLandmarks(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    detection: FaceDetection
  ): Promise<FaceLandmarks>;
}
