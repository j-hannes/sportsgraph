var express = require('express')

var app = express()

//var runData = require('./runData').data

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html')
})

app.get('/chart.js', function(request, response) {
  response.sendFile(__dirname + '/bower_components/chartjs/Chart.js')
})

app.get('/ramda.js', function(request, response) {
  response.sendFile(__dirname + '/bower_components/ramda/ramda.js')
})

app.get('/moment.js', function(request, response) {
  response.sendFile(__dirname + '/bower_components/moment/moment.js')
})

app.get('/5-miles-mtgannelon.js', function(request, response) {
  response.sendFile(__dirname + '/5-miles-mtgannelon.js')
})

app.get('/convertRunData.js', function(request, response) {
  response.sendFile(__dirname + '/convertRunData.js')
})

app.listen(8080)
