const express = require('express');
const app = express();
const morgan = require('morgan');
var cors = require ('cors');

const port = 3001

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
morgan(':method :url :status :res[content-length] - :response-time ms');


app.get("/", function (req, res) {
    res.send("TRABAJO INTEGRADOR");
});

const usuarioCont = require("./usuarioController.js");
app.use("/api/usuario",usuarioCont);

const alumnoCont = require("./alumnosController.js");
app.use("/api/alumno",alumnoCont);

const cursoCont = require("./cursoController.js");
app.use("/api/curso",cursoCont);

const securityCont = require("./security.js");
app.use("/api/security",securityCont.app);

app.listen(port, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server iniciado en puerto:${port}`);
    }
});