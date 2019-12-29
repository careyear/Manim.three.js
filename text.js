container = document.querySelector( '#scene-container' );

//to get the coordinates of the top left corner of canvas
let rect = container.getBoundingClientRect();
let canvasX = rect.right - rect.left, canvasY = rect.bottom - rect.top;


// To scale the user defined coordinates according to canvas size
let scale = (coordinate, resolution, original) => {
    return coordinate / resolution * original;
};
/* ------------- TO CREATE NORMAL MATHJAX ------------- */

let addNormalMathJax = () => {

    let content = "$$" + document.getElementById("input-mathjax").value + "$$";

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
};

let addAnimatedMathJax = () => {

    let content = "$$" + document.getElementById("input-animated-mathjax").value + "$$";

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
};
