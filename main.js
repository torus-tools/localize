var fs = require("fs");
var AWS = require('aws-sdk');
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
  if(fs.existsSync(file)){
    let err = `file ${file} already exists`
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
      var json1 = createFile(`locales/${from}.json`, {})
      var json2 = createFile(`locales/${to}.json`, {})  
      let dir = fs.statSync(from)
      if(dir.isDirectory()){
        fs.readdirSync(from).forEach(function(name){
          console.log(name)
          if(name.includes(".html")){
            var html = fs.readFileSync(name)
            var newhtml = html
            findElements(name, to, html, newhtml, function(err, data){
              if(err) console.log(err)
              else console.log(data)
            })
          }
        })
      }
      else if(fs.statSync(`${from}.html`).isFile()){
        let html = fs.readFileSync(name)
        findElements(`${from}.html`, from, to, html, newhtml, function(err, data){
          if(err) console.log(err)
          else console.log(data)
        })
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
  Object.keys(elements).map(function(key){
    let elem = `<${key}`
    if(html.includes(elem)){
      let arr = html.split(key)
      for(i = 0; i<arr.length; i++){
        if(arr[i].includes(elem)){
          let fragment = arr[i+1];
          let piece = fragment.split(`${key}/>`);
          let attributes = piece.split('>')[0];
          let text = piece.split('>')[1];
          if(text.length >= 1){
            if(text.includes("<")){
              let str = text.split("<")
              if(str[0].length >= 1){
                saveText(html, newhtml, piece, key, str[0], attributes, from, to)
              }
              let subelems = '<'+ str[1]
              findElements(subelems, callback)
            }
            else {
              saveText(html, newhtml, piece, key,  text, attributes, from, to)
            } 
          }
        }
      }
    }
  })
  if(filename.includes('/')){
    let filearr = filename.split('/')
    let newfilename = to + '/' + filearr[1];
  }
  fs.writeFileSync(filename, html);
  fs.writeFileSync(newfilename, newhtml);
}

function saveText(html1, html2, piece, key, text, attributes, from, to){
  let id = text.substr(0, 12);
  let frag = `<${key}` + piece + `${key}/>`
  let newpiece = piece.replace(text, translateString(text, from, to))
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
  addVar(to, id, translateString(text, from, to))
}


function translateString(text, from, to){
  var params = {
    SourceLanguageCode: from,
    TargetLanguageCode: to,
    Text: text
  };
  translate.translateText(params, function(err, data) {
    if (err) console.log(err, err.stack); 
    else return data;
  });
 }

 function addVar(filename, variable, value, callback){
  let obj = fs.readFileSync(`locales/${filename}.json`, 'utf8');  
  obj[variable] = value;
  jsonString = JSON.stringify(obj);
  fs.writeFileSync(`forms/${formName}/config.json`, jsonString);
  if(callback && typeof callback === 'function') callback(null, 'Success');
  else return 'Success';
}

translateHtml('en', 'es');