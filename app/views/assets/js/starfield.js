module.exports = function() {
    var $ = require('jquery');
    var starfield = $('#starfield');

    if (!starfield.length) {
        return;
    }

    var container = $('body');

    function containerWidth() {
        return $(window).width();
    }

    function containerHeight() {
        return $(window).height();
    }

    var THREE = require('three');
    var particles = 20000;
    var velocity  = {max: 0.0001, min: 0.000001};
    var depth     = 1000;

    var mouseX = 0, mouseY = 0, mouseDown = false;
    var cloud;

    var scene, camera, frustum, screenMatrix, renderer,
        directionalLight, pointLight;

    function init() {
        scene = new THREE.Scene();
        lights();
        camera();
        action();
    }

    function lights() {
        // Lighting
        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, -1, 1);
        scene.add(directionalLight);

        var pointLight = new THREE.PointLight(0xffffff, 2, 300);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);
    }

    function camera() {
        camera = new THREE.PerspectiveCamera(90, containerWidth() / containerHeight(), 1, depth);
        camera.position.z = depth/2;

        frustum      = new THREE.Frustum();
        screenMatrix = new THREE.Matrix4();
    }

    function action() {
        renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setSize(containerWidth(), containerHeight());
        renderer.setClearColor(0xffffff, 0);

        var dom = $(renderer.domElement);
        dom.css({
            position: 'absolute',
            opacity: 0
        });
        container.prepend(dom);
        dom.fadeTo(5000, 1.0);

        makeCloud();
        loop();
    }

    function loop() {
        requestAnimationFrame(loop);
        updateCloud();
        renderer.render(scene, camera);
    }

    function randVector() {
        var w = containerWidth();
        var h = containerHeight();
        var rand = THREE.Math.randInt.bind(THREE.Math);
        var x = rand(-w/2, w/2), 
            y = rand(-h/2, h/2), 
            z = rand(1, depth);
        return new THREE.Vector3(x, y, z);
    }

    function makeCloud() {
        var geometry = new THREE.Geometry();
        var material = new THREE.PointsMaterial({
            color: 'rgb(35,142,81)'
        });
        for (var i=0; i<particles; i++) {
            var v = randVector();
            v.velocity = THREE.Math.randFloat(velocity.min, velocity.max);
            geometry.vertices.push(v);
        }
        cloud = new THREE.Points(geometry, material);
        scene.add(cloud);
    }

    function updateCloud() {
        var w = container.width();
        var h = container.height();
        var x = mouseX - w/2;
        var y = h/2 - mouseY;
        if (mouseDown) {
            cloud.rotation.y += x * 0.00001;
            cloud.rotation.x += y * -0.00001;
        }

        var target = new THREE.Vector3(x, y, depth);

        cloud.geometry.vertices.forEach(function(v, i) {
            v.lerp(target, v.velocity);
            if (v.z > depth/2 || v.z < 0) {
                var rand = randVector();
                v.x = rand.x;
                v.y = rand.y;
                v.z = 1;
            }
        });

        cloud.geometry.verticesNeedUpdate = true;
    }

    function randColor() {
        var num = THREE.Math.randFloat.bind(THREE.Math, 0.0, 1.0);
        return new THREE.Color(num(), num(), num());
    }

    document.body.onmousemove = function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    document.body.onmousedown = function(e) {
        mouseDown = true;
    }

    document.body.onmouseup = function(e) {
        mouseDown = false;
    }

    init();
};
