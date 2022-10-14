
const px = 5; //pixels per line to be compressed
const s = px * px; //amount of pixels in part to be compressed
//const size = 1.823358421; //line width in ppl to overlap gradient

let img;
document.getElementById("upload-file").onchange = function() {
    const file = this.files[0]
    const reader = new FileReader()
    if (!file) return
    reader.onload = function (e) {
        img = new Image();
        img.src = e.target.result;
    }
    reader.readAsDataURL(file)
}

document.getElementById("convert").onclick = function () {
    try {
        const a = convert()
        //console.log(a)
        const blob = new Blob([a], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const downloader = document.createElement("a", { style: "display: none" })
        downloader.href = url
        downloader.download = "mesh.lua"
        downloader.click()
        downloader.remove()
    } catch (err) {
        console.error(err)
        window.alert(err)
    }
}

function convert() {
    let index = 0;
    let color, r, g, b, a;

    let mesh = {
        vertexes: [],
        segments: [],
        colors: []
    };
    
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d", {willReadFrequently: true});
    ctx.clearRect(0,0, canvas.width, canvas.height)

    ctx.drawImage(img, 0, 0);
    
    for (y = 0; y < img.height; y += px) {
        for (x = 0; x < img.width; x += px) {
            const square = ctx.getImageData(x, y, px, px);
            r = 0, g = 0, b = 0, a = 0;
            for (i = 0; i < s; ++i) {
                r += square.data[i * 4];
                g += square.data[1 + i * 4];
                b += square.data[2 + i * 4];
                a += square.data[3 + i * 4];
            }
            r = Math.trunc(r / s);
            g = Math.trunc(g / s);
            b = Math.trunc(b / s);
            a = Math.trunc(a / s);
            
            mesh.vertexes.push([x + px     / 4 - img.width / 2, img.height / 2 - (y + px     / 4)]);
            mesh.vertexes.push([x + px * 3 / 4 - img.width / 2, img.height / 2 - (y + px     / 4)]);
            mesh.vertexes.push([x + px * 3 / 4 - img.width / 2, img.height / 2 - (y + px * 3 / 4)]);
            mesh.vertexes.push([x + px     / 4 - img.width / 2, img.height / 2 - (y + px * 3 / 4)]);
            
            mesh.segments.push([index, index + 1, index + 2, index + 3, index]);
            index += 4;
            
            color = ((r * 256 + g) * 256 + b) * 256 + a;
            for (i = 0; i < 4; ++i) {
                mesh.colors.push(color);
            }
        }
    }
    let str;
    str = "meshes={{vertexes={"
    for (let i of mesh.vertexes) {
        str += `{${i[0]},${i[1]}},`;
    }
    str += '},segments={';
    for (let i of mesh.segments) {
        str += `{${i[0]},${i[1]},${i[2]},${i[3]},${i[4]}},`;
    }
    str += '},colors={';
    for (let i of mesh.colors) {
        str += `0x${i.toString(16)},`;
    }
    str += '}}}';
    
    img = null;
    return str;
}