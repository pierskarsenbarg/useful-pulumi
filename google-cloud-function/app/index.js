const pk = require("@pierskarsenbarg/pk-private-package");

exports.handler = (req, res) => {
    res.status(200).send(`Hello, ${pk.printMsg("Piers") || "World"}`);
};