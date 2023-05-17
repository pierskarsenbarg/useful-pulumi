exports.handler = async (event, context) => {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    return {
        "message": "Hello World!"
    }
  };