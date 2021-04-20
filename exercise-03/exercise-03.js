// Setup Express
const express = require("express");
const app = express();
const port = 3000;

// Setup Handlebars
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Setup fs
const fs = require("fs");

// Setup jimp
const jimp = require("jimp");

// Setup body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false}));

// Setup multer (files will temporarily be saved in the "temp" folder).
const path = require("path");
const multer = require("multer");
const upload = multer({
    dest: path.join(__dirname, "temp")
});

// Make the "public" folder available statically
app.use(express.static(path.join(__dirname, "public")));

// When navigating to "/", show the image gallery.
app.get("/", function (req, res) {

    let fileNames = fs.readdirSync("./public/images");
    const allowedFileTypes = [".bmp", ".jpg", ".jpeg", ".png", ".gif"];
    fileNames = fileNames.filter(function(fileName) {
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
        return allowedFileTypes.includes(extension);
    });

    res.locals.images = fileNames;

    res.render("gallery");
});

// When we POST to /uploadImage, accept the image upload, and move it to the images folder.
// Then, create a thumbnail for it using jimp.
app.post("/uploadImage", upload.single("imageFile"), async function(req, res) {

    const fileInfo = req.file;

    // Move the image into the images folder
    const oldFileName = fileInfo.path;
    const newFileName = `./public/images/${fileInfo.originalname}`;
    fs.renameSync(oldFileName, newFileName);

    // TODO Create and save thumbnail

    const image = await jimp.read(newFileName);
    image.resize(320, jimp.AUTO);
    await image.write(`./public/images/thumbnails/${fileInfo.originalname}`);

    res.locals.fileName = fileInfo.originalname;
    res.render("uploadDetails");

});

// Start the server running. Once the server is running, the given function will be called, which will
// log a simple message to the server console. Any console.log() statements in your node.js code
// can be seen in the terminal window used to run the server.
app.listen(port, function() {
    console.log(`Example app listening on port ${port}!`);
});