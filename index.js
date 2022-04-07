const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3000

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(express.json());

app.get('/', (request, response) => {
    console.log("REQUEST HIT /");
    return response.status(200).json({"status": "ok"})
})

app.get('/dump', (request, response) => {
    return db.dumpLinks(request, response)
})

app.post('/getLinks', async (request, response) => {
    let query = request.body;
    if (!query["graph"]) {
        return response.status(400).json({"error": "Query should have a graph field"})
    }
    let links;
    //source; cases source, source & predicate, source & target
    if (query["source"] && !query["predicate"] && !query["target"]) {
        links = await db.queryLinksSource(query["graph"], query["source"])
    }
    if (query["source"] && query["predicate"] && !query["target"]) {
        links = await db.queryLinksSourcePredicate(query["graph"], query["source"], query["predicate"])
    }
    if (query["source"] && query["target"] && !query["predicate"]) {
        links = await db.queryLinksSourceTarget(query["graph"], query["source"], query["target"])
    }

    //predicate; cases predicate, predicate & target
    if (query["predicate"] && !query["source"] && !query["target"]) {
        links = await db.queryLinksPredicate(query["graph"], query["predicate"])
    }
    if (query["predicate"] && query["target"] && !query["source"]) {
        links = await db.queryLinksPredicateTarget(query["graph"], query["predicate"], query["target"])
    }

    //target; cases target
    if (query["target"] && !query["source"] && !query["predicate"]) {
        links = await db.queryLinksTarget(query["graph"], query["target"])
    }
    
    links = links.map((link) => link.link_expression);
    //filter results with from & until dates
    function fromDateFilter(link) {
        const reverse = new Date(query["fromDate"]) >= new Date(query["untilDate"]);
        if (reverse) {
            return new Date(link["timestamp"]) <= new Date(query["fromDate"])
        } else {
            return new Date(link["timestamp"]) >= new Date(query["fromDate"])
        }
    }

    function untilDateFilter(link) {
        const reverse = new Date(query["fromDate"]) >= new Date(query["untilDate"]);
        if (reverse) {
            return new Date(link["timestamp"]) >= new Date(query["untilDate"])
        } else {
            return new Date(link["timestamp"]) <= new Date(query["untilDate"])
        }
    }

    function limitFilter(results) {
        const reverse = new Date(query["fromDate"]) >= new Date(query["untilDate"]);
        if (query["limit"]) {
            const startLimit = reverse ? results.length - query.limit : 0;
            const endLimit = reverse ? (results.length - query.limit) + query.limit : query.limit;
            return results.slice(startLimit, endLimit)
        }

        return results;
    }

    if (query["fromDate"]) links = links.filter(fromDateFilter)
    if (query["untilDate"]) links = links.filter(untilDateFilter)
    links = limitFilter(links);
    return response.status(200).json(links)
})

app.post('/addLink', (request, response) => {
    let link = request.body;
    //Check LinkExpression
    if (!link["data"]) {
        return response.status(400).json({"error": "LinkExpression should have a data field"})
    }
    if (!link["author"]) {
        return response.status(400).json({"error": "LinkExpression should have an author field"})
    }
    if (!link["timestamp"]) {
        return response.status(400).json({"error": "LinkExpression should have a timestamp field"})
    }
    if (!link["graph"]) {
        return response.status(400).json({"error": "LinkExpression should have a graph field"})
    }
    //Check LinkData
    if (!link["data"]["source"]) {
        return response.status(400).json({"error": "LinkExpression data should have a source field"})
    }
    if (!link["data"]["target"]) {
        return response.status(400).json({"error": "LinkExpression data should have a target field"})
    }
    db.addLink(link["data"]["source"], link["data"]["predicate"], link["data"]["target"], link["graph"], link["timestamp"], link)
    return response.status(200).json({"status": "Link Added"})
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
})