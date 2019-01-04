function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatString(str){
  var result = str;
    if (arguments.length > 1) {    
        if (arguments.length == 2 && typeof (arguments[1]) == "object") {
            for (var key in arguments) {
                if(arguments[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, arguments[key]);
                }
            }
        }
        else {
            for (var i = 1; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
　　　　　　　　　　　　var reg= new RegExp("\\{" + (i - 1) + "\\}", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

module.exports = {
  formatTime: formatTime,
  formatString: formatString
}
