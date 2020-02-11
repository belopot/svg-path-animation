import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';


export default class Scene {
    constructor() {

        let self = this;

        this.container = document.getElementById('stage')

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x333333);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            alpha: true
        })

        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)


        var helper = new THREE.GridHelper(160, 5);
        helper.rotation.x = Math.PI / 2;
        this.scene.add(helper);


        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.set(0, 0, 160);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.screenSpacePanning = true;


        //Load svg
        this.svgLoader = new SVGLoader();
        this.svgLoader.load('svg/shape0.svg', function (data) {

            var paths = data.paths;
            var group = new THREE.Group();

            for (var i = 0; i < paths.length; i++) {

                var path = paths[i];

                //Fill Color for SVG
                var fillColor = path.userData.style.fill;

                if (fillColor !== undefined && fillColor !== 'none') {
                    var material = new THREE.MeshBasicMaterial({
                        color: new THREE.Color().setStyle(fillColor),
                        opacity: path.userData.style.fillOpacity,
                        transparent: path.userData.style.fillOpacity < 1,
                        side: THREE.DoubleSide,
                        depthWrite: false,
                        wireframe: false
                    });

                    var shapes = path.toShapes(true);

                    for (var j = 0; j < shapes.length; j++) {

                        var shape = shapes[j];

                        var geometry = new THREE.ShapeBufferGeometry(shape);
                        var mesh = new THREE.Mesh(geometry, material);

                        group.add(mesh);

                    }
                }

                //Stroke Color for SVG
                var strokeColor = path.userData.style.stroke;

                if (strokeColor !== undefined && strokeColor !== 'none') {

                    var material = new THREE.MeshBasicMaterial({
                        color: new THREE.Color().setStyle(strokeColor),
                        opacity: path.userData.style.strokeOpacity,
                        transparent: path.userData.style.strokeOpacity < 1,
                        side: THREE.DoubleSide,
                        depthWrite: false,
                        wireframe: false
                    });

                    for (var j = 0, jl = path.subPaths.length; j < jl; j++) {

                        var subPath = path.subPaths[j];

                        var geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);

                        if (geometry) {

                            var mesh = new THREE.Mesh(geometry, material);

                            group.add(mesh);

                        }

                    }

                }
            }


            group.scale.y = -1;

            var bbox = new THREE.Box3().setFromObject(group);

            var center = new THREE.Vector3((bbox.max.x - bbox.min.x) / 2, (bbox.max.y - bbox.min.y) / 2, (bbox.max.z - bbox.min.z) / 2);

            if (center.x === Infinity || center.y === Infinity || center.z === Infinity) {
                center = new THREE.Vector3(0, 0, 0);
            }

            group.position.set(-center.x, center.y, -center.z);

            

            var pivot = new THREE.Group();
            pivot.add(group);

            self.scene.add(pivot);

        })


        window.addEventListener('resize', ev => {
            this.onResize()
        }, false);


        this.update();

    }


    update() {
        if (this.renderer === undefined)
            return

        requestAnimationFrame(this.update.bind(this))

        this.renderer.render(this.scene, this.camera)
    }

    onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateMatrixWorld();
    }


}
