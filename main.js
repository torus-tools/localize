var fs = require("fs");

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

let br = '<br>';

function translateHtml(from, to){
  //if dir called from
  //else if 
  let html = fs.readFile(`${from}.html`, function(err, data){
    if(err) console.log(err)
    else{
      findElements(html, findElements())
    }
  })
  findELements()
}

function translate(text, from, to){
 return 'hello'
}

function saveText(html, text, attributes){
  let id = text.substr(0, 12);
  if(attributes.includes("id=")){
    id = attributes.split('id=')[1];
  }
  json1[id] = text
  json2[id] = translate(text)
}

function findElements(html, callback){
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
              callback(html, function(err, data){
                if(err) console.log(err)
                else console.log(data)
              })
            }
            else {
              saveText(html, text, attributes)
            } 
          }
        }
      }
    }
  })
}