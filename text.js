    signature();
    tutorial();

function signature(){
    var signature = document.createElement('div');
    signature.style.position = 'absolute';
    //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
    signature.style.width = 50;
    signature.style.height = 20;
    signature.style.bottom = 20 + 'px';
    signature.style.right = 20 + 'px';
    signature.style.color = "#ffffff";
    signature.style.opacity = "0.6";
    signature.style.fontSize = "14px";
    signature.style.textAlign = "right";
    signature.innerHTML = "Ocean & Sun - M.Y</br>Three.js and GLSL experience";

    document.body.appendChild(signature);
}

function tutorial(){
    var signature = document.createElement('div');
    signature.style.position = 'absolute';
    //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
    signature.style.width = 50;
    signature.style.height = 20;
    signature.style.top = 60 + 'px';
    signature.style.right = 20 + 'px';
    signature.style.color = "#ffffff";
    signature.style.opacity = "1";
    signature.style.fontSize = "20px";
    signature.style.textAlign = "right";
    signature.innerHTML = "Try to change the 'sun height' value above from 1 to 50,</br>or drag the blue bar left or right.";

    document.body.appendChild(signature);
}
