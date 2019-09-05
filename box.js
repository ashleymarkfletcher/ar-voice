// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/urR596FsU68

function Box(x, y, w, h, World, word) {
  var options = {
    friction: 0.3,
    restitution: 0.6
  }
  this.body = Bodies.rectangle(x, y, w, h, options)
  this.w = w
  this.h = h
  this.word = word
  World.add(world, this.body)

  this.show = function() {
    var pos = this.body.position
    var angle = this.body.angle
    push()
    translate(pos.x, pos.y)
    rotate(angle)
    rectMode(CENTER)
    strokeWeight(1)
    stroke(255)
    fill(127)
    // rect(0, 0, this.w, this.h)

    fill(255)
    textSize(50)
    textAlign(CENTER, CENTER)
    text(this.word, 0, 0)
    pop()
  }
}
