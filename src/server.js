const express = require("express");
const nunjucks = require("nunjucks");
const Pool = require("pg").Pool;

const server = express();
// Configurar o servidor para apresentar arquivos estátivos
server.use(express.static("src/public"));
// Habilitar body do formulário
server.use(express.urlencoded({ extended: true }));

// Configurar conexão com o banco de dados.
const databaseConfig = require("./config/database");
const connection = new Pool(databaseConfig);

// Configura a template engine
nunjucks.configure("./", {
  express: server,
  noCache: true
});

server.get("/", (req, res) => {
  connection.query("SELECT * FROM donors", (err, result) => {
    if (err) {
      console.log(err.stack);
      return res.send("Erro no banco de dados!");
    }

    const donors = result.rows;

    return res.render("src/index.html", { donors });
  });
});

server.post("/", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const blood = req.body.blood;

  if (!name || !email || !blood) {
    return res.send("Todos os campos são obrigatórios");
  }

  const sql = `INSERT INTO public.donors (name, email, blood) values ($1, $2, $3);`;
  const values = [name, email, blood];

  connection.query(sql, values, err => {
    if (err) {
      console.log(err.stack);
      return res.send("Erro ao conectar com o banco de dados");
    }

    return res.redirect("/");
  });
});

server.listen(3333);
