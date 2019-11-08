console.log("hello dev-server");
console.log("try live reload");

const h1 = document.createElement("h1");

document.body.appendChild(h1);
h1.innerText = "HELLO DEV SERVER";
const img = document.createElement("img");
img.src = require("../vue-app/hello.jpg");
img.width = 360;
document.body.appendChild(img);


/