const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.database_port,
})

const dumpLinks = (request, response) => {
  pool.query(`SELECT * FROM ${process.env.table}`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const addLink = (linkExpression) => {
  const clone = JSON.parse(JSON.stringify(linkExpression))
  delete linkExpression["graph"];
  pool.query(`INSERT INTO ${process.env.table}(source, predicate, target, graph, timestamp, link_expression) VALUES ($1, $2, $3, $4, $5, $6)`, 
    [
      linkExpression["data"]["source"],
      linkExpression["data"]["predicate"],
      linkExpression["data"]["target"],
      clone["graph"],
      linkExpression["timestamp"],
      linkExpression
    ])
}

const removeLink = async (linkExpression) => {
  let predicate;
  if (!linkExpression["data"]["predicate"]) {
    let queryValues = [
      linkExpression["data"]["source"],
      linkExpression["data"]["target"],
      linkExpression["graph"],
      linkExpression["timestamp"],
      linkExpression["author"]
    ];
    await pool.query(`DELETE FROM ${process.env.table} WHERE source = ($1) AND target = ($2) AND graph = ($3) AND timestamp = ($4) AND link_expression ->> 'author' = ($5)`, queryValues)
  } else {
    let queryValues = [
      linkExpression["data"]["source"],
      predicate,
      linkExpression["data"]["target"],
      linkExpression["graph"],
      linkExpression["timestamp"],
      linkExpression["author"]
    ];
    await pool.query(`DELETE FROM ${process.env.table} WHERE source = ($1) AND predicate = ($2) AND target = ($3) AND graph = ($4) AND timestamp = ($5) AND link_expression ->> 'author' = ($6)`, queryValues)
  }
}

const getLinksForGraph = async (graph) => {
  const res = await pool.query(`SELECT * FROM ${process.env.table} WHERE graph = ($1)`, [graph])
  return res.rows;
}

// Source queries

const queryLinksSource = async (graph, source) => {
  const res = await pool.query(`SELECT * FROM ${process.env.table} WHERE source = ($1) AND graph = ($2)`, [source, graph])
  return res.rows;
}

const queryLinksSourcePredicate = async (graph, source, predicate) => {
  const res = await pool.query(`SELECT * FROM ${process.env.table} WHERE source = ($1) AND predicate = ($2) AND graph = ($3)`, [source, predicate, graph]);
  return res.rows;
}

const queryLinksSourceTarget = async (graph, source, target) => {
  const res = await pool.query(`SELECT * FROM ${process.env.table} WHERE source = ($1) AND target = ($2) AND graph = ($3)`, [source, target, graph]);
  return res.rows;
}

//Predicate queries

const queryLinksPredicate = async (graph, predicate) => {
  const res = await pool.query(`SELECT * FROM ${process.env.table} WHERE predicate = ($1) AND graph = ($2)`, [predicate, graph]);
  return res.rows;
}


const queryLinksPredicateTarget = async (graph, predicate, target) => {
  const res = await pool.query(`SELECT * FROM ${process.env.table} WHERE predicate = ($1) AND graph = ($2) AND target = ($3)`, [predicate, graph, targtet]);
  return res.rows;
}

//Target queries

const queryLinksTarget = async (graph, target) => {
  const res = await pool.query(`SELECT * FROM ${process.env.table} WHERE target = ($1) AND graph = ($2)`, [target, graph]);
  return res.rows;
}

module.exports = {
  dumpLinks,
  addLink,
  removeLink,
  getLinksForGraph,
  queryLinksSource,
  queryLinksPredicate,
  queryLinksTarget,
  queryLinksSourcePredicate,
  queryLinksSourceTarget,
  queryLinksPredicateTarget
}