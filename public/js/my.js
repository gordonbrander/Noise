var socket = io.connect('http://localhost');
var phys = toxi.physics2d;
var physics = new phys.VerletPhysics2D();

/* Create a function that contains all of our animation code.
This function will have the Processing object passed into it by the regestration
function (see below). */
var mySketch = function (P) {
  var WORLD_BOUNDS = new P.PVector(800, 600);
  var BG = new P.PVector(30, 30, 30);
  var fillBackground = function() {
    P.background(BG.x, BG.y, BG.z);
  }
  /* Setup steps for your sketch. */
  P.setup = function () {
    fillBackground();
    /* Set animation size */
    P.size(WORLD_BOUNDS.x, WORLD_BOUNDS.y);
    /* Set animation background color */
    P.fill(255, 255, 255);
    P.stroke(90, 90, 90);
    P.smooth();
    /* Your code goes in here. */

    physics.setDrag(0.05);
    physics.setWorldBounds(new toxi.Rect(
      0, 0,
      WORLD_BOUNDS.x,
      WORLD_BOUNDS.y
    ));
    physics.addBehavior(
      new phys.GravityBehavior(
        new toxi.Vec2D(0, 0.15)
      )
    );

    socket.on('tweets', function (data) {
      for (var i = data.args.tweets.length - 1; i >= 0; i--) {
        var loc = toxi.Vec2D
          .randomVector()
          .scale(5)
          .addSelf(5, 0);
        var particle = new phys.VerletParticle2D(loc);

        physics.addParticle(particle);
      };
    });
  };
  
  /* Draw function is called by the draw loop ~60 times per second. */
  P.draw = function () {
    fillBackground();
    // for (var i = data.length - 1; i >= 0; i--) {
    //   var datum = data[i];

    //   var size = P.constrain((datum.text.length * 3), 0, 600);
    //   var h = 50;
    //   P.rect(0, ((h * i)+1), size, h);    
    // };

    physics.update();
    for (var i = physics.particles.length - 1; i >= 0; i--) {
      var p = physics.particles[i];
      P.ellipse(p.x, p.y, 5, 5);
    };
  };
};
/* Start up Processing */
var myProcessing = new Processing('my-sketch', mySketch);