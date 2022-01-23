var app = app || {};

app.createPlane = () => {
  var planeMaterial = new THREE.MeshLambertMaterial({ color: 0x3080C9 });
  var planeGeometry = new THREE.PlaneGeometry(app.planeWidth, app.planeLength, 30)
  // create the surface
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.receiveShadow = true;

  return plane;
};

//create net
app.createNet = () => {


  var netGeometry = new THREE.PlaneGeometry( app.planeWidth, 12);
  var netMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );



  var textureLoader = new THREE.TextureLoader();
  textureLoader.load(`img/net22.jpg`, (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(15, 1);
    netMaterial.map = texture;
  });


  var net = new THREE.Mesh(netGeometry, netMaterial);
  net.position.y = 6;
  return net;
}

app.createLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 1, app.planeLength);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var line = new THREE.Mesh(lineGeometry, lineMaterial);
  line.position.set(0,0.2,0)
  line.rotation.x = -0.5 * Math.PI;
  return line;
}

app.createUpLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 1, app.planeWidth);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var upLine = new THREE.Mesh(lineGeometry, lineMaterial);
  upLine.position.set(0,0.2,-app.planeLength/2+0.5);
  upLine.rotation.z = -0.5 * Math.PI;
  upLine.rotation.x = 0.5 * Math.PI;
  return upLine;
}

app.createDownLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 1, app.planeWidth);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var downLine = new THREE.Mesh(lineGeometry, lineMaterial);
  downLine.position.set(0,0.2,app.planeLength/2-0.5)
  downLine.rotation.z = -0.5 * Math.PI;
  downLine.rotation.x = 0.5 * Math.PI;
  return downLine;
}

app.createLeftLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 1, app.planeLength);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var leftLine = new THREE.Mesh(lineGeometry, lineMaterial);
  leftLine.position.set(-app.planeWidth/2+0.5,0.2,0)
  leftLine.rotation.x = -0.5 * Math.PI;
  return leftLine;
}

app.createRightLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 1, app.planeLength);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var rightLine = new THREE.Mesh(lineGeometry, lineMaterial);
  rightLine.position.set(app.planeWidth/2-0.5,0.2,0)
  rightLine.rotation.x = -0.5 * Math.PI;
  return rightLine;
}

//create ping pong ball
app.createBall = () => {
  var geometry = new THREE.SphereGeometry( 2, 30, 30)
  var material = new THREE.MeshStandardMaterial( { color: 0xffd046 })
  var sphere = new THREE.Mesh( geometry, material )
  sphere.castShadow = true;
  sphere.position.set(0, 30, -120);
  sphere.velocity = new THREE.Vector3(0, 0, 1);

  return sphere;
};

//create lights
app.createAmbientlight = () => {
  var ambientLight = new THREE.AmbientLight (0xffffff, 0.4);
  return ambientLight;
}

app.createSpotlight = (x, y, z , color, intensity=1.0) => {
  var spotLight = new THREE.SpotLight(color, intensity);
  spotLight.position.set(x,y,z);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  return spotLight;
}
