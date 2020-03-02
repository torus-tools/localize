var fs = require("fs");
const elements = require('./HtmlElements');
var {addVar} = require('./Build')

module.exports = function CreateLocale(file, filename, from, to, callback){
  //read file
  var html = fs.readFileSync(file, 'utf8')
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
          //generate the id
          let id = text.substr(0, 12).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + size
          let frag = `<${key}` + piece + `</${key}>`
          //if(key === a) save the href attribute url in the links object
          //else if(key === img) save the src attribute url in the images object
          //check if the element has text
          if(text.replace(/\s/g, '').length){
            //check if theres additional tags
            if(text.includes("<")){
              if(text.split("<")[0].replace(/\s/g, '').length){
                //only use the text that is before the additional tags
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