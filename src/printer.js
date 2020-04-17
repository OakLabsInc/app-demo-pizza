const ipp = require('ipp');

const concat = require("concat-stream");


async function printReceiptFromPizzaData (printerName) {

  var doc = new PDFDocument({margin:0});
  
  doc.text("############################################", 0, 0);
  doc.text('Hello world!', 50, 50)
  doc.text('Hello world again!')
  doc.text("############################################", 0, 0);

  

  doc.pipe(concat(function (data) {
    var printer = ipp.Printer(printerName);
    var msg = {
      "operation-attributes-tag": {
        "requesting-user-name": "PizzaMaker",
        "job-name": "pizzaMaker.pdf",
        "document-format": "application/pdf"
      }
      , data: data
    };
    printer.execute("Print-Job", msg, function(err, res){
      console.log(err);
      console.log(res);
    });
  }));
  doc.end();
}

async function getPrinterAttributes(name, cb) {
  var printer = ipp.Printer(name);
  printer.execute("Get-Printer-Attributes", null, function(err, res){
    if (err){
      cb(name, err)
    }
    cb(name, res)
  });
}



module.exports.printReceiptFromPizzaData = printReceiptFromPizzaData
module.exports.getPrinterAttributes = getPrinterAttributes