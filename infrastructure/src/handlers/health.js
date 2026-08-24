exports.handler = async (event) => {
  console.log("Health check event:", JSON.stringify(event));
  
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    },
    body: JSON.stringify({
      status: "ok",
      service: "agam-api"
    }),
  };
};
