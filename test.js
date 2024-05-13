const data={
    value:"a"
};
function Data(key,value){
    data[key] = value;
    return data;
}
console.log(Data("value",null))
console.log(data)