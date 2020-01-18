var fs = require("fs");
var AWS = require('aws-sdk');
require('dotenv').config();

var translate = new AWS.Translate({apiVersion: '2017-07-01'});

var elements = [
  'h1', 
  'h2', 
  'h3', 
  'h4', 
  'h5', 
  'h6',
, 'p', 
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
  'header',
  'footer',
]

function createFile(file, contents) {
  console.log(contents)
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
        console.log(`Created the ${file} file`)
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

function translateHtml(from, to){
  createDir('locales', function(err, data){
    if(err) console.log(err)
    else{
      createFile(`locales/${from}.json`, '{}')
      createFile(`locales/${to}.json`, '{}')  
      if(fs.existsSync(from)){
        if(fs.statSync(from).isDirectory()){
          fs.readdirSync(from).forEach(function(name){
            if(name.includes(".html")){
              var html = fs.readFileSync(name, 'utf8')
              var newhtml = html
              findElements(name, to, html, newhtml, function(err, data){
                if(err) console.log(err)
                else console.log(data)
              })
            }
          })
        }
      }
      else if(fs.existsSync(`${from}.html`)) {
        let name = `${from}.html`
        if(fs.statSync(name).isFile()){
          var html = fs.readFileSync(name, 'utf8')
          var newhtml = html
          findElements(name, from, to, html, newhtml, function(err, data){
            if(err) console.log(err)
            else console.log(data)
          })
        }
      }
      else {
        let err = 'No html file'
        console.log(err)
        throw new Error(err)
      }
    }
  })
}

function findElements(filename, from, to, html, newhtml, callback){
  for(key of elements){
    let elem = `<${key}`
    console.log('HTML', html)
    if(html.includes(elem)){
      console.log(elem)
      let arr = html.split(elem)
      for(i = 0; i<arr.length; i++){
          let fragment = arr[i];
          let pieces = fragment.split(`${key}/>`);
          for(piece of pieces){
            console.log(piece)
            let attributes = piece.split('>')[0];
            let text = piece.split('>')[1];
            if(text.length >= 1){
              saveText(html, newhtml, piece, key,  text, attributes, from, to)
              /* if(text.includes("<")){
                let str = text.split("<")
                if(str[0].length >= 1){
                  saveText(html, newhtml, piece, key, str[0], attributes, from, to)
                }
                let subelems = '<'+ str[1]
                findElements(subelems, from, to, html, newhtml, callback)
              }
              else {
                saveText(html, newhtml, piece, key,  text, attributes, from, to)
              } */ 
            }
          }
      }
    }
  }
  fs.writeFileSync(filename, html);
  if(filename.includes('/')){
    let filearr = filename.split('/')
    let newfilename = to + '/' + filearr[1];
    fs.writeFileSync(newfilename, newhtml);
  }
  else {
    fs.writeFileSync(`${to}.html`, newhtml);
  }
}

function saveText(html1, html2, piece, key, text, attributes, from, to){
  let id = text.substr(0, 12);
  let frag = `<${key}` + piece + `${key}/>`
  var params = {
    SourceLanguageCode: from,
    TargetLanguageCode: to,
    Text: text
  };
  translate.translateText(params, function(err, data) {
    if (err) console.log(err, err.stack); 
    else {
      let translation =  data.TranslatedText;
      let newpiece = piece.replace(text, translation)
      if(attributes.includes("id=")){
        id = attributes.split('id=')[1];
        let translatedfrag = `<${key}` + newpiece + `${key}/>`
        html2.replace(frag, translatedfrag)
      }
      else {
        let newfrag = `<${key}` + `id=${id}` + piece + `${key}/>`
        html1.replace(frag, newfrag)
        let newtranslatedfrag = `<${key}` + `id=${id}` + newpiece + `${key}/>`
        html2.replace(frag, newtranslatedfrag)
      }
      addVar(from, id, text)
      addVar(to, id, translation)
    }
  });
}

 function addVar(filename, variable, value, callback){
  let rawdata = fs.readFileSync(`locales/${filename}.json`); 
  obj = JSON.parse(rawdata); 
  obj[variable] = value;
  jsonString = JSON.stringify(obj);
  fs.writeFileSync(`locales/${filename}.json`, jsonString);
  if(callback && typeof callback === 'function') callback(null, 'Success');
  else return 'Success';
}

translateHtml('en', 'es')