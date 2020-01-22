var fs = require("fs");
var AWS = require('aws-sdk');
require('dotenv').config();

var translate = new AWS.Translate({apiVersion: '2017-07-01'});

/* var elements = [
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
] */

var elements = [
  'li'
]

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
                //else console.log('YES')//saveFile(name, to, data)
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
  let html1 = html
  //let html2 = html
  for(key of elements){
    let elem = `<${key}`
    if(body.includes(elem)){
      let arr = body.split(elem)
      for(i = 1; i<arr.length; i++){
          let fragment = arr[i];
          let piece = fragment.split(`</${key}>`)[0];
          let attributes = piece.split('>')[0]
          let text = piece.split('>')[1];
          
          if(text.length >= 1){
            let id = text.substr(0, 12).replace(/\s/g, '_')
            let frag = `<${key}` + piece + `</${key}>`
            if(html1.includes(frag)){
              console.log(text)
              /* var params = {
                SourceLanguageCode: from,
                TargetLanguageCode: to,
                Text: text
              };
              translate.translateText(params, function(err, data) {
                if (err) console.log(err, err.stack); 
                else {
                  let translation =  data.TranslatedText;
                  let newpiece = piece.replace(text, translation) */
                  //console.log(newpiece)
                  if(attributes.includes('id="')){
                    let preid = attributes.split('id="')[1];
                    id = preid.split('"')[0]
                    addVar(from, id, text)
                    //let translatedfrag = `<${key}` + newpiece + `</${key}>`
                    //html2.replace(frag, translatedfrag);
                  }
                  else {
                    let newfrag = `<${key}` + ` id="${id}"` + piece + `</${key}>`
                    html1 = html1.replace(frag, newfrag);
                    addVar(from, id, text)
                    //let translatedfrag = `<${key}` + ` id=${id}` + newpiece + `</${key}>`
                    //html2.replace(frag, translatedfrag);
                  }
                  //add to json file
                  
                  //addVar(to, id, translation)
                  //callback(null, {"html1":html1, "html2":html2})
                //}
              //}); 
            
            
          }
        } 
      }

      // save file
      
    }
  }
  // write file
  fs.writeFileSync(filename, html1);
  callback(null, html1)
}

var ignoredElems = [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '</body>',
  '</html>',
  '\t',
  '\n'
]

/* function ignoreHead(html){
  let headbody = html.split('<head>')
  let head = headbody.split('</head>')
  //translate title
  //translate description
  html.replace(head, "")
  for(ele of ignoredElems){
    html.replace(ele, "")
  }
  return html
} */




function ignoreScripts(html){
  let start = '<script';
  let ending = '</script>' 
  if(html.includes(start)){
    let arr = html.split(start)
    for(script of arr){
      script.replace(script.split(ending)[0], "")
    }
  }
  return html
}

function saveFile(name, to, data) {
  //console.log(data.html2)
  fs.writeFileSync(name, data.html1);
  if(name.includes('/')){
    let filearr = name.split('/')
    let newname = to + '/' + filearr[1];
    fs.writeFileSync(newname, data.html2);
  }
  else {
    //console.log(data)
    fs.writeFileSync(`${to}.html`, data.html2);
  }
}

function saveText(filename, html1, html2, piece, key, text, attributes, from, to, callback){
  if(text.replace(/\s/g, '').length){
    let id = text.substr(0, 12).replace(/\s/g, '_')
    let frag = `<${key}` + piece + `</${key}>`
    if(html1.includes(frag)){
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
          //console.log(newpiece)
          if(attributes.includes("id=")){
            id = attributes.split('id=')[1];
            let translatedfrag = `<${key}` + newpiece + `</${key}>`
            html2.replace(frag, translatedfrag);
          }
          else {
            let newfrag = `<${key}` + ` id=${id}` + piece + `</${key}>`
            html1.replace(frag, newfrag);
            let translatedfrag = `<${key}` + ` id=${id}` + newpiece + `</${key}>`
            html2.replace(frag, translatedfrag);
          }
          addVar(from, id, text)
          addVar(to, id, translation)
          callback(null, {"html1":html1, "html2":html2})
        }
      });
    }
  }
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