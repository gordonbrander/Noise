var socket = io.connect('http://localhost');
var phys2D = toxi.physics2d;
var physics = new phys2D.VerletPhysics2D();

/* Create a function that contains all of our animation code.
This function will have the Processing object passed into it by the regestration
function (see below). */
var mySketch = function (P) {
  var WORLD_BOUNDS = new P.PVector(800, 600);
  var BG = P.color(30, 30, 30);
  var particleCreateQueue = [];
  var mousePos, mouseAttractor;
  
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
    
    socket.on('tweets', function (data) {
      var tweets = data.tweets;
      for (var i = tweets.length - 1; i >= 0; i--) {
        particleCreateQueue.push(tweets[i]);
      };
    });
  };
  
  P.mousePressed = function () {
    mousePos = new toxi.Vec2D(P.mouseX, P.mouseY);
    // create a new positive attraction force field around the mouse position (radius=250px)
    mouseAttractor = new phys2D.AttractionBehavior(mousePos, 250, 0.9);
    physics.addBehavior(mouseAttractor);
  };
  
  P.mouseReleased = function () {
    physics.removeBehavior(mouseAttractor);
  };
  
  /* Draw function is called by the draw loop ~60 times per second. */
  P.draw = function () {
    P.background(BG);
    
    physics.update();
    
    /* Create particles from queued results every
    half second. */
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

    for (var i = physics.particles.length - 1; i >= 0; i--) {
      var particle = physics.particles[i],
          text = particle.data.text;
      
      if (text.indexOf('#ows') !== -1) {
        P.fill(204, 221, 89);
      }
      else {
        P.fill(248, 141, 113); 
      };
      
      P.ellipse(particle.x, particle.y, 10, 10);
    };
  };
};
/* Start up Processing */
var myProcessing = new Processing('my-sketch', mySketch);