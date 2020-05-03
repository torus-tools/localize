require('dotenv').config();
var fs = require("fs");
var {createDir, createFile} = require('./Build');
var CreateLocale = require('./CreateLocale');
var TranslateLocale = require('./TranslateLocale');
var TranslateHtml = require('./TranslateHtml');

module.exports = function TranslateSite(from, to){
  //create locales directory
  createDir('locales', function(err, data){
    if(err) console.log(err)
    else{
      //create directory for origin locale
      createDir(`locales/${from}`, function(err, data){
        if(err) console.log(err)
        else{
          //translate multipage site 
          if(fs.existsSync(from)){
            if(fs.statSync(from).isDirectory()){
              fs.readdirSync(from).forEach(function(filename){
                if(filename.includes(".html")){
                  let filePath = `${from}/${filename}.html`
                  let name = filename.split[0]
                  let translation = `${to}/${filename}.html`
                  createFile(`locales/${from}/${name}.json`, '{}')
                  let html = fs.readFileSync(filePath, 'utf8')
                  CreateLocale(html, name, from, to, function(err, data){
                    if(err) console.log(err)
                    else{
                      var origin_locale = data.locale
                      var html = data.html;
                      TranslateLocale(origin_locale, name, from, to, data.size, function(err, data){
                        if(err) console.log(err)
                        else{
                          var translated_locale = data
                          TranslateHtml(name, html, translation, translated_locale, to, function(err, data){
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
          //translate single page site
          else if(fs.existsSync(`${from}.html`)) {
            let name = from
            let file = `${from}.html`
            let translation = `${to}.html`
            createFile(`locales/${from}/${from}.json`, '{}')
            let html = fs.readFileSync(file, 'utf8')
            if(fs.statSync(`${name}.html`).isFile()){
              fs.readFile(`${name}.html`, 'utf8', function(err, data){
                if(err) console.log(err)
                else {
                  CreateLocale(html, name, from, to, function(err, data){
                    if(err) console.log(err)
                    else{
                      var origin_locale = data.locale
                      var html = data.html;
                      TranslateLocale(origin_locale, name, from, to, data.size, function(err, data){
                        if(err) console.log(err)
                        else{
                          var translated_locale = data
                          TranslateHtml(name, html, translation, translated_locale, to, function(err, data){
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
          //error no html site to translate
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
