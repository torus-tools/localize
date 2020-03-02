require('dotenv').config();
var fs = require("fs");
var AWS = require('aws-sdk');
var translate = new AWS.Translate({apiVersion: '2017-07-01'});
var {createDir, createFile} = require('./build')

module.exports = function TranslateLocale(filename, from, to, size, callback){
  createDir(`locales/${to}`, function(err, data){
    if(err) console.log(err)
    else{
      createFile(`locales/${to}/${filename}.json`, '{}') 
    }
  });
  var translation = {}
  let rawdata = fs.readFileSync(`locales/${from}/${filename}.json`, 'utf8'); 
  let input = JSON.parse(rawdata);
  let i = 0;
  //console.log(input)
  Object.keys(input).map(function(key, index){
    //if(key === 'a' || key === 'img') copy the object
    var params = {
      SourceLanguageCode: from,
      TargetLanguageCode: to,
      Text: input[key]
    };
    translate.translateText(params, function(err, data) {
      if (err) console.log(err, err.stack); 
      else {
        translation[key] = data.TranslatedText
        addVar(`${to}/${filename}`, key, data.TranslatedText)
        i += 1
        console.log(i, '/', size)  
        if(i >= size){
          callback(null, translation)
        }
      }
    })
  })   
}