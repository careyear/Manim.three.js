container = document.querySelector( '#scene-container' );

//to get the coordinates of the top left corner of canvas
let rect = container.getBoundingClientRect();
let canvasX = rect.right - rect.left, canvasY = rect.bottom - rect.top;


// To scale the user defined coordinates according to canvas size
function scale(coordinate, resolution, original){
    return coordinate / resolution * original;
}




/* ------------- TO CREATE NORMAL TEXT ------------- */

// Create and place the text containing element on DOM
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

function addNormalText() {

    // Divide the canvas in `height` rows
    let height = 1000;
    // Divide the canvas in `width` columns
    let width = 1000;


    // To place the text in xth column out of width columns
    let x = scale(100, width, canvasX);
    // To place the text in yth row out of height columns
    let y = scale(500, height, canvasY);


    // Content to be written
    let content = document.getElementById("input-text").value;
    let size = 40; // font-size


    createStaticText(content, x, y, size);
}



/* ------------- TO CREATE ANIMATED TEXT ------------- */


function addAnimatedText(){
    let canvas = document.createElement("canvas");
    canvas.id = "c";
    canvas.width = 1000;
    canvas.height = 1000;
    container.appendChild(canvas);
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 1000, 1000);

    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.globalAlpha = 2/3;
    ctx.font = "50px Open Sans";
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";



    let dashLen = 220, dashOffset = dashLen, speed = 70, x = 30, i = 0;
    let txt = document.getElementById("input-animated-text").value;
    loop();


    function loop(){
        ctx.clearRect(x, 0, 60, 150);
        ctx.setLineDash([dashLen - dashOffset, dashOffset - speed]);
        dashOffset -= speed;

        ctx.strokeText(txt[i], x, 90);

        if(dashOffset > 0) requestAnimationFrame(loop);
        else{
            ctx.fillText(txt[i], x, 90);
            x += ctx.measureText(txt[i++]).width + ctx.lineWidth * Math.random();
            dashOffset = dashLen;
            ctx.setTransform(1, 0, 0, 1, 0, 3 * Math.random());
            ctx.rotate(Math.random() * 0.005);

            if(i < txt.length) requestAnimationFrame(loop);
        }

    }
}



/* ------------- TO CREATE NORMAL MATHJAX ------------- */

function addNormalMathJax(){

    let content = document.getElementById("input-mathjax").value;

    MathJax.Hub.Register.StartupHook("End", () => {
        let contentSpan = MathJax.HTML.addElement(
            container,
            "span",
            {id: "fixedTextMathJax", style: {top: "200px", left: "100px", visibility: "hidden"}},
            [content]
        );

        MathJax.Hub.Queue(["Typeset", MathJax.Hub, contentSpan], () => {
            // contentSpan.css("visibility", "");
        });

    });
}



/* ------------- TO CREATE ANIMATED MATHJAX ------------- */
// Not yet working!!

function addAnimatedMathJax(){

    let content = document.getElementById("input-animated-mathjax").value;

    MathJax.Hub.Register.StartupHook("End", () => {

        // creates and adds a span element containing the SVG
        let contentSpan = MathJax.HTML.addElement(
            container,
            "span",
            {id: "animatedTextMathJax", style:
                    {
                        top: "100px",
                        left: "100px",
                        visibility: "hidden",
                    }},
            [content]
        );

        MathJax.Hub.Queue(["Typeset", MathJax.Hub, contentSpan], () => {
            contentSpan.style.visibility = "visible";
        });

        MathJax.Hub.Queue(() => {

            // gets the parent SVG element
            let mathJaxSpans = document.querySelectorAll("#animatedTextMathJax > .MathJax_SVG_Display > .MathJax_SVG");
            let numSpans = mathJaxSpans.length;

            // set the fill color as transparent
            for(let i = 0; i < numSpans; i++){
                let mainSVG = mathJaxSpans[i].querySelector(":scope > svg").querySelector(":scope > g");
                mainSVG.setAttribute("fill", "transparent");

            }

            // selects all the path like objects like <path>, <rect> etc.
            let allThePaths = document.querySelectorAll("g :not(g)");
            for (let i = 0; i < allThePaths.length; i++){
                allThePaths[i].setAttribute("class", "path");   // CHANGE THIS!!!!!!!!! as it will remove the already present classes
                allThePaths[i].setAttribute("stroke-width", "30");
                allThePaths[i].setAttribute("stroke", "solid");
            }

            // adds the required animation
            let pathElem = document.getElementsByClassName("path");
            for(let i = 0;i<pathElem.length;i++)
            {
                let length = pathElem[i].getTotalLength();
                pathElem[i].style["stroke-dasharray"] = length;
                pathElem[i].style["stroke-dashoffset"] = length;
            }
            let cnt = 0;
            function loop() {
                setTimeout(() => {
                    let animationTime = 1;
                    pathElem[cnt].style.animation = "dash-and-fill " + animationTime + "s linear forwards";
                    cnt++;
                    if (cnt !== pathElem.length)
                        loop();
                        }, 200);
            }
            loop();
        });


    });



}
