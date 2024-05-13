const {getToken} = require("./utils/SDK")

async function Data(){
    const data = await getToken("louisdevzz.near");
    console.log(data)
}
Data()