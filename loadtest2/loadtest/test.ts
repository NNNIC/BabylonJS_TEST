module Util {
    export class StateControl {
        m_curstate: any;
        m_nextstate: any;

        public Goto(state: any) {
            this.m_nextstate = state;
        }
        public Update() {
            if (this.m_nextstate != null) {
                this.m_curstate = this.m_nextstate;
                this.m_nextstate = null;
                this.m_curstate(true);
            }
            else {
                if (this.m_curstate != null) {
                    this.m_curstate(false);
                }
            }
        }
    }

    export class StateItem {
        self: any;  // ※this対策
        state: any;
        p1: any;
        p2: any;
        p3: any;
        p4: any;
    }
    export class StateSequencer {

        private m_list: Array<StateItem>;
        private m_elapsed: number;
        private m_cur:  StateItem;
        private m_next: StateItem;

        constructor() {
            this.m_list = new Array<StateItem>();
            this.m_elapsed = 0;
            this.m_cur  = null;
            this.m_next = null;
        }

        public Command(
            state: any,
            p1: any = null,
            p2: any = null,
            p3: any = null,
            p4: any = null
        ):void {
            var i = new StateItem();
            i.self = this;
            i.state = state;
            i.p1 = p1;
            i.p2 = p2;
            i.p3 = p3;
            i.p4 = p4;
            this.m_list.push(i);
        }

        public Update(dt: number) {
            this.m_elapsed += dt / 1000;

            if (this.m_cur == null) {
                if (this.m_list.length > 0) {
                    this.m_next = this.m_list.shift();
                }
            }
            if (this.m_next != null) {
                this.m_cur = this.m_next;
                this.m_next = null;
                this.m_elapsed = 0;
            }
            if (this.m_cur != null) {
                var i = this.m_cur;
                if (i.state != null) {
                    i.state(this.m_elapsed, i);
                }
            }
        }

        public Done(): void {
            this.m_cur = null;
        }
    }
}

module Sandbox {

    export class MainClass extends Util.StateSequencer {

        public m_canvas: HTMLCanvasElement;
        public m_engine: BABYLON.Engine;
        public m_scene: BABYLON.Scene;
        public m_camera: BABYLON.TargetCamera;
        public m_mesh: BABYLON.Mesh;

        public Start(canvas: HTMLCanvasElement): void {
            this.m_canvas = canvas;
            this.m_engine = new BABYLON.Engine(canvas, true);
            this.m_scene = new BABYLON.Scene(this.m_engine);
            this.m_scene.clearColor = new BABYLON.Color3(56 / 256, 87 / 256, 145 / 256);
            this.m_camera = new BABYLON.ArcRotateCamera("camera1", 0, 0.8, 100, BABYLON.Vector3.Zero(), this.m_scene);
            this.m_camera.attachControl(canvas);
            var mesh = BABYLON.Mesh.CreateBox("box01", 50, this.m_scene);
            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.m_scene);

            this.m_engine.enableOfflineSupport = false;

            this.IssueCommands(this);
        }
        public runRenderLoop(): void {
            this.m_engine.runRenderLoop(() => {
                this.Update(this.m_engine.getDeltaTime());
                this.m_scene.render();
            });
        }

        //コマンド発行
        private IssueCommands(p: any): void {
            var self: MainClass = p;
            self.Command(self.S_IDLE, 2);
            self.Command(self.S_TEXT_TEST);
            //self.Command(self.S_IDLE, 5);
            self.Command(self.S_SPlITE_TEST);
            self.Command(self.S_IDLE, 5);
            self.Command(self.S_CREATE_PLANE_AND_LOAD_TEXTURE);
            self.Command(self.S_IDLE, 5);
            self.Command(self.S_CREATE_BASIC_SCENE2);
            self.Command(self.S_IDLE, 5);
            self.Command(self.S_LOAD);
            self.Command(self.S_IDLE, 5);
            self.Command(self.S_DONE);
        }

        // State
        private S_IDLE(t: number, i: Util.StateItem): void {
            var p1: number = i.p1;
            if (t == 0) {
                console.log("S_IDLE Initiallize");
            }
            else {
                console.log("S_IDLE Running : " + t);
                if (t > p1) {
                    i.self.Done();
                }
            }
        }

        private bOk: boolean;
        private S_LOAD(t: number, i: Util.StateItem): void {
            var self: MainClass = i.self;
            if (t == 0) {
                this.bOk = false;
                BABYLON.SceneLoader.Load("./", "egw.babylon", self.m_engine,
                    (scene: BABYLON.Scene) => {
                        self.m_scene = scene;
                        self.bOk = true;
                    }
                );
            }
            else {
                if (self.bOk) {
                    self.Done();
                }
            }
        }

        private S_CREATE_BASIC_SCENE(t: number, i: Util.StateItem): void {
            var self: MainClass = i.self;
            if (t == 0) {
                self.m_scene = new BABYLON.Scene(self.m_engine);
                self.m_scene.clearColor = new BABYLON.Color3(56 / 256, 87 / 256, 145 / 256);
                self.m_camera = new BABYLON.ArcRotateCamera("camera1", 0, 0.8, 100, BABYLON.Vector3.Zero(), self.m_scene);
                self.m_camera.attachControl(self.m_canvas);
                var mesh = BABYLON.Mesh.CreateBox("box01", 50, self.m_scene);
                var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), self.m_scene);
            }
            else {
                self.Done();
            }
        }
        //マテリアルカラーのテスト
        private S_CREATE_BASIC_SCENE2(t: number, i: Util.StateItem): void {
            var self: MainClass = i.self;
            if (t == 0) {
                self.m_scene = new BABYLON.Scene(self.m_engine);
                self.m_scene.clearColor = new BABYLON.Color3(56 / 256, 87 / 256, 145 / 256);
                self.m_camera = new BABYLON.ArcRotateCamera("camera1", 0, 0.8, 100, BABYLON.Vector3.Zero(), self.m_scene);
                self.m_camera.attachControl(self.m_canvas);
                self.m_mesh = BABYLON.Mesh.CreateSphere("sphere01", 10, 50, self.m_scene);
                var mat = new BABYLON.StandardMaterial("mat1", self.m_scene);
                mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
                self.m_mesh.material = mat;
                var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), self.m_scene);
            }
            else {
                if (t > 10) {
                    self.Done();
                }
                var mat2: BABYLON.StandardMaterial = <BABYLON.StandardMaterial>self.m_mesh.material;
                mat2.diffuseColor = new BABYLON.Color3(t % 1, 0, 0);
                self.m_mesh.material = mat2;
            }
        }

        private S_CREATE_PLANE_AND_LOAD_TEXTURE(t: number, i: Util.StateItem): void {
            var self: MainClass = i.self;
            if (t == 0) {
                self.m_scene = new BABYLON.Scene(self.m_engine);
                self.m_scene.clearColor = new BABYLON.Color3(56 / 256, 87 / 256, 145 / 256);
                self.m_camera = new BABYLON.ArcRotateCamera("camera1", 0, 0.8, 100, BABYLON.Vector3.Zero(), self.m_scene);
                self.m_camera.attachControl(self.m_canvas);

                var mat = new BABYLON.StandardMaterial("planeMaterial", self.m_scene);
                var tex = new BABYLON.Texture("assets/floor.png", self.m_scene);
                //var tex2 = new BABYLON.Texture("assets/floor_normal.png", self.m_scene);
                tex.uScale = tex.vScale = 5;
                //tex2.uScale = tex2.vScale = 5;
                //tex3.uScale = tex3.vScale = 5;
               
                mat.diffuseTexture = tex;
                //mat.bumpTexture = tex2;
                //mat.specularTexture = tex3;
                mat.fogEnabled = false;

                var plane = BABYLON.Mesh.CreatePlane("plane", 150, self.m_scene);
                plane.material = mat;
                plane.position.y -= 5;
                plane.rotation.x = Math.PI / 2;
               
                self.m_mesh = plane;

                var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), self.m_scene);
            }
            else {
                self.Done();
            }

        }

        //スプライトテスト
        private S_SPlITE_TEST(t: number, i: Util.StateItem): void {
            var self: MainClass = i.self;
            if (t == 0) {
                self.m_scene = new BABYLON.Scene(self.m_engine);
                self.m_scene.clearColor = new BABYLON.Color3(56 / 256, 87 / 256, 145 / 256);

                // Create camera and light
                var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(5, 10, 5), self.m_scene);
                var camera = new BABYLON.ArcRotateCamera("Camera", 1, 0.8, 8, new BABYLON.Vector3(0, 0, 0), self.m_scene);
                camera.attachControl(self.m_canvas, true);

                // Create a sprite manager to optimize GPU ressources
                // Parameters : name, imgUrl, capacity, cellSize, scene
                var spriteManagerTrees = new BABYLON.SpriteManager("treesManager", "assets/palm.png", 2000, 800, self.m_scene);

                //We create 2000 trees at random positions
                for (var n = 0; n < 2000; n++) {
                    var tree = new BABYLON.Sprite("tree", spriteManagerTrees);
                    tree.position.x = Math.random() * 100 - 50;
                    tree.position.z = Math.random() * 100 - 50;
                    tree.isPickable = true;

                    //Some "dead" trees
                    if (Math.round(Math.random() * 5) === 0) {
                        tree.angle = Math.PI * 90 / 180;
                        tree.position.y = -0.3;
                    }
                }

                //Create a manager for the player's sprite animation
                var spriteManagerPlayer = new BABYLON.SpriteManager("playerManager", "assets/player.png", 2, 64, self.m_scene);

                // First animated player
                var player = new BABYLON.Sprite("player", spriteManagerPlayer);
                player.playAnimation(0, 40, true, 100);
                player.position.y = -0.3;
                player.size = 0.3;
                player.isPickable = true;

                // Second standing player
                var player2 = new BABYLON.Sprite("player2", spriteManagerPlayer);
                player2.stopAnimation(); // Not animated
                player2.cellIndex = 2; // Going to frame number 2
                player2.position.y = -0.3;
                player2.position.x = 1;
                player2.size = 0.3;
                player2.invertU = -1; //Change orientation
                player2.isPickable = true;


                // Picking
                spriteManagerTrees.isPickable = true;
                spriteManagerPlayer.isPickable = true;

                self.m_scene.onPointerDown = function (evt) {
                    var pickResult = self.m_scene.pickSprite(this.pointerX, this.pointerY);
                    if (pickResult.hit) {
                        pickResult.pickedSprite.angle += 0.5;
                    }
                };
            }
            else {
                self.Done();
            }
        }

        //テキストテスト
        private m_outputplane: BABYLON.Mesh;
        private m_outputplaneTexture: BABYLON.DynamicTexture;
        private S_TEXT_TEST(t: number, i: Util.StateItem): void {
            var self: MainClass = i.self;
            if (t == 0) {
                self.m_scene = new BABYLON.Scene(self.m_engine);
                self.m_scene.clearColor = new BABYLON.Color3(56 / 256, 87 / 256, 145 / 256);
                self.m_camera = new BABYLON.ArcRotateCamera("camera1", 0, 0.8, 100, BABYLON.Vector3.Zero(), self.m_scene);
                self.m_camera.attachControl(self.m_canvas);

                self.m_outputplane = BABYLON.Mesh.CreatePlane("outputplane", 25, self.m_scene, false);
                self.m_outputplane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
                self.m_outputplane.material = new BABYLON.StandardMaterial("outputplane", self.m_scene);
                self.m_outputplane.position = new BABYLON.Vector3(-25, 15, 25);
                self.m_outputplane.scaling.y = 0.4;

                self.m_outputplaneTexture = new BABYLON.DynamicTexture("dynamic texture", 512, self.m_scene, true);
                var mat = <BABYLON.StandardMaterial>self.m_outputplane.material;
                mat.diffuseTexture = self.m_outputplaneTexture;
                mat.specularColor = new BABYLON.Color3(0, 0, 0);
                mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
                mat.backFaceCulling = false;
                self.m_outputplane.material = mat;
                self.m_outputplaneTexture.drawText("alpha", null, 140, "bold 140px verdana", "white", "#0000AA");

                var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), self.m_scene);
            }
            else {
                var context2D = self.m_outputplaneTexture.getContext();
                context2D.clearRect(0, 200, 512, 512);
                var t2 = Math.floor(t * 1000);
                self.m_outputplaneTexture.drawText(t2.toString(), null, 380, "140px verdana", "white", null);
                if (t > 10) {
                    self.Done();
                }
            }
        }


        private S_DONE(t: number, i: Util.StateItem): void {
            var self: MainClass = i.self;
            if (t == 0) {
                self.IssueCommands(self);
                self.Done();
            }
        }

    }
}