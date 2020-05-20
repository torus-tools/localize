//var fs = require("fs");

module.exports = function exportCsv(lang, csv){
  //let filename = filepath.substr(filepath.lastIndexOf('/'), filepath.lastIndexOf('.'))
  //let rawdata = fs.readFileSync(filepath, 'utf8')
  return new Promise((resolve, reject) => {
    let csvArr = csv.split('\n')
    let obj = {}
    for(let i=1; i<csvArr.length; i++){
      let keyVal = csvArr[i].split(',')[0]
      obj[keyVal[0]] = keyVal[1]
    }
    resolve(obj)
    //fs.writeFileSync(`locales/${lang}/${filename}.json`, obj)
  })
}