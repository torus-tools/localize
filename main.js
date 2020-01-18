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
  'header',
  'footer',
]

function saveFile(name, to, data) {
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
              var headless = ignoreHead(html)
              var scriptless = ignoreScripts(headless)
              var newhtml = scriptless
              findElements(name, to, scriptless, newhtml, function(err, data){
                if(err) console.log(err)
                else {
                  saveFile(name, to, data)
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
              findElements(name, from, to, html, newhtml, function(err, data){
                if(err) console.log(err)
                else saveFile(name, to, data)
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

function findElements(filename, from, to, html, newhtml, callback){
  for(key of elements){
    let elem = `<${key}`
    if(html.includes(elem)){
      let arr = html.split(elem)
      for(i = 0; i<arr.length; i++){
          let fragment = arr[i];
          let piece = fragment.split(`</${key}>`)[0];
          let attributes = piece.split('>')[0];
          let text = piece.split('>')[1];
          if(text.length >= 1){
            //console.log(text)
            saveText(filename, html, newhtml, piece, key,  text, attributes, from, to, function(err, data){
              if(err) callback(err)
              else {
                html = data.html1;
                newhtml = data.html2
              }
            })
            /* if(text.includes("<")){
              let str = text.split("<")
              if(str[0].length >= 1){
                saveText(filename, html, newhtml, piece, key, str[0], attributes, from, to, function(err, data){
                  if(err) callback(err)
                  else {
                    html = data.html1;
                    newhtml = data.html2
                  }
                })
              }
              let subelems = '<'+ str[1]
              findElements(subelems, from, to, html, newhtml, callback)
            }
            else {
              saveText(filename, html, newhtml, piece, key,  text, attributes, from, to, function(err, data){
                if(err) callback(err)
                else {
                  html = data.html1;
                  newhtml = data.html2
                }
              })
            }*/
          }
          
      }
    }
  }
  callback(null, {"html1":html, "html2":newhtml})
}

var ignoredElems = [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '</body>',
  '</html>',
  '\t',
  '\n'
]

function ignoreHead(html){
  let headbody = html.split('<head>')
  let head = headbody.split('</head>')
  //translate title
  //translate description
  html.replace(head, "")
  for(ele of ignoredElems){
    html.replace(ele, "")
  }
  return html
}

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

function saveText(filename, html1, html2, piece, key, text, attributes, from, to){
  text.replace('\t', "")
  text.replace('\n', "")
  if (!text.replace(/\s/g, '').length) {
    //console.log('string only contains whitespace (ie. spaces, tabs or line breaks)');
  }
  else {
    let id = text.substr(0, 12).replace(" ", "_");
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
        //console.log(newpiece)
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
        return {"html1":html1, "html2":html2}
      }
    });
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