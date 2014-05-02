var express = require('express'),
    http = require('http'),
    path = require('path'),
    main = require('./main'),
    app = express();

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var morgan  = require('morgan');

app.use(express.static(__dirname + '/public'));
app.use(morgan());

app.use(bodyParser({
    uploadDir: __dirname + '/uploads',
    keepExtensions: true
}));

app.use(methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, './uploads')));

app.post('/images', main.addImage); // endpoint to post new images
app.get('/images', main.getImages); // endpoint to get list of images

app.listen(3000, function () {
    console.log('PictureFeed server listening on port 3000');
});
