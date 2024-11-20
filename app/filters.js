const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

addFilter('commaFormat', function (inputString) {
    inputString = inputString.toString();
    var decimalPart = "";
    if (inputString.indexOf('.') != -1) {
        //alert("decimal number");
        inputString = inputString.split(".");
        decimalPart = "." + inputString[1];
        inputString = inputString[0];
        //alert(inputString);
        //alert(decimalPart);

    }
    var outputString = "";
    var count = 0;
    for (var i = inputString.length - 1; i >= 0 && inputString.charAt(i) != '-'; i--) {
        //alert("inside for" + inputString.charAt(i) + "and count=" + count + " and outputString=" + outputString);
        if (count == 3) {
            outputString += ",";
            count = 0;
        }
        outputString += inputString.charAt(i);
        count++;
    }
    if (inputString.charAt(0) == '-') {
        outputString += "-";
    }
    //alert(outputString);
    //alert(outputString.split("").reverse().join(""));
    return outputString.split("").reverse().join("") + decimalPart;
})
