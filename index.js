const express = require('express')
const bodyParser = require('body-parser')
const db = require('./queries')
const utils = require('./utils')
const websockets = require('./websocket')

const port = 3000

const app = express()
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  )
app.use(express.json());

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}\n\n`);
});

websockets.socketServer(server);

process.on("message", (message) => {
    console.log(message);
});

app.get('/', (request, response) => {
    console.log("REQUEST HIT /");
    return response.status(200).json({"status": "ok"})
})

app.get('/dump', (request, response) => {
    return db.dumpLinks(request, response)
})

app.post('/getLinks', async (request, response) => {
    console.log("GetLinks link request");
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

    if (!query["source"] && !query["predicate"] && !query["target"]) {
        links = await db.getLinksForGraph(query["graph"])
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
    console.log("Add link request");
    let link = request.body;
    let validate = utils.validateLinkData(link);
    if (validate != true) {
        return response.status(400).json(validate)
    }
    let signalConnections = websockets.connections.filter(connection => connection.graph === link["graph"])
    db.addLink(link);
    signalConnections.forEach(connection => {
        console.log("emitting message to", connection["socket"].id);
        connection["socket"].emit("linkAdded", link);
    })
    return response.status(200).json({"status": "Link Added"})
})

app.post('/removeLink', async (request, response) => {
    console.log("Remove link request");
    let link = request.body;
    let validate = utils.validateLinkData(link);
    if (validate != true) {
        return response.status(400).json(validate)
    }
    await db.removeLink(link)
    return response.status(200).json({"status": "Link Removed"})
})
