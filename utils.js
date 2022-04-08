function validateLinkData(link) {
    //Check LinkExpression
    if (!link["data"]) {
        return {"error": "LinkExpression should have a data field"}
    }
    if (!link["author"]) {
        return {"error": "LinkExpression should have an author field"}
    }
    if (!link["timestamp"]) {
        return {"error": "LinkExpression should have a timestamp field"}
    }
    if (!link["graph"]) {
        return {"error": "LinkExpression should have a graph field"}
    }
    //Check LinkData
    if (!link["data"]["source"]) {
        return {"error": "LinkExpression data should have a source field"}
    }
    if (!link["data"]["target"]) {
        return {"error": "LinkExpression data should have a target field"}
    }
    return true;
}

module.exports = {
    validateLinkData
}