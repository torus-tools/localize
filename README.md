# Arjan Translate

Arjan Localize is node module that automatically localizes and translates any HTML single page or multipage site.   It is able to translate a site in up to 54 different languages using [AWS Neural Machine](https://aws.amazon.com/translate/)


## Usage

1. The Arjan translation GUI:
    1. Pros: GUI
    2. cons: 
        1. only translate a single page at a time
        2. cannot update translations
2. Programmatic usage
    1. Pros: integrate into other programs and workflows
    2. Cons: requires setup for each project
3. Arjan CLI 
    1. pros: 
        1. translate multiple pages
        2. bi-directional translation updates
    2. cons: No GUI. basic terminal usage knowledge

## Arjan translate GUI

Arjan translate also has a GUI at [arjan.tools/translate](http://arjan.tools/translate.html) 

the GUI is pretty limited as you cant update your translations but its good for a one time job especially if you have no programming experience. Its also a cool way of trying out the tool and checking out the format. 

The GUI is a form with a from field, a to field, and a drop zone were you can drag and drop your files. Only HTML, txt, and markdown files supported.


## CLI
1. go into your sites directory `cd SITE_NAME`
2. run `arjan init SITE_NAME`  Refer to the provider setup section if you haven't used any of the cloud translation APIs.
3. Run the translate command `arjan translate SITE_NAME [FILENAME]`

**Then what?**
the translate command generates 3 things (or maybe 4)

1. **locale JSON files** for the input and output languages
2. **translated html file/s** with the output language code (es.html or es/about.html)
3. **localized html files.** i18n compatible
4. **CSV** file with translations

Once you have translated your doc you can improve all of your translations by working directly on your neatly organized JSON locale files and running the translate command with the —update flag (-u).

Arjan translations is bi-directional meaning that you can also work on the output HTML files and then run the translate command with the —backwards (-b) flag to update your JSON files.

You can also generate a single CSV file with all the translations for your site by running the translate command with the —export flag (-e). if you use both the —export and —backwards flags you can update the CSV with site data. if you provide the filename arg only translations for that file will be included in the CSV.


## Programmatic Use
1. install the arjan-localize module `npm i arjan-localize`
2. for using the automatic translations feature refer to the [provider setup](http://#provider-setup) section
    const arjanTranslate = require('arjan-translate')
    
    //REGION is the AWS region of your IAM role ex. 'use-east-1'
    //PROFILE is the name of your desired AWS IAM profile ex. 'deafult'
    
    arjanTranslate.Build('REGION', 'PROFILE', function(err, data){
      if(err) console.log(err)
      else {
        //FROM is the language code of your origin file ex. 'en'
        //TO is the language code of your destination file ex. 'es'
        arjanTranslate.TranslateSite('FROM', 'TO');
      }
    })


## Translation Format

You can translate a static site into one of two output formats:

1. Arjan: Great for static websites
2. i18n: Widely accepted and supported translation format for apps.

Lets suppose our input is an en.html file with the following content: 

    <section>
      <h1 id="title1">Arjan is super cool</h1>
    </section>

**After running the translate command we would get the following output:**

1. locales/en.json → `{ "title1":"Arjan is super cool" }`
2. en.html 
    1. Arjan→ `<h1 id="title1"> Arjan is super cool </h1>`
    2. I18n → `<h1 id="title1"> {{arjan.t('title1)}} </h1>`

**Lets suppose that our input string didnt have an id attribute:**

1. locales/en.json → `{ "arjan_is_sup1":"Arjan is super cool" }`
2. en.html 
    1. Arjan → `<h1 id="arjan_is_sup1"> Arjan is super cool </h1>`
    2. en.html → `<h1> {{arjan.t('arjan_is_sup1')}} </h1>`

Notice that an id with the first 12 characters of the string is created. Caps are lower-cased and spaces are replaced with underscores. A number with the index of the translations is inserted at the end (in case there’s another string that starts with the same 12 chars)


-  if you are using html5 elements in your page (nav, header, section, footer) you can add the html5 option in the translate command. This will generate objects with ids of html5 elements (nav, header, section, footer) and will insert translations as children of the object they belong to. suppose were still using the example above without ids:
1. translations/en.json → `{ "section1":{"arjan_is_sup":"Arjan is super cool" }}`
2. en.html
    1. Arjan ->
    <section id="section1">
       <h1 id="section1_arjan_is_sup"> Arjan is super cool </h1>
    </section>
    1. I18n → 
    <section>   
        <h1> {{arjan.t('section1.arjan_is_sup')}} </h1>
    </section>










Arjan translate is a localization and translation solution for static websites that works on any html single page or multipage site. It autamitacally creates json locale files for each of your site's versions and it uses AWS's neural machine translation service to render translations in up to 54 different languages. for more info. check out [AWS tarnslate](https://aws.amazon.com/translate/details/)

## Pre-requisites
1. You must have an AWS account and an IAM user with programatic access
2. You must have a local profile for your IAM user. 

AWS local profiles are stored in ~/.aws/credentials in mac/linux or in C:\Users\USER_NAME\.aws\credentials in windows. Create/edit this file by runing `sudo nano ~/.aws/credentials` then add the profile keys in the format shown bellow.

    [profilename]
    aws_access_key_id = <YOUR_ACCESS_KEY_ID>
    aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>

## Installation
`npm i arjan-translations`

# CLI Commands

    USAGE
      $ arjan localize FILENAME FROM [TO]
    
    ARGUMENTS
      FILENAME  [default: all] name of the file you want to translate -only html files accepted. Use all to translate all of
                your html files (default).
    
      FROM      origin language of the file
    
      TO        desired translation language
    
    OPTIONS
      -b, --backwards  Update JSON locale accoridng to changes made in the HTML file. Must be used together with the update
                       flag.
    
      -c, --create     Create locales for your html website. if a destination language isnt provided it wont be translated.
    
      -e, --export     Creates a CSV file for your JSON locale.
    
      -i, --import     Update JSON locale from changes made in the CSV file
    
      -u, --update     Update HTML file accoridng to changes made in the JSON locale.
