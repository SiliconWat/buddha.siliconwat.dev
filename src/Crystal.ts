import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import crystal from "url:./assets/crystal.3b.glb";

export class Crystal3B {
    private readonly isDesktop = window.matchMedia("(pointer: fine)").matches;
    private readonly isAndroid = /android/i.test(navigator.userAgent);
    private readonly rotationSpeed = this.isAndroid ? 0.1 : 0.01;
    private readonly interval = 1500; // 1.5 seconds for sparkle

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private controls!: OrbitControls;
    private loader = new GLTFLoader();
    private model?: THREE.Object3D;
    private canvas: HTMLCanvasElement;

    private logicalSize =
        (this.isDesktop ? window.innerHeight : window.innerWidth) || 300; // same as gif
    private animationFrameId: number | null = null;
    private isAnimating = false; // panning
    private isBeating = false; // rotating
    private lastTime = 0;

    public isRainbow = true;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    async init(logicalSize: number | null = null) {
        this.logicalSize = logicalSize || this.logicalSize;
        await this.initScene(); // Ensure initScene completes
        await this.loadModel(crystal).catch((error) => {
            console.error("Error loading model: ", error);
        });
        window.addEventListener("resize", this.handleResize);
    }

    private handleResize = () => {
        const width = this.logicalSize;
        const height = this.logicalSize;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    startAnimation(isBeating: boolean) {
        this.isBeating = isBeating;
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animationFrameId = requestAnimationFrame(this.animate);
        }
    }

    stopAnimation() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            this.isAnimating = false;
        }
    }

    private async initScene() {
        const width = this.logicalSize;
        const height = this.logicalSize;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = null;

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            1000
        );
        this.camera.position.set(0, 1, 3);

        // Enhanced Lighting for diamond sparkle
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight1.position.set(5, 10, 7.5);
        directionalLight1.castShadow = true;
        directionalLight1.shadow.mapSize.width = 2048;
        directionalLight1.shadow.mapSize.height = 2048;

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight2.position.set(-5, 8, -5);

        const pointLight = new THREE.PointLight(0xffffff, 1.5, 50);
        pointLight.position.set(2, 3, 2);

        this.scene.add(
            ambientLight,
            directionalLight1,
            directionalLight2,
            pointLight
        );

        // Renderer with transparency and shadows
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        // Orbit Controls with auto-rotate
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 1.5;
        this.controls.update();
    }

    private loadModel(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    this.model = gltf.scene;

                    // Enable shadows and apply diamond-like material
                    this.model.traverse((node) => {
                        if ((node as THREE.Mesh).isMesh) {
                            const mesh = node as THREE.Mesh;
                            mesh.castShadow = true;
                            mesh.receiveShadow = true;

                            // Create diamond-like material
                            const diamondMaterial =
                                new THREE.MeshPhysicalMaterial({
                                    color: 0xffffff,
                                    metalness: 1,
                                    roughness: 0.5,
                                    transmission: 0.95,
                                    ior: 2.4, // Diamond index of refraction
                                    specularIntensity: 1.0,
                                    envMap: new THREE.Texture(),
                                    envMapIntensity: 1.5,
                                    clearcoat: 1.0,
                                    clearcoatRoughness: 0.0,
                                    thickness: 0.5
                                });

                            mesh.material = diamondMaterial;
                        }
                    });

                    // Center the model
                    const box = new THREE.Box3().setFromObject(this.model);
                    const size = box.getSize(new THREE.Vector3()).length();
                    const center = box.getCenter(new THREE.Vector3());

                    this.model.position.sub(center);
                    this.model.scale.setScalar(0.7);

                    const scaledBox = new THREE.Box3().setFromObject(
                        this.model
                    );
                    const scaledCenter = scaledBox.getCenter(
                        new THREE.Vector3()
                    );
                    this.model.position.sub(scaledCenter);

                    // Auto-fit camera
                    const distance = size * 0.5; // change size of heart here: smaller number => bigger heart
                    this.camera.position.set(0, 0, distance);
                    this.camera.near = size / 100;
                    this.camera.far = size * 10;
                    this.camera.updateProjectionMatrix();

                    this.controls.target.set(0, 0, 0);
                    this.controls.update();

                    // Offset model: bc of rotation
                    this.model.position.x -= 3; // move left
                    this.model.position.y -= 3; // move down

                    this.scene.add(this.model);
                    resolve();
                },
                (progress) => {
                    // console.log(
                    //     `Loading progress: ${
                    //         (progress.loaded / progress.total) * 100
                    //     }%`
                    // );
                },
                (error) => {
                    console.error("Failed to load GLB:", error);
                    reject(error);
                }
            );
        });
    }

    public setKarat(color: string | number) {
        if (!this.model) return;

        this.model.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
                const mesh = node as THREE.Mesh;
                if (mesh.material instanceof THREE.MeshPhysicalMaterial) {
                    const material =
                        mesh.material as THREE.MeshPhysicalMaterial;
                    material.color.set(color);
                    material.emissive = new THREE.Color(color).multiplyScalar(
                        0.1
                    );
                    material.envMap = new THREE.Texture();
                    material.envMapIntensity = 1.5;
                    material.transmission = 0.95;
                    material.ior = 2.4;
                    material.specularIntensity = 1.0;
                    material.clearcoat = 1.0;
                    material.clearcoatRoughness = 0.0;
                }
            }
        });
    }

    private animate = (time: number): void => {
        if (time - this.lastTime >= this.interval) {
            if (this.isRainbow) this.setKarat(this.getRandomColor());
            this.lastTime = time;

            // Subtle sparkle with light intensity variation
            const pointLight = this.scene.children.find(
                (child) => child instanceof THREE.PointLight
            ) as THREE.PointLight | undefined;
            if (pointLight) {
                pointLight.intensity = 1.5 + Math.sin(time * 0.002) * 0.2;
            }
        }
        if (this.model)
            this.model.rotation.y -= this.isBeating ? this.rotationSpeed : 0;
        if (this.isBeating) this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(this.animate);
    };

    private getRandomColor(): string {
        const hex = Math.floor(Math.random() * 0xffffff).toString(16);
        return `#${hex.padStart(6, "0")}`;
    }

    public async exportModel(format: "glb" | "usdz"): Promise<void> {
        if (!this.model) {
            console.error("Model is not loaded, cannot export.");
            return;
        }

        switch (format) {
            case "glb":
                this.exportGLB();
                break;
            case "usdz":
                await this.exportUSDZ();
                break;
            default:
                console.error(`Unsupported export format: ${format}`);
        }
    }

    private exportGLB() {
        if (!this.model) return;
        const exporter = new GLTFExporter();

        exporter.parse(
            this.model,
            (result) => {
                if (result instanceof ArrayBuffer) {
                    this.downloadFile(
                        result,
                        "crystal.3B.glb",
                        "model/gltf-binary"
                    );
                } else {
                    // Fallback for older versions or JSON-based GLTF
                    const output = JSON.stringify(result, null, 2);
                    this.downloadFile(
                        output,
                        "crystal.3B.gltf",
                        "model/gltf+json"
                    );
                }
            },
            (error) => {
                console.error("An error happened during GLB export: ", error);
            },
            { binary: true } // Key option to export as a single .glb file
        );
    }

    private exportUSDZ() {
        //TODO: later see Crystal2.ts
    }

    /**
     * Triggers a browser download for the provided data.
     * @param data The file content (ArrayBuffer, Uint8Array, or string).
     * @param filename The name of the file to be downloaded.
     * @param mimeType The MIME type of the file.
     */
    private async downloadFile(
        data: BlobPart,
        filename: string,
        mimeType: string
    ) {
        const blob = new Blob([data], { type: mimeType });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Clean up
        // URL.revokeObjectURL(a.href);
        // document.body.removeChild(a);
        setTimeout(() => {
            URL.revokeObjectURL(a.href);
            document.body.removeChild(a);
        }, 100);
    }
}
