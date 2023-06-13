const { format } = require('timeago.js')

const helpers = {}

helpers.timeago = (timestamp) => {
    return format(timestamp)
}

helpers.timeago2 = (timestamp) => {
    var date = new Date (timestamp)

    var day = date.getDate()
    var month = date.getMonth() + 1
    var year = date.getFullYear()
  
    if (month < 10) month = "0" + month
    if (day < 10) day = "0" + day

    var today = year + "-" + month + "-" + day


    return today 
}

helpers.timeago3 = (timestamp) => {
    var date = new Date (timestamp)
    var day = date.getDate()
    var month = date.getMonth() + 1
    var year = date.getFullYear()

    if (month < 10) month = "0" + month
    if (day < 10) day = "0" + day

    var today = day + "-" + month + "-" + year


    return today 
}

module.exports = helpers