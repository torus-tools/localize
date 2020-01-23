var fs = require("fs");
var AWS = require('aws-sdk');
require('dotenv').config();

var translate = new AWS.Translate({apiVersion: '2017-07-01'});

var elements = [
  'title',
  'h1', 
  'h2', 
  'h3', 
  'h4', 
  'h5', 
  'h6',
  'p',
  'a', 
  'div',
  'span',
  'small',
  'img',
  'table',
  'thead',
  'tbody',
  'th',
  'td',
  'li',
  'form',
  'input',
  'label',
  'select',
  'option',
  'textarea',
  'nav',
  'footer',
]

function translateHtml(from, to){
  createDir('locales', function(err, data){
    if(err) console.log(err)
    else{
      createFile(`locales/${from}.json`, '{}') 
      if(fs.existsSync(from)){
        if(fs.statSync(from).isDirectory()){
          fs.readdirSync(from).forEach(function(name){
            if(name.includes(".html")){
              findElements(name, from, to, function(err, data){
                if(err) console.log(err)
                else {
                  console.log(data)
                }
              })
            }
          })
        }
      }
      else if(fs.existsSync(`${from}.html`)) {
        let name = `${from}.html`
        if(fs.statSync(name).isFile()){
          fs.readFile(name, 'utf8', function(err, data){
            if(err) console.log(err)
            else {
              var html = data
              var newhtml = data
              findElements(name, from, to, function(err, data){
                if(err) console.log(err)
                else{
                  translateLocale(name, from, to, data, function(err, data){
                    if(err) console.log(err)
                    else{
                      buildFromLocale(name, from, to, function(err, data){
                        if(err) console.log(err)
                        else console.log('All Done!')
                      })
                    }
                  })
                }
              })
            }
          })
        }
      }
      else {
        let err = 'No html file or directory'
        console.log(err)
        throw new Error(err)
      }
    }
  })
}

function findElements(filename, from, to, callback){
  //read file
  var html = fs.readFileSync(filename, 'utf8')
  var body = html.split('</head>')[1]
  var size = 0
  let html1 = html
  //let html2 = html
  for(key of elements){
    let elem = `<${key}`
    if(body.includes(elem)){
      let arr = body.split(elem)
      for(i = 1; i<arr.length; i++){
          let fragment = arr[i];
          let piece = fragment.split(`</${key}>`)[0];
          let attributes = piece.split('>')[0];
          let text = piece.split('>')[1];
          let id = text.substr(0, 12).replace(/\s/g, '_')
          let frag = `<${key}` + piece + `</${key}>`
          if(text.replace(/\s/g, '').length){
            if(text.includes("<")){
              if(text.split("<")[0].replace(/\s/g, '').length){
                text = text.split("<")[0]
                id = text.substr(0, 12).replace(/\s/g, '_')
                if(attributes.includes('id="')){
                  let preid = attributes.split('id="')[1];
                  id = preid.split('"')[0]
                  addVar(from, id, text)
                  size += 1
                }
                else {
                  let newfrag = `<${key}` + ` id="${id}"` + piece + `</${key}>`
                  html1 = html1.replace(frag, newfrag);
                  addVar(from, id, text)
                  size += 1
                }
              }
            }
            else {
              if(attributes.includes('id="')){
                let preid = attributes.split('id="')[1];
                id = preid.split('"')[0]
                addVar(from, id, text)
                size +=1
              }
              else {
                let newfrag = `<${key}` + ` id="${id}"` + piece + `</${key}>`
                html1 = html1.replace(frag, newfrag);
                addVar(from, id, text)
                size += 1
              }
            }       
        } 
      }
      
    }
  }
  fs.writeFileSync(filename, html1);
  callback(null, size)
}

function translateLocale(filename, from, to, size, callback){
  createFile(`locales/${to}.json`, '{}')
  var translation = {}
  let rawdata = fs.readFileSync(`locales/${from}.json`, 'utf8'); 
  let input = JSON.parse(rawdata);
  let i = 0;
  console.log(input)
  Object.keys(input).map(function(key, index){
    var params = {
      SourceLanguageCode: from,
      TargetLanguageCode: to,
      Text: input[key]
    };
    translate.translateText(params, function(err, data) {
      if (err) console.log(err, err.stack); 
      else {
        translation[key] = data.TranslatedText
        addVar(to, key, data.TranslatedText)
        i += 1
        console.log(i, '/', size)  
        if(i >= size){
          callback(null, translation)
        }
      }
    })
  })   
}

function buildFromLocale(filename, from, to, callback){
  let rawdata = fs.readFileSync(`locales/${to}.json`, 'utf8'); 
  var translations = JSON.parse(rawdata); 
  var html = fs.readFileSync(filename, 'utf8')
  var body = html.split('</head>')[1]
  let html2 = html
  for(key of elements){
    let elem = `<${key}`
    if(body.includes(elem)){
      let arr = body.split(elem)
      for(i = 1; i<arr.length; i++){
          let fragment = arr[i];
          let piece = fragment.split(`</${key}>`)[0];
          let attributes = piece.split('>')[0];
          let text = piece.split('>')[1];
          let id = text.substr(0, 12).replace(/\s/g, '_')
          let frag = `<${key}` + piece + `</${key}>`
          if(text.replace(/\s/g, '').length){
            if(text.includes("<")){
              if(text.split("<")[0].replace(/\s/g, '').length){
                text = text.split("<")[0]
                id = text.substr(0, 12).replace(/\s/g, '_')
                if(attributes.includes('id="')){
                  let preid = attributes.split('id="')[1];
                  id = preid.split('"')[0]
                  let translatedpiece = piece.replace(text, translations[id])
                  let newfrag = `<${key}` + ` id="${id}"` + translatedpiece + `</${key}>`
                  html2 = html2.replace(frag, newfrag);
                }
              }
            }
            else {
              if(attributes.includes('id="')){
                let preid = attributes.split('id="')[1];
                id = preid.split('"')[0]
                let translatedpiece = piece.replace(text, translations[id])
                let newfrag = `<${key}` + ` id="${id}"` + translatedpiece + `</${key}>`
                html2 = html2.replace(frag, newfrag);
              }
            }       
        } 
      }
      
    }
  }
  fs.writeFileSync(`${to}.html`, html2);
  callback(null, 'success')
}

function addVar(filename, variable, value, callback){
  let rawdata = fs.readFileSync(`locales/${filename}.json`, 'utf8'); 
  obj = JSON.parse(rawdata); 
  obj[variable] = value;
  jsonString = JSON.stringify(obj);
  fs.writeFileSync(`locales/${filename}.json`, jsonString);
  if(callback && typeof callback === 'function') callback(null, 'Success');
  else return 'Success';
}

function createFile(file, contents) {
  if(fs.existsSync(file)){
    let err = `file ${file} already exists`
    console.log(err)
    let excontent = fs.readFileSync(file, 'utf8')
    return excontent;
  }
  else {
    fs.writeFile(file, contents, (err) => {
      if (err) {
        throw new Error(err);
      }
      else {
        return contents
      }
    })
  }
}

function createDir(dir, callback){
  if (fs.existsSync(dir)){
    let err = (`directory ${dir} already exists`)
    if(callback && typeof callback === 'function') callback(null, err)
    else return err
  }
  else {
    fs.mkdir(dir, (err) => {
      if (err) {
        if(callback && typeof callback === 'function') callback(new Error(err))
        else throw new Error(err);
      }
      else {
        let data = `Created the ${dir} directory`
        if(callback && typeof callback === 'function') callback(null, data)
        else return data;
      }
    });
  }
}

translateHtml('en', 'es')

/* buildFromLocale('en.html', 'en', 'es', function(err, data){
  if(err) console.log(err)
  else console.log('All Done!')
}) */