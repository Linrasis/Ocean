//------------------------ setting part -------------------------
//scene
    var scene = new THREE.Scene();
//canvas size
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
//fog
    //scene.fog = new THREE.Fog(0xf7d9aa, 10, 50);
//camera
    var camera = new THREE.PerspectiveCamera( 75, canvasWidth/canvasHeight, 0.1, 5000 );
    camera.position.z = 15;
    camera.position.y = 2;
//renderer
    var renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setSize( canvasWidth, canvasHeight );
    var container = document.getElementById("world");
    container.appendChild( renderer.domElement );
//FPS panel [come from 'https://github.com/mrdoob/stats.js#readme']
    var stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    container.appendChild( stats.dom );
//Clock
    var clock = new THREE.Clock();
//controler
    //var controler = new THREE.TrackballControls(camera, renderer.domElement);
    //controler.target.set(0,0,0);
//hide scroll bar & resize listener
    document.body.style.overflow = 'hidden';
    window.addEventListener('resize', windowResize, false);

//colors
var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

var delta, ocean, yueSun, yuePoints, yueCloud;

//------------------------ core part -------------------------

window.addEventListener('load', init, false);
function init(){
    createSun();
    createOcean();
    createPoints();
    setGUI();
    render();

}

//------------------------ functions -------------------------
//create ocean mesh from points to faces & normals to mash
Ocean = function(width, length) {
    //geometry and size
    this.geom = new THREE.Geometry();
    this.waves = [];
    this.width = width;
    this.length = length;

    // create points
    for (var i = 0; i<=this.length; i++){
        for (var j = 0; j<=this.width; j++){
            this.geom.vertices.push(new THREE.Vector3(j-this.width/2 + i%2*0.5,-0.0005*Math.abs(j-this.width/2)*Math.abs(j-this.width/2)+Math.random()*0.1,i)) ;
            this.waves.push({
                angle: 1.0+Math.random()*0.05,
                distance: Math.random()*0.005
            });
        }
    }

    //create faces and normals
    createFaces(this.geom, this.geom.vertices.length, this.width, this.length);

    //material
    this.uniforms = {};
    this.uniforms.cameraVec = {type: 'v3', value: camera.position};
    this.uniforms.lightVec = {type: 'v3', value: yueSun.mesh.position};
    this.uniforms.skyColor = {type: 'v3', value: new THREE.Vector3(1.0,0.47,0.78)};
    this.uniforms.highLightColor = {type: 'v3', value: new THREE.Vector3(0.9,0.7,0.2)};
    this.uniforms.closeColor = {type: 'v3', value: new THREE.Vector3(0.1,0.1,0.5)};

    this.uniforms.reflectionAnlge = {type: 'fl', value: 0.4};
    var fragmentShaderCode = document.getElementById("fragShader").innerHTML;
    var vertexShaderCode = document.getElementById("vertexShader").innerHTML;
    this.material = new THREE.ShaderMaterial( {uniforms:this.uniforms,vertexShader: vertexShaderCode ,fragmentShader: fragmentShaderCode} );

    //mesh
    this.mesh = new THREE.Mesh(this.geom, this.material);
    this.mesh.position.set(0,0,-this.length/2);
}
//create faces for ocean
function createFaces(geometry, pointNum, width, length){
    // calculate each face's normal, and create the face
    for (var i = 0; i<pointNum-(width+1); i++){
            // if vertices[i] is not in the left edge
            if(i%(width+1)!=0){
                var faceNormal = new THREE.Vector3();
                var point1 = geometry.vertices[i];
                var point2 = geometry.vertices[i+width];
                var point3 = geometry.vertices[i+width+1];
                var vector1 = new THREE.Vector3();
                var vector2 = new THREE.Vector3();
                vector1.subVectors(point1, point2); // !!! use sub, not add !!!
                vector2.subVectors(point2, point3);
                faceNormal.crossVectors(vector1,vector2);
                faceNormal.normalize();
                //console.log(faceNormal.x);
                geometry.faces.push(new THREE.Face3(i, i+width, i+width+1,faceNormal));
            }
            // if vertices[i] is not in the right edge
            if((i+1)%(width+1)!=0){
                var faceNormal = new THREE.Vector3();
                var point1 = geometry.vertices[i];
                var point2 = geometry.vertices[i+width+1];
                var point3 = geometry.vertices[i+1];
                var vector1 = new THREE.Vector3();
                var vector2 = new THREE.Vector3();
                vector1.subVectors(point1, point2);
                vector2.subVectors(point2, point3);
                faceNormal.crossVectors(vector1,vector2);
                faceNormal.normalize();

                geometry.faces.push(new THREE.Face3(i, i+width+1, i+1,faceNormal));
            }
    }
}
// update normals for ocean's faces
function computeNormals(geometry, pointNum, width, length){
    // calculate each face's normal by cross product two edges of the face
    for (var i=0; i<geometry.faces.length; i++){
        var pointI = 0;
        var point_1, point_2, point_3;

        if(i%2==0){
            pointI = i/2 + Math.floor(i/(width*2));
            point_1 = pointI;
            point_2 = pointI+width+1;
            point_3 = pointI+1;
        }else{
            pointI = (i+1)/2 + Math.floor(i/(width*2));
            point_1 = pointI;
            point_2 = pointI+width;
            point_3 = pointI+width+1;
        }

        var point1 = geometry.vertices[point_1];
        var point2 = geometry.vertices[point_2];
        var point3 = geometry.vertices[point_3];

        var vector1 = new THREE.Vector3();
        var vector2 = new THREE.Vector3();
        vector1.subVectors(point1, point2); // !!! use sub, not add !!!
        vector2.subVectors(point2, point3);

        var faceNormal = new THREE.Vector3();
        faceNormal.crossVectors(vector1,vector2);
        faceNormal.normalize();

        geometry.faces[i].normal.x = faceNormal.x;
        geometry.faces[i].normal.y = faceNormal.y;
        geometry.faces[i].normal.z = faceNormal.z;
    }
}
// animate ocean's wave
Ocean.prototype.waveAnimation = function (){
    // wave animation
    var verts = this.mesh.geometry.vertices;
    var len = verts.length;
    var time = clock.getElapsedTime()*2;
    for (var i=0; i<len; i++){
        var v = verts[i];
        var vData = this.waves[i];

        v.x += Math.cos(vData.angle*i+time)*vData.distance;
        v.y += Math.sin(vData.angle*i+time)*0.003;
    }
    // update vetrices
    this.mesh.geometry.verticesNeedUpdate = true;

    // recompute normal of each face
    computeNormals(this.mesh.geometry, this.mesh.geometry.vertices.length, this.width, this.length);

    // update normal
    this.mesh.geometry.normalsNeedUpdate = true;
}

function createOcean(){
    ocean = new Ocean(70,40);
    scene.add(ocean.mesh);
}

//create sun mesh
Sun = function(){
    this.geometry = new THREE.SphereGeometry( 3, 6, 6 );
    this.material = new THREE.MeshBasicMaterial( {color: 0xffffaa} );
    this.mesh = new THREE.Mesh( this.geometry, this.material );
}

function createSun(){
    yueSun = new Sun();
    yueSun.mesh.position.set(0,1,-20);
    yueSun.geometry.scale(1,0.95,0.1);
    scene.add( yueSun.mesh );
}

Points = function(particleCount){
    this.material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    this.geometry = new THREE.Geometry();
    for(var i=0; i<particleCount; i++){
        var px = Math.random()*160 - 80;
        var py = Math.random()*45 - 5;
        var pz = Math.random()*50 - 50;
        var particle = new THREE.Vector3(px,py,pz);
        particle.velocity = new THREE.Vector3(Math.random()*0.5+0.1, Math.random()*0.5, 0);
        this.geometry.vertices.push(particle);
    }
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.mesh.sortParticles = true;
}

Points.prototype.moveAnimation = function(){
    var verts = this.mesh.geometry.vertices;
    var len = verts.length;

    for (var i=0; i<len; i++){
        var v = verts[i];
        //v.x += 0.1;
        v.x += 0.1*v.velocity.x;
        v.y += 0.1*v.velocity.y*Math.sin(v.x/5.0);
        if(v.y>40){
            v.y = -5;
        }
        if(v.x>80){
            v.x = -80;
        }
    }
    this.mesh.geometry.verticesNeedUpdate = true;

}

function createPoints(){
    yuePoints = new Points(300);
    scene.add( yuePoints.mesh );
}

function fpsPanel(){
    //come from 'https://github.com/mrdoob/stats.js#readme'
    stats.begin();

        ocean.waveAnimation();
        yuePoints.moveAnimation()

    stats.end();
}

function render() {
    //delta = clock.getDelta();
    fpsPanel();
    requestAnimationFrame( render );
    //controler.update(delta);
	renderer.render( scene, camera );
}

// GUI
function setGUI(){
    var params = {
        sunHeight: 15

    };
    //curtainCurveFactor = params.curtainWave;
    var gui = new DAT.GUI({height:32-1, width:300});

    gui.add(params, "sunHeight").name("sun height").min(1).max(50).onChange(function(newValue){
        yueSun.mesh.position.y = newValue;
        yueSun.mesh.position.z = -20 - Math.sqrt(newValue);
        var colorFactor = Math.sqrt((newValue+20)/50);

        //change ocean color
        var oceanR = Math.floor(400-130*Math.pow(newValue,0.25));//Math.floor(150+60*Math.sin(Math.PI*newValue/50+0.5));
        var oceanG = Math.floor(50+45*Math.pow(newValue,0.25));
        var oceanB = Math.floor(165+25*Math.pow(newValue,0.25));
        ocean.uniforms.skyColor.value = new THREE.Vector3(
            oceanR/255,
            oceanG/255,
            oceanB/255 );

        //change highlight color
        ocean.uniforms.highLightColor.value = new THREE.Vector3(newValue/50*0.1+0.85,newValue/50*0.3+0.65,newValue/50 * 0.8 + 0.2 );

        //change color of ocean that close to camera
        ocean.uniforms.closeColor.value = new THREE.Vector3(0.1 - 0.1*newValue/50, 0.1 + 0.6*newValue/50, 0.5 + 0.4*newValue/50);

        //change how much reflection can be seen
        ocean.uniforms.reflectionAnlge.value = newValue/50 * 0.4 + 0.4;

        //change color of sky
        var skyTop_R = Math.floor(61+73*Math.pow(newValue,0.25));
        var skyTop_G = Math.floor(13+210*newValue/50);
        var skyTop_B = Math.floor(79+61*(newValue*newValue)/2500);
        var skyBottom_R = Math.floor(255-80*newValue*newValue/2500);
        var skyBottom_G = Math.floor(69+70*Math.pow(newValue,0.25));
        var skyBottom_B = Math.floor(79+154*newValue/50);
        // for chrome
        container.style.background = "-webkit-linear-gradient(top, #"+skyTop_R.toString(16)+skyTop_G.toString(16)+skyTop_B.toString(16) +" 0%, #"+skyBottom_R.toString(16)+skyBottom_G.toString(16)+skyBottom_B.toString(16) +" 40%)";
        // for firefox
        container.style.background = "-moz-linear-gradient(top, #"+skyTop_R.toString(16)+skyTop_G.toString(16)+skyTop_B.toString(16) +" 0%, #"+skyBottom_R.toString(16)+skyBottom_G.toString(16)+skyBottom_B.toString(16) +" 40%)";
        //console.log(oceanB);

    });

}


function windowResize() {
	// update height and width of the renderer and the camera
	canvasHeight = window.innerHeight;
	canvasWidth = window.innerWidth;
	renderer.setSize(canvasWidth, canvasHeight);
	camera.aspect = canvasWidth / canvasHeight;
	camera.updateProjectionMatrix();
}
