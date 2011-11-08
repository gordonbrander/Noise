var socket = io.connect('http://localhost');
var phys2D = toxi.physics2d;
var physics = new phys2D.VerletPhysics2D();

/* Create a function that contains all of our animation code.
This function will have the Processing object passed into it by the regestration
function (see below). */
var mySketch = function (P) {
  var WORLD_BOUNDS = new P.PVector(800, 600);
  var BG = new P.PVector(30, 30, 30);
  var fillBackground = function() {
    P.background(BG.x, BG.y, BG.z);
  };
  
  /* Setup steps for your sketch. */
  P.setup = function () {
    fillBackground();
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
        var loc = toxi.Vec2D
          .randomVector()
          .scale(10)
          // Generate the particle at these coordinates (middle)
          .addSelf((WORLD_BOUNDS.x / 2), (WORLD_BOUNDS.y / 2));
        var particle = new phys2D.VerletParticle2D(loc);
        
        particle.positive = tweets[i].positive;

        physics.addParticle(particle);
        physics.addBehavior(new phys2D.AttractionBehavior(particle, 20, -1.2, 0.01));
      };
    });
  };
  
  /* Draw function is called by the draw loop ~60 times per second. */
  P.draw = function () {
    fillBackground();
    physics.update();

    for (var i = physics.particles.length - 1; i >= 0; i--) {
      var particle = physics.particles[i];
      
      if (particle.positive) {
        P.fill(204, 221, 89);
      }
      else {
        P.fill(248, 141, 113); 
      }
      
      P.ellipse(particle.x, particle.y, 10, 10);
    };
  };
};
/* Start up Processing */
var myProcessing = new Processing('my-sketch', mySketch);