const express = require('express')
const app = express()
const bodyParser = require('body-parser');
require('dotenv/config');
const methodOverride = require('method-override');
const route = require('./routes/routes');
const connection = require('./config/connection');
const expressSanitizer = require('express-sanitizer')
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());
app.use(methodOverride('_method'))
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(expressSanitizer());
app.use(route);

const  port = process.env.PORT || '3000'
app.listen(port, err => {
    if (err) throw err
    console.log('Server listening on port', port);
    connection();
})
