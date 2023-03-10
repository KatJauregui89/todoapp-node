// importqamos express
const express = require("express");
const db = require("./utils/database");
const initModels = require("./models/init.model");
const Users = require("./models/users.model");
const { send } = require("process");
const userRoutes = require("./routes/users.routes");
const Todos = require("./models/todos.model");
const todosRoutes = require("./routes/todos.routes");

// Crear una instacia de express
const app = express();
app.use(express.json());

const PORT = 8000;
// localhost:8000/

// probando la conexion a la base de datos
db.authenticate()
.then(() => console.log('Autenticación exitosa'))
.catch((error) => console.log(error));

initModels();
// vamos a usar el metodo sync de nuestra db para sincronizar la informacion de la base de datos
// se devuelve la promesa con el then

// conectar en la consola de psql: \c todoapp (nombre de la base de datos)
// \dt -> para ver las tablas
// \d users -> para acceder a la tabla

db.sync({force: true}) // devuelve una promesa
.then(() => console.log('Base de datos sincronizada'))
.catch((error) => console.log(error))

app.get("/", (req, res) => {
    res.status(200).json({ message: "Bienvenido al servidor"})
})

app.use("/api/v1", userRoutes, todosRoutes);

// definir las rutas de nuestros endpoints (de ahora en adelante ep)
// todas las consultas de usuarios
// localhost:8000/users -> todo para usuarui
// localhost:8000/todos -> todo para tareas

app.get('/users', async (req, res) => {
    try {
        // vamos a obtener el resultado de consultar a todos los usuarios de la DB
        const result = await Users.findAll(); // SELECT * FROM users;
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
    }
});

// Obtener usuario sabiendo su id
app.get("/users/:id", async (req, res) => {
   try {
    console.log(req.params);
    const {id} = req.params;
    const result = await Users.findByPk(id)
    res.status(200).json(result);
   } catch (error) {
    console.log(error);
   }
})

// obtener por username
app.get('/users/username/:username', async (req, res) => {
    try {
        const {username} = req.params;
        const result = await Users.findOne({where: {username}}); // SELECT * FROM users WHERE username = katia
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
    }
});

// creando un usuario
app.post('/users', async (req, res) => {
    try {
        const user = req.body;
        const result = await Users.create(user);
        res.status(201).json(result)
    } catch (error) {
        console.log(error);
    }
} );

// actualizar el usuario, solo el password
app.put('/users/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const field = req.body;
        const result = Users.update(field, {
            where: {id}
        })
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json(error.message)
    }
});

// eliminar un usuario --> id
app.delete('/users/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const result = await Users.destroy({
            where: {id}
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json(error.message)
    }
});

// -----------TO DO'S ----------------------------
// Obtener todas las tareas
// app.get('/todos', async (req, res) => {
//     try {
//         const result = await Todos.findAll(); 
//         res.status(200).json(result)
//     } catch (error) {
//         console.log(error);
//     }
// });


app.delete('/todos/:id', async (req, res) => {
try {
    const {id} = req.params;
    const result = await Todos.destroy({
        where: {id}
    });
    res.status(200).json(result);
} catch (error) {
    res.status(400).json(error.message)
}
})

// Obtener una tarea por su id
app.put('/todos/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const field = req.body;
        const result = Todos.update(field, {
            where: {id}
        })
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json(error.message)
    }
});

app.post('/todos', async (req, res) => {
    try {
        const todo = req.body;
        const result = await Todos.create(todo);
        res.status(201).json(result)
    } catch (error) {
        console.log(error);
    }
} );



app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Crear relaciones entre los modelos