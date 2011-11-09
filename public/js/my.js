var socket = io.connect('http://localhost');
var particleCreateQueue = [];

socket.on('tweets', function (data) {
  var tweets = data.tweets;
  for (var i = tweets.length - 1; i >= 0; i--) {
    particleCreateQueue.push(tweets[i]);
  };
});

/* Create a function that contains all of our animation code.
This function will have the Processing object passed into it by the regestration
function (see below). */
var mySketch = function (P) {
  var WORLD_BOUNDS = new P.PVector(800, 600);
  var BG = P.color(30, 30, 30);
  // Limit the number of particles, since we don't want the sketch to slow down.
  var MAX_PARTICLES = 200;
  var phys2D = toxi.physics2d;
  var physics = new phys2D.VerletPhysics2D();
  var mousePos, mouseAttractor;
  var red = P.color(248, 141, 113);
  var green = P.color(204, 221, 89);
  var white = P.color(255, 255, 255);
  var $tweetText = $('#tweet-text');
  
  /* Setup steps for your sketch. */
  P.setup = function () {
    P.background(BG);
    /* Set animation size */
    P.size(WORLD_BOUNDS.x, WORLD_BOUNDS.y);
    /* Set animation background color */
    P.fill(255, 255, 255);
    P.noStroke();
    P.smooth();
    /* Your code goes in here. */

    physics.setDrag(0.01);
    physics.setWorldBounds(new toxi.Rect(
      0, 0,
      WORLD_BOUNDS.x,
      WORLD_BOUNDS.y
    ));
  };
  
  P.mouseMoved = function () {
  // Remove previous attractor
  physics.removeBehavior(mouseAttractor);

    mousePos = new toxi.Vec2D(P.mouseX, P.mouseY);
    // create a new positive attraction force field around the mouse position (radius=250px)
    mouseAttractor = new phys2D.AttractionBehavior(mousePos, 250, 0.1);
    physics.addBehavior(mouseAttractor);
  };
  
  /* Click particles to see text */
  P.mouseReleased = function () {
    var myX = P.mouseX;
    var myY = P.mouseY;
    var bounds = 20;
    var diffX, diffY, particle;
    for (var i=0; i < physics.particles.length; i++) {
      particle = physics.particles[i];
      // Get absolute value of X and Y differences
      diffX = Math.abs(particle.x - myX);
      diffY = Math.abs(particle.y - myY);
      if (diffX < bounds && diffY < bounds) {
        particle.clicked = true;
        $tweetText.html('<div class="name">'+particle.data.from_user+'</div><div class="text">'+particle.data.text+'</div>');
        break;
      };
    };
  };
  
  /* Draw function is called by the draw loop ~60 times per second. */
  P.draw = function () {
    P.background(BG);
    
    physics.update();
    
    /* Create particles from queued results, if we have any.
    Create one every half second. */
    var halfSecond = ((P.frameCount % 30) === 0);
    if (halfSecond && particleCreateQueue.length) {
      var particleData = particleCreateQueue.pop();
      
      var loc = toxi.Vec2D
        .randomVector()
        .scale(10)
        // Generate the particle at these coordinates (middle)
        .addSelf((WORLD_BOUNDS.x / 2), (WORLD_BOUNDS.y / 2));
      
      var newParticle = new phys2D.VerletParticle2D(loc);

      newParticle.data = particleData;
      physics.addParticle(newParticle);
      physics.addBehavior(new phys2D.AttractionBehavior(newParticle, 20, -1.2, 0.01));
    };

      /* Remove particles if we have too many */
    if (physics.particles.length > MAX_PARTICLES) {
      // Remove oldest particle
      physics.particles.shift();
    };
    
    /* Draw particles */
    for (var i = physics.particles.length - 1; i >= 0; i--) {
      var particle = physics.particles[i],
          text = particle.data.text,
          textLower = text.toLowerCase();
      
      if (particle.clicked) {
        P.fill(70, 70, 70); // Deactivated
      }
      else if (textLower.indexOf('occupywallst') !== -1) {
        P.fill(red);
      }
      else if (textLower.indexOf('occ') !== -1) {
        P.fill(green);
      }
      else {
        P.fill(white); 
      };
      
      P.ellipse(particle.x, particle.y, 10, 10);
    };
  };
};
/* Start up Processing */
var myProcessing = new Processing('my-sketch', mySketch);