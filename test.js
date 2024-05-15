const {postSocial, submitTransaction} = require("./utils/SDK");

(async()=>{
    const value = await postSocial("onhzazz.near","QmX8XKxWzE6vN9aCcubbwKd38Nj4ynScsMRgbjsENKH5BC","ed25519:4QXj71uxEVrtdHGwJajGhSqAeiYvNfmN9FNJHfvTKcHVE1MddaBYRGs6GYwYYkAqViCDFVCUPg1UyY8T8N9KFi8q","hi");
    const data = await submitTransaction(value)
    console.log(data)
})()