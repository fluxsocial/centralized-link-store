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

const addLink = (source, predicate, target, graph, timestamp, linkExpression) => {
  delete linkExpression["graph"];
  pool.query(`INSERT INTO ${process.env.table}(source, predicate, target, graph, timestamp, link_expression) VALUES ($1, $2, $3, $4, $5, $6)`, 
    [
      source, 
      predicate, 
      target, 
      graph, 
      timestamp,
      linkExpression
    ])
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
  queryLinksSource,
  queryLinksPredicate,
  queryLinksTarget,
  queryLinksSourcePredicate,
  queryLinksSourceTarget,
  queryLinksPredicateTarget
}