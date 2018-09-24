var _ = require('lodash');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');
var fs = require('fs');
var csvtojson = require("csvtojson").Converter;
var handlebars = require('handlebars');
var pdf = require('html-pdf');

/* all requires above this line */

var html = fs.readFileSync('./templates/card.html', 'utf8');
var csvpath = './csvdata/Jobs_Done_TEST.csv';
var converter = Promise.promisifyAll(new csvtojson({delimiter: [',', ';']}));
var pdfOptions = { /*format: 'A4'*/ };

function generatePDF(csv) {
	_.each(csv, function(row) {
		// Do some processing
		row['Job'] = row['Job'].replace('#', '');
		row['Hours'] = row['Bid (Hours)'];
		row['TotalAmount'] = row['Full Amount'];

		var address = row['Address'].split(',');
		row['Address1'] = address[0];
		row['Address2'] = address[1];
		row['Address3'] = address[2] + ',' + address[3];
		row['Address4'] = '';
		for (i = 4; i < address.length; i++) {
			row['Address4'] += address[i];
			if (i !== address.length - 1) {
				row['Address4'] += ',';
			}
		}

		//console.log(row);
		var chtml = handlebars.compile(html)(row);
		var filename = 'STO-' + row.Job + '.pdf';

		pdf.create(chtml, pdfOptions).toFile('./generated/' + filename, function(err, res) {
		  if (err) return console.log(err);
		  console.log('Generated Invoice..', res.filename);
		});
	});
}

converter.fromFile(csvpath)
	.then(function(csv) {
		//console.log(csv);
		generatePDF(csv);
	})
	.catch(function(err) {
		console.log(err);
	});