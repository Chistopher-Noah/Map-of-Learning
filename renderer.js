import { dependencyData } from './dependencies.js';
import { difficultyColor } from './dependencies.js';

let inputBox, currentRoot = "";
let levelOffset = {}, plannedPos = {};
let verticalGap = 200, horizontalGap = 220, startX = 100;

new p5(p => { // p5 instance mode to avoid global namespace pollution
  p.setup = () => {
    let ActualCanvas = p.createCanvas(3200, 2800);// set a large canvas to avoid overflow
    ActualCanvas.parent("canvas-holder");// attach to the div(in the index.html)
    p.background(245);
    p.textAlign(p.CENTER, p.CENTER);
    p.noLoop(); // disable automatic looping 

    inputBox = document.getElementById("nodeInput");
    inputBox.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        currentRoot = inputBox.value.trim();// to diminish spaces
        currentRoot = currentRoot.toLowerCase().replace(/\s+/g, '');// to normalize the variable to the format in dependencies.js
        p.redraw();// trigger a redraw
      }
    });
  };

  p.draw = () => {
    p.background(245);
    if (!currentRoot) return; // all format like this (if (!something) return) is to prevent errors from empty input
    if (!(currentRoot in dependencyData)) {
      p.fill(255,0,0);
      p.text("The node doesn't exist", 200, 100);
      return;// if the input is invalid print this message and return
    }
    levelOffset = {}; plannedPos = {};
    drawTree(currentRoot, 0);// start drawing from level 0 
  };

  function drawTree(name, level){
    let myPos = getPosition(name, level); // get the position for this node after calculating the positions of previous nodes
    let color = difficultyColor[name] || "#CCCCCC"; // draw the node with its difficulty color, default to gray
    p.fill(color); 
    p.stroke(80);
    p.circle(myPos.x, myPos.y, 120);
    p.fill(0); 
    p.noStroke(); 
    p.text(name, myPos.x, myPos.y);

    let childDependence = dependencyData[name]; //  reference to its dependencies
    if (!childDependence) return; // if no dependencies, return
    for (let dep of childDependence){
      let child = getPosition(dep, level+1); // the level should increase by 1 for dependencies , this line is to get the position of the dependency node
      p.stroke(150);
      p.line(myPos.x, myPos.y+60, child.x, child.y-60);// the additional 60 is to make the line connect to the edge of the circle, so does -60
      drawTree(dep, level+1);
      /*
      this is the core of the drawing function, it draws the dependency tree recursively
      for each dependency, it draws a line from the current node to the dependency node
      then it calls drawTree on the dependency node to draw its own dependencies
      this continues until all dependencies are drawn
      until a node with no dependencies is reached, at which point the function returns 
      it calls if (!childDependence) return eventually
      */
    }
  }

  function getPosition(name, level){
    let key = name+"@@"+level;  // unique key for each node at each level
    if (plannedPos[key]) return plannedPos[key];// if already calculated, return the stored position
    if (!(level in levelOffset)) 
      {levelOffset[level] = startX;} // initialize level horizontal location if no nodes at this level yet
    let x = levelOffset[level];
    let y = 100 + level*verticalGap;
    levelOffset[level] += horizontalGap;
    plannedPos[key] = {x,y};
    return plannedPos[key];
  }
});
