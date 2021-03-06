#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://google.com";
var rest = require('restler');

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if (!fs.existsSync(instr)) {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1);
  }
  return instr;
};

var cheerioHtmlFile = function(htmlfile) {
  var html = fs.readFileSync(htmlfile).toString();
  return cheerio.load(html);
};

var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};


var checkHtmlFile = function(htmlfile, checksfile) {
  var $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var checkURL =function(htmldata, checksfile) {
  var $ = cheerio.load(htmldata);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;  
  }
  return out;
};

 

var clone = function(fn) {
  // Workaroud for commader.js issue.
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
};

if (require.main == module) {
  program
    .option('-c, --checks <check file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url>', 'URL to check')
    .parse(process.argv);
  var checkJson;
  if (program.url) {
     rest.get(program.url).on('complete',function(result){
       checkJson = checkURL(result, program.checks);
       outJson = JSON.stringify(checkJson, null, 4);
       console.log(outJson);  
     });
  } else {
      checkJson = checkHtmlFile(program.file, program.checks);
      outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);  
    }
  
} else {
  exports.checkHtmlFile = checkHtmlFile;
}
