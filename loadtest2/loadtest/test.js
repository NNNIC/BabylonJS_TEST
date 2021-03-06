var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Util;
(function (Util) {
    var StateControl = (function () {
        function StateControl() {
        }
        StateControl.prototype.Goto = function (state) {
            this.m_nextstate = state;
        };
        StateControl.prototype.Update = function () {
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
        };
        return StateControl;
    }());
    Util.StateControl = StateControl;
    var StateItem = (function () {
        function StateItem() {
        }
        return StateItem;
    }());
    Util.StateItem = StateItem;
    var StateSequencer = (function () {
        function StateSequencer() {
            this.m_list = new Array();
            this.m_elapsed = 0;
            this.m_cur = null;
            this.m_next = null;
        }
        StateSequencer.prototype.Command = function (state, p1, p2, p3, p4) {
            if (p1 === void 0) { p1 = null; }
            if (p2 === void 0) { p2 = null; }
            if (p3 === void 0) { p3 = null; }
            if (p4 === void 0) { p4 = null; }
            var i = new StateItem();
            i.self = this;
            i.state = state;
            i.p1 = p1;
            i.p2 = p2;
            i.p3 = p3;
            i.p4 = p4;
            this.m_list.push(i);
        };
        StateSequencer.prototype.Update = function (dt) {
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
        };
        StateSequencer.prototype.Done = function () {
            this.m_cur = null;
        };
        return StateSequencer;
    }());
    Util.StateSequencer = StateSequencer;
})(Util || (Util = {}));
var Sandbox;
(function (Sandbox) {
    var MainClass = (function (_super) {
        __extends(MainClass, _super);
        function MainClass() {
            _super.apply(this, arguments);
        }
        MainClass.prototype.Start = function (canvas) {
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
        };
        MainClass.prototype.runRenderLoop = function () {
            var _this = this;
            this.m_engine.runRenderLoop(function () {
                _this.Update(_this.m_engine.getDeltaTime());
                _this.m_scene.render();
            });
        };
        //コマンド発行
        MainClass.prototype.IssueCommands = function (p) {
            var self = p;
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
        };
        // State
        MainClass.prototype.S_IDLE = function (t, i) {
            var p1 = i.p1;
            if (t == 0) {
                console.log("S_IDLE Initiallize");
            }
            else {
                console.log("S_IDLE Running : " + t);
                if (t > p1) {
                    i.self.Done();
                }
            }
        };
        MainClass.prototype.S_LOAD = function (t, i) {
            var self = i.self;
            if (t == 0) {
                this.bOk = false;
                BABYLON.SceneLoader.Load("./", "egw.babylon", self.m_engine, function (scene) {
                    self.m_scene = scene;
                    self.bOk = true;
                });
            }
            else {
                if (self.bOk) {
                    self.Done();
                }
            }
        };
        MainClass.prototype.S_CREATE_BASIC_SCENE = function (t, i) {
            var self = i.self;
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
        };
        //マテリアルカラーのテスト
        MainClass.prototype.S_CREATE_BASIC_SCENE2 = function (t, i) {
            var self = i.self;
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
                var mat2 = self.m_mesh.material;
                mat2.diffuseColor = new BABYLON.Color3(t % 1, 0, 0);
                self.m_mesh.material = mat2;
            }
        };
        MainClass.prototype.S_CREATE_PLANE_AND_LOAD_TEXTURE = function (t, i) {
            var self = i.self;
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
        };
        //スプライトテスト
        MainClass.prototype.S_SPlITE_TEST = function (t, i) {
            var self = i.self;
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
        };
        MainClass.prototype.S_TEXT_TEST = function (t, i) {
            var self = i.self;
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
                var mat = self.m_outputplane.material;
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
        };
        MainClass.prototype.S_DONE = function (t, i) {
            var self = i.self;
            if (t == 0) {
                self.IssueCommands(self);
                self.Done();
            }
        };
        return MainClass;
    }(Util.StateSequencer));
    Sandbox.MainClass = MainClass;
})(Sandbox || (Sandbox = {}));
//# sourceMappingURL=test.js.map