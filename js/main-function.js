 var app = app || {};

//animation
app.animate = () => {

  app.humanStart();

  app.easyMode();

  app.updateAI();

  if(app.config.doBallUpdate){
     app.updateBall();
  }

  app.stats.update();

  app.matchScoreCheck();

  if (app.particleSystem) {
    app.animateParticles();
  }

  app.renderer.render( app.scene, app.camera );
  requestAnimationFrame(app.animate);
};


//add Stats
app.addStats = () => {
  const stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.body.appendChild(stats.domElement);

  return stats;
};


//AI paddle moves
app.updateAI = () => {
  // try to match ball X position as soon as it's moving in direction of AI player
  if (app.ball.velocity.z < 0 ){
    app.paddleAI.position.x = app.ball.position.x;
    app.paddleAI.position.y = app.ball.position.y;
  }
}


//human turn to hit the ball and start the game
app.humanStart = () => {
  if (app.winner === "AI" && app.withinBounceRange(app.ball, app.paddle) && (app.paddle.position.z - app.ball.position.z) < 3 && app.ball.velocity.z === 0) {
    app.ball.velocity.z = app.paddle.velocity.z * app.config.humanHitVelocityScale ;
    app.winner = "";
    app.justHit = "human";
    app.pointHasBegun = true;
  }
};

//reset global variables for new game and after each point
app.setting = () => {
  app.paddleAI.rotation.x = 0;
  app.paddleAI.rotation.y = 0;
  app.justServed = true;
  app.hasBouncedOnOppositeSide = false;
  app.addPoint = true;
  app.bounce = 0;
}

//new game starts
app.newGame = () => {

  document.getElementById("scores").innerHTML = "0 - 0";
  document.getElementById("message").innerHTML = "First to " + app.winningScore + " scores wins!";

  if (app.particleSystem) {
    app.particleSystem.geometry.dispose();
    app.particleSystem.material.dispose();
    app.scene.remove(app.particleSystem);
  }

  app.cheering.pause();

  if( app.winner === "AI" ){
    // human starts
    app.ball.position.set(0, 30, 150);

  } else {
    app.ball.position.set(0, 30, -150);
    app.ball.velocity.set(0, 0, 1.3);
    app.winner = "";
  }

  app.setting();
  app.paddle.rotation.x = 0;
  app.paddle.rotation.y = 0;
  const scale = app.planeWidth/100;
  app.paddle.scale.set(scale, scale, scale);
  app.paddleAI.scale.set(scale, scale, scale);

  app.aiScore = 0;
  app.humanScore = 0;
  app.activeParticle = true;
}


//Next Point
app.restartRound  = () =>  {
  document.getElementById("message").innerHTML = " "

  app.setting();
  app.paddleAI.position.y = 30;

  // AI is serving
  app.ball.position.set(Math.random()*101-50, 30, -app.planeLength/2);
  app.paddleAI.position.x = app.ball.position.x;

  app.aiPaddleSound.play();

  app.ball.velocity.set(0, 0, 1.5);

  app.justHit = "AI";  // reset last-hit tracker
};

//Ping pong ball moves
app.updateBall = () => {
  const pos = app.ball.position;
  const paddle = app.paddle.position;

  app.guiControls.rollDebug = app.nextTurn;

  // apply gravity
  app.ball.velocity.y -= app.guiControls.gravity/2;
  // apply velocity to position
  app.ball.position.x += app.ball.velocity.x * app.guiControls.ballVelocityScale;
  app.ball.position.z += app.ball.velocity.z * app.guiControls.ballVelocityScale;
  app.ball.position.y += app.ball.velocity.y;

  // clamp Y, no sinking through table
  app.ball.position.y = Math.max(2, app.ball.position.y);

  app.calculateBallOutOfBounds(app.ball);

  app.calculatePaddlehit(app.ball, app.paddle, app.paddleAI);

  app.guiControls.hasCrossed = app.hasCrossedNet(app.ball, app.justHit);

  app.calculateTableBounce(app.ball, app.justHit);

  // bounce off invisible walls on sides of table
  if( app.guiControls.sideWalls && Math.abs(pos.x) > app.planeWidth/2 ){
    app.ball.velocity.x *= -1;
  }

  if( app.justServed && app.ball.position.z >= 0 ){
    app.justServed = false;
  }
};

//easy mode to help user find ball position (x axis and y axis)
app.easyMode = () => {
  if (app.guiControls.easyMode && app.ball.velocity.z > 0 ) {
    app.paddle.position.x = app.ball.position.x;
    app.paddle.position.y = app.ball.position.y;
  }
}


//create, animate and add particle System to the scene
app.createParticleSystem = () => {

  const particles = new THREE.Geometry();

  const dist = app.guiControls.particleDistribution;

  for (var i = 0; i < app.guiControls.numParticles; i++) {

    const particle = new THREE.Vector3(
      THREE.Math.randInt(-dist, dist),
      THREE.Math.randInt(-dist, dist),
      -300
    )

    particle.vx = 0;
    particle.vy = 0;
    particle.vz = 0;


    particles.vertices.push(particle)
  }// for

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 500,
    map: THREE.ImageUtils.loadTexture('img/cracker.gif'),
    blending: THREE.NormalBlending,
    transparent: true,
    alphaTest: 0.5
  });

  const particleSystem = new THREE.Points(particles, particleMaterial);

  return particleSystem;
}

app.animateParticles = () => {
  const particles = app.particleSystem.geometry.vertices;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];

    const distSquared = (particle.x * particle.x)
                      + (particle.y * particle.y)
                      + (particle.z * particle.z);


    if (distSquared > 6.0) {
      const force = (10.0/distSquared) * -0.02;
      particle.vx += force * particle.x;
      particle.vy += force * particle.y;
      particle.vz += force * particle.z;
    }

     particle.x += particle.vx * app.guiControls.particleVelocityScale;
     particle.y += particle.vy * app.guiControls.particleVelocityScale;
     particle.z += particle.vz * app.guiControls.particleVelocityScale;
  }

  app.particleSystem.geometry.verticesNeedUpdate = true;
}

app.showParticleSystem = () => {
  if (app.winner && app.activeParticle) {
    app.particleSystem = app.createParticleSystem();
    app.scene.add(app.particleSystem);
    app.activeParticle = false;
  }
};


//check winning condition
app.matchScoreCheck = () => {
  let paddle;
  // if either one reaches 5 points
  if (app.aiScore >= app.winningScore) {
    app.winner = "AI";
    app.nextTurn = "human";
    app.aiScore = app.winningScore;
    paddle = app.paddleAI;
    app.ball.velocity.set(0,0,0);
    app.ball.position.set(0,2,-app.planeLength/2)
    // write to the banner
    document.getElementById("scores").innerHTML = "AI wins!";
    document.getElementById("message").innerHTML = "Press enter to play again";
    
    //audience cheering
    app.cheering.play();
    // make paddle rotates
    app.step++;
    paddle.position.z = -170;
    paddle.rotation.y = Math.sin(app.step * 0.1) * 15;
    // enlarge and squish paddle
    paddle.scale.z = 2 + Math.abs(Math.sin(app.step * 0.1)) * 3;
    paddle.scale.x = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;
    paddle.scale.y = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;

    //particle system
    app.showParticleSystem();

  } else if (app.humanScore >= app.winningScore) {
    app.winner = "human";
    app.nextTurn = "AI";
    app.humanScore = app.winningScore;
    paddle = app.paddle;
    app.ball.velocity.set(0,0,0);
    app.ball.position.set(0, 2, app.planeLength/2)
    // write to the banner
    document.getElementById("scores").innerHTML = "Human wins!";
    document.getElementById("message").innerHTML = "Press enter to play again";
    app.cheering.play();
    // make paddle bounce up and down
    app.step++;
    paddle.rotation.y = Math.sin(app.step * 0.1) * 15;
    // enlarge and squish paddle
    paddle.scale.z = 2 + Math.abs(Math.sin(app.step * 0.1)) * 3;
    paddle.scale.x = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;
    paddle.scale.y = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;

    app.showParticleSystem();
  }
};


//update scores helper method
app.updateScores = () => {
  app.justHit === "AI"? app.humanScore ++ : app.aiScore ++ ;
  document.getElementById("scores").innerHTML = app.aiScore + " - " + app.humanScore;

  setTimeout(app.restartRound, 1000);
}


//Core Game Logic - winning decision
app.calculateTableBounce = (ball, lastHitBy) => {

  // Table bounce
  //if hit the table, change y axis direction so the ball would go up
  if( ball.position.y <= 2 && ball.velocity.y < 0 ){
    ball.velocity.y *= -1;

    //toggle the sound based on ball on which side
    if (Math.abs(ball.position.x) <= app.planeWidth/2 && Math.abs(ball.position.z) <= app.planeLength/2 && ball.position.y >= 0) {
      ball.position.z <= 0 ?
      app.aiSide.play() : app.humanSide.play()
    }

    // Check if bounce is legal
    // ball has crossed the net by the person
    if (app.hasCrossedNet(ball, lastHitBy)) {
      //check if ball has bounced on the other side
      if(app.hasBouncedOnOppositeSide){
        //if opponent miss the ball
        if (Math.abs(app.ball.position.z) > app.planeLength/2) {
          document.getElementById("message").innerHTML = "Nice shot, " + lastHitBy + "!"

          ball.velocity.x *= 0.2;
          ball.velocity.z *= 0.2;

          if (app.addPoint) {
            lastHitBy === "AI"? app.aiScore ++ : app.humanScore ++;
            document.getElementById("scores").innerHTML = app.aiScore + " - " + app.humanScore;
            app.addPoint = false;
          }

          setTimeout(app.restartRound, 1000);
        }
        //ball hasn't bounce on the other side - first time bounce on the other side
      } else {
        app.hasBouncedOnOppositeSide = true;
      };

      //check if ball has bounced on your own side before crossing net
    } else {
      //check if app.justServed is false - it's not the first serve
      if( !app.justServed
        //if app.pointHasBegun is false - this is not human's first serve
        && app.pointHasBegun === false
      ){
        //the ball also didn't cross the net
        //illegal bounce
        document.getElementById("message").innerHTML = "illegal bounce by " + lastHitBy;

        ball.velocity.x *= 0.2;
        ball.velocity.z *= 0.2;

        // app.addPoint is true, run the app.updateScores methods
        // change the app.addPoint to false to stop the method, otherwise the score will be keep increasing due to the animate();
        if (app.addPoint) {
          app.updateScores(lastHitBy);
          app.addPoint = false;
        }
      }
      //change the point has begun to false after human first serve to activate the illegal bounce condition
      app.pointHasBegun = false;
    } //end else of hasCrossedNet
  } else {

    // No bounce at all

    if (app.hasCrossedNet(ball, lastHitBy) && (Math.abs(app.ball.position.z) > app.planeLength/2+10 || Math.abs(app.ball.position.x) > app.planeWidth/2+10) && !app.hasBouncedOnOppositeSide && Math.abs(ball.velocity.z) > 0) {

      //slows down the ball velocity
      app.ball.velocity.x = 0;
      app.ball.velocity.z = 0;

      //set paddle AI position away from the ball, so it won't hit the ball as human should loss the point
      app.paddleAI.position.x = ball.position.x - 50;
      app.paddleAI.position.y = ball.position.y +20;

      // console.log(`${lastHitBy} out`);
      document.getElementById("message").innerHTML = lastHitBy + " out!"

      if (app.addPoint) {
        app.updateScores(lastHitBy);
        app.addPoint = false;
      }
    }
  }
};


//hit the net & out of range condition
app.calculateBallOutOfBounds = (ball) => {

  // if ball has hit net
  if ( Math.abs(ball.position.x) <= app.planeWidth/2
    && Math.abs(ball.position.y) <= app.net.position.y
    && Math.abs(ball.position.z) <= 2.5
    // these conditions avoid the ball 'jitter' of being
    // bounced back and forth within the net range
    &&  ((app.justHit === 'human' && ball.velocity.z < 0 )
        ||
        (app.justHit === 'AI' && ball.velocity.z > 0 ))
    ){
    // console.log(`${app.justHit} hit the net!`);
    document.getElementById("message").innerHTML = app.justHit + " hit the net!"
    // ball.velocity.set(0, 0, 0);
    ball.velocity.z *= -1;
    ball.velocity.multiplyScalar(0.3);


    if (app.addPoint) {
      app.updateScores(app.justHit);
      app.addPoint = false;
    };
  }

  // if ball is too high - y position
  if (ball.position.y > 80 && Math.abs(ball.position.z) === app.planeLength/2) {
    // console.log("ball is too high, can't catch it");
    document.getElementById("message").innerHTML = "ball is too high, can't catch it"
    setTimeout(app.restartRound, 1000);
  }

};


// calculate paddle hitting position and angle - decide how the paddle should react
app.calculatePaddlehit = (ball, paddle, paddleAI) => {
  // AI just hit, not it is human player's turn
  if( app.justHit === 'AI'
      && ball.velocity.z > 0
      && (paddle.position.z - ball.position.z) < 4 // TODO: more accurate
      && app.withinBounceRange(ball, paddle) ){

    // calculate reflected angle based on surface normal vector
    let normalMatrix = new THREE.Matrix3().getNormalMatrix( app.surface.matrixWorld );
    let normalizedNormal = app.surface.geometry.faces[0].normal.clone().applyMatrix3( normalMatrix ).normalize();

    ball.velocity.reflect( normalizedNormal )

    //play the sound
    ball.position.y > 0? app.humanPaddleSound.play(): app.humanPaddleSound.pause();

    app.justHit = "human"; // toggle the value for who just hit

    //to check if the ball has crossed the net
    app.hasBouncedOnOppositeSide = false;
    ball.velocity.z += paddle.velocity.z * app.config.humanHitVelocityScale;

    // human just hit - now AI's turn
  } else if (ball.velocity.z < 0
    && paddleAI.position.z - ball.position.z > -4
    && app.withinBounceRange(ball, paddleAI) ){

    let normalMatrix = new THREE.Matrix3().getNormalMatrix( app.surfaceAI.matrixWorld );
    let normalizedNormal = app.surfaceAI.geometry.faces[0].normal.clone().applyMatrix3( normalMatrix ).normalize();

    //adjust AI paddle x axis rotation based on ball's height - paddle tilt up or down
    paddleAI.rotation.x = THREE.Math.mapLinear(
      ball.position.y,
      - 20, 100,
      -Math.PI/12, Math.PI/12
    )

    //adjust AI paddle y axis rotation based on ball's x position - keep the ball bounce on the table
    if (app.ball.position.x >= 0 &&  app.ball.position.x < app.planeWidth/2 + 100) {
      paddleAI.rotation.y = THREE.Math.mapLinear(
        ball.position.x,
        0, app.planeWidth/2,
        0, - Math.PI/6
      )
      paddleAI.rotation.y = THREE.Math.clamp(paddleAI.rotation.y, 0, - Math.PI/6);
    } else if (app.ball.position.x < 0 && app.ball.position.x > -app.planeWidth/2 - 100) {
      paddleAI.rotation.y = THREE.Math.mapLinear(
        ball.position.x,
        -app.planeWidth/2, 0,
        Math.PI/6, 0
      )
      paddleAI.rotation.y = THREE.Math.clamp(paddleAI.rotation.y, Math.PI/18, 0);
    };

    // paddleAI.rotation.x=0;
    // paddleAI.rotation.y=0;

    ball.velocity.reflect( normalizedNormal );
    ball.velocity.z = THREE.Math.mapLinear(
      paddleAI.rotation.x,
      -Math.PI/12, Math.PI/8,
      1.6, 1.6
    )

    //calculate paddle.rotation.x angle based on y position, then calculate bounce back speed based on angle
    app.aiPaddleSound.play();
    app.justHit = "AI" // toggle the value for who just hit
    app.hasBouncedOnOppositeSide = false;
  }
};

//check if ball is within the paddle/AI paddle range, just x and y position
app.withinBounceRange = (ball, paddle) => {
  return (
    ball.position.x >= (paddle.position.x - app.paddleWidth/2)
    && ball.position.x <= (paddle.position.x + app.paddleWidth/2)
    && ball.position.y >= (paddle.position.y - app.paddleWidth/2)
    && ball.position.y <= (paddle.position.y + app.paddleWidth/2)
  );
};


//check if ball has crossed the net
app.hasCrossedNet = (ball, lastHitBy) => {
  if (lastHitBy === "human") {
    return ball.position.z < 0;
  } else {
    return ball.position.z > 0;
  }
};
