exports.helloWorld = (req, res) => {
    let message = 'Hello World from Pulumi!';
    res.status(200).send(message);
  };