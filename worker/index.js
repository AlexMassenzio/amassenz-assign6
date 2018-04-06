const redisConnection = require("./redis-connection");
const axios = require("axios");

let apiUrl = "https://pixabay.com/api/?key=8615327-210bcc4e4cae33ee5fd6d01e8&"

async function getPixabayData(searchTerm)
{
    let q = "q=" + searchTerm;
    console.log(apiUrl + q);
    const pixabayRes = await axios.get(apiUrl + q);

    return pixabayRes;
}

redisConnection.on("research", async (data, channel) => {

    let resultsData = data.msgData;

    let pixabayRes = await getPixabayData(data.msgData.search);

    resultsData.image = pixabayRes.data.hits[0].previewURL;
    console.log(resultsData.image);

    const sendResults = () => {
        redisConnection.emit("researchResponse", { results: resultsData });
    };

    sendResults();
});