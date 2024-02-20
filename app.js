const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Connexion à la base de données via la librairie mongoose
mongoose.connect("mongodb+srv://user:user@cluster0.qwzrrfy.mongodb.net/todolist")
    .then(() => {
        console.log("Connected to MongoDB");
        // Connexion au port 3001 au cas où la connexion avec la DB est établie
        app.listen(3001, () => console.log('Server is running on port 3001'));
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });

// Modèle Tâche
const taskScheme = {
    name: String,
    desc: String,
};
// Connexion du modèle avec la base de données via Compass
const Task =
    mongoose.model("Task", taskScheme);

// Différentes utilisations des librairies pour l'application
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// On créé ou update une tâche
app.post("/post", async function (req, res) {
    try {
        if (req.body.id) {
            const filter = {_id: req.body.id};
            const replacedTask = {
                name: req.body.name,
                desc: req.body.desc,
            };
            await Task.replaceOne(filter, replacedTask);
        } else {
            const task = new Task({
                name: req.body.name,
                desc: req.body.desc,
            });
            await task.save();
        }
        res.redirect('/');
    } catch (err) {
        res.status(500).send("Error adding task: " + err.message);
    }
});

// On affiche le formulaire (rempli si un id de tâche est passé en paramètre)
app.post("/form", async function (req, res) {
    const task = false;
    res.render('form', {task});
});

// Cas où le bouton update est pressé
app.post("/update/:taskID", async function (req, res) {
    const task = await Task.findById(req.params.taskID);
    res.render('form', {task});
});

// On delete la tâche passée en paramètre
app.post("/delete/:taskID", async function (req, res) {
    await Task.deleteOne({ _id: req.params.taskID });
    res.redirect('/');
    // const tasks = await Task.find();
    // res.render('list', {tasks});
});

// Affichage en liste des tâches (stylisé par mes soins)
app.post('/', async function (req, res) {
    try {
        const tasks = await Task.find();
        res.render('list', {tasks});
    } catch (err) {
        res.status(500).send("Error fetching tasks: " + err.message);
    }
});