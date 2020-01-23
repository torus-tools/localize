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
  'button',
  'nav',
  'footer',
]

function TranslateSite(from, to){
  createDir('locales', function(err, data){
    if(err) console.log(err)
    else{
      createDir(`locales/${from}`, function(err, data){
        if(err) console.log(err)
        else{
          if(fs.existsSync(from)){
            if(fs.statSync(from).isDirectory()){
              fs.readdirSync(from).forEach(function(filename){
                if(filename.includes(".html")){
                  let file = `${from}/${filename}.html`
                  let name = filename.split[0]
                  let translation = `${to}/${filename}.html`
                  createFile(`locales/${from}/${name}.json`, '{}')
                  CreateLocale(file, name, from, to, function(err, data){
                    if(err) console.log(err)
                    else {
                      TranslateLocale(name, from, to, data, function(err, data){
                        if(err) console.log(err)
                        else{
                          TranslateHtml(name, translation, to, function(err, data){
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
          else if(fs.existsSync(`${from}.html`)) {
            let name = from
            let file = `${from}.html`
            let translation = `${to}.html`
            createFile(`locales/${from}/${from}.json`, '{}')
            if(fs.statSync(`${name}.html`).isFile()){
              fs.readFile(`${name}.html`, 'utf8', function(err, data){
                if(err) console.log(err)
                else {
                  CreateLocale(file, name, from, to, function(err, data){
                    if(err) console.log(err)
                    else{
                      TranslateLocale(name, from, to, data, function(err, data){
                        if(err) console.log(err)
                        else{
                          TranslateHtml(name, translation, to, function(err, data){
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
      });
    }
  })
}

function CreateLocale(file, filename, from, to, callback){
  //read file
  var html = fs.readFileSync(file, 'utf8')
  var body = html.split('</head>')[1]
  var size = 0
  let html1 = html
  //let html2 = html
  //ignore all images
  for(key of elements){
    let elem = `<${key}`
    if(body.includes(elem)){
      let arr = body.split(elem)
      for(i = 1; i<arr.length; i++){
          let fragment = arr[i];
          let piece = fragment.split(`</${key}>`)[0];
          let attributes = piece.split('>')[0];
          let text = piece.split('>')[1];
          id = text.substr(0, 12).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + size
          let frag = `<${key}` + piece + `</${key}>`
          
          //if text.includes("img") text = text.replace(img, "")
          if(text.replace(/\s/g, '').length){
            if(text.includes("<")){
              if(text.split("<")[0].replace(/\s/g, '').length){
                text = text.split("<")[0]
                id = text.substr(0, 12).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + size
                if(attributes.includes('id="')){
                  let preid = attributes.split('id="')[1];
                  id = preid.split('"')[0]
                  addVar(`${from}/${filename}`, id, text)
                  size += 1
                }
                else {
                  let newfrag = `<${key}` + ` id="${id}"` + piece + `</${key}>`
                  html1 = html1.replace(frag, newfrag);
                  addVar(`${from}/${filename}`, id, text)
                  size += 1
                }
              }
            }
            else {
              if(attributes.includes('id="')){
                let preid = attributes.split('id="')[1];
                id = preid.split('"')[0]
                addVar(`${from}/${filename}`, id, text)
                size +=1
              }
              else {
                let newfrag = `<${key}` + ` id="${id}"` + piece + `</${key}>`
                html1 = html1.replace(frag, newfrag);
                addVar(`${from}/${filename}`, id, text)
                size += 1
              }
            }       
        } 
      }
      
    }
  }
  fs.writeFileSync(`${filename}.html`, html1);
  callback(null, size)
}

function TranslateLocale(filename, from, to, size, callback){
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

function TranslateHtml(filename, translation, to, callback){
  let rawdata = fs.readFileSync(`locales/${to}/${filename}.json`, 'utf8'); 
  var translations = JSON.parse(rawdata); 
  var html = fs.readFileSync(`${filename}.html`, 'utf8')
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
          let frag = `<${key}` + piece + `</${key}>`
          if(text.replace(/\s/g, '').length){
            if(text.includes("<")){
              if(text.split("<")[0].replace(/\s/g, '').length){
                text = text.split("<")[0]
                if(attributes.includes('id="')){
                  let preid = attributes.split('id="')[1];
                  id = preid.split('"')[0]
                  let translatedpiece = piece.replace(`>${text}`, `>${translations[id]}`)
                  let newfrag = `<${key}` + translatedpiece + `</${key}>`
                  //console.log(translatedpiece)
                  html2 = html2.replace(frag, newfrag);
                }
              }
            }
            else {
              if(attributes.includes('id="')){
                let preid = attributes.split('id="')[1];
                id = preid.split('"')[0]
                let translatedpiece = piece.replace(`>${text}`, `>${translations[id]}`)
                let newfrag = `<${key}` + translatedpiece + `</${key}>`
                //console.log(translatedpiece)
                html2 = html2.replace(frag, newfrag);
              }
            }       
        } 
      }
      
    }
  }
  fs.writeFileSync(translation, html2);
  callback(null, 'success')
}

function addVar(file, variable, value, callback){
  let rawdata = fs.readFileSync(`locales/${file}.json`, 'utf8'); 
  obj = JSON.parse(rawdata); 
  obj[variable] = value;
  jsonString = JSON.stringify(obj);
  fs.writeFileSync(`locales/${file}.json`, jsonString);
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

TranslateSite('en', 'es')
