const {Build, TranslateSite} = require('./index')

/* Build('us-east-1', 'default', function(err, data){
  if(err) console.log(err)
  else console.log('success')
}) */

TranslateSite('en', 'es');