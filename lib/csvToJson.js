module.exports = function csvToJson(csv){
  return new Promise((resolve, reject) => {
    let csvBody = csv.substr(csv.indexOf('\n')+1)
    console.log(csvBody)
    let csvArr = csvBody.split('\n')
    let obj = {}
    for(let key of csvArr){
      //console.log(key)
      let keyVal = key.split(',')
      if(key.includes(',"')) keyVal = key.split(',"')
      if(keyVal[1]) {
        let keytrim = keyVal[1].trim()
        //console.log(keyVal[0], '  ', keyVal[1].substr(0, keyVal[1].length-1))
        obj[keyVal[0]] = keytrim.substr(0, keytrim.endsWith('"')?keytrim.length-1:keytrim.length)
      }
    }
    console.log(JSON.stringify(obj))
    resolve(JSON.stringify(obj))
  })
}