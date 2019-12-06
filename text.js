container = document.querySelector( '#scene-container' );

//to get the coordinates of the top left corner of canvas
let rect = container.getBoundingClientRect();
let canvasX = rect.right - rect.left, canvasY = rect.bottom - rect.top;



function createStaticText(content, x, y, size){

  let node = document.createElement("span");
  let textnode = document.createTextNode(content);
  node.appendChild(textnode);
  container.appendChild(node);
  node.style.top = y + "px";
  node.style.left = x + "px";
  node.style.fontSize = size + "px";
  node.setAttribute("id", "fixedText");

}

function scale(coordinate, resolution, original){
  return coordinate / resolution * original;
}

function addTextButton(argument) {

  // Divide the canvas in `height` rows
  let height = document.getElementById("resolution-height").value;
  // Divide the canvas in `width` columns
  let width = document.getElementById("resolution-width").value;

  // To place the text in xth column out of width columns
  let x = scale(document.getElementById("text-left").value, width, canvasX);
  // To place the text in yth row out of height columns
  let y = scale(document.getElementById("text-top").value, height, canvasY);

  // Content to be written
  let content = document.getElementById("text-content").value;
  let size = document.getElementById("text-size").value;

  createStaticText(content, x, y, size);
}
