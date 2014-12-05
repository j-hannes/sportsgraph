/*global R, rawData, moment*/
//var moment = require('moment')
//var R = require('ramda')

//console.log('Reading training data...')

//var trainingData = require('./5-miles')

var getLaps = R.compose(
    R.get('Lap'),
    R.get('Activity'),
    R.get('Activities')
)

var laps = getLaps(rawData)

//console.log('Found', laps.length, 'laps.')

var getTrackpoints = R.compose(
    R.get('Trackpoint'),
    R.get('Track')
)

var lapTrackpoints = R.map(getTrackpoints, laps)

// we need a concat function that [[a]] -> [a]
var concat = R.foldr(function(a, b) {
  return b.concat(a)
}, [])

var trackpoints = concat(lapTrackpoints)

var average = function(v1, v2) {
  return (Number(v1) + Number(v2)) / 2
}
//var trackpoints = R.take(10, trackpoints)
var interpolate = function(trackpoints) {
  if (trackpoints.length > 1) {
    var t1 = trackpoints[0]
    var t2 = trackpoints[1]
    var t3 = {
      Time: t2.Time,
      AltitudeMeters: average(t1.AltitudeMeters, t2.AltitudeMeters),
      DistanceMeters: t2.DistanceMeters,
      HeartRateBpm: {
        Value: average(t1.HeartRateBpm.Value, t2.HeartRateBpm.Value),
      }
    }
    var next = interpolate(R.tail(R.tail(trackpoints)))
    next.unshift(t3)
    return next
  } else {
    return trackpoints
  }
}
var head = R.head(trackpoints)
var tail = R.tail(trackpoints)
var trackpoints = [head].concat(interpolate(interpolate(interpolate(interpolate(interpolate(interpolate(tail)))))))
//console.log(trackpoints.length)

//console.log('Found', trackpoints.length, 'trackpoints.')

// trim down trackpoints to 10
// var trackpoints = R.take(10, trackpoints)

var copyRelevantData = function(startTime, trackpoint) {
  return {
    secondsPassed: (moment(trackpoint.Time) - moment(startTime)) / 1000,
    altitudeMeters: Math.round(trackpoint.AltitudeMeters * 10) / 10,
    distanceMeters: Math.round(trackpoint.DistanceMeters * 10) / 10,
    heartRateBpm: Number(trackpoint.HeartRateBpm.Value)
  }
};

var convertTrackpoints = function(trackpoints) {

  // first trackpoint has no data, second one is set to 0m, so start with 2nd
  trackpoints = R.tail(trackpoints)

  var startTime = R.head(trackpoints).Time
  var conversionFn = R.curry(copyRelevantData)(startTime)
  //console.log(startTime)
  
  //console.log(R.tail(trackpoints))
  return R.map(conversionFn, R.tail(trackpoints))
}

var enrichWithSpeed = function(trackpoints) {
  return R.foldl(function(trackpoints, trackpoint) {
    var oldDistance = R.last(trackpoints).distanceMeters
    var newDistance = trackpoint.distanceMeters
    var distanceDelta = newDistance - oldDistance
    var oldTime = R.last(trackpoints).secondsPassed
    var newTime = trackpoint.secondsPassed
    var timeDelta = newTime - oldTime
    trackpoint.speedKmh = Math.round(distanceDelta * 36 / timeDelta) / 10
    trackpoints.push(trackpoint)
    return trackpoints
  }, [R.head(trackpoints)], R.tail(trackpoints))
}

var convertedData = convertTrackpoints(trackpoints)
var enrichedData = enrichWithSpeed(convertedData)

// cheat!
enrichedData[0].speedKmh = 8

var runData = enrichedData

// module.exports = convertedData



/*
var Trackpoint = function(snippet) {
  return {
    time: R.get('Time', trackpoint),
    distance: R.get('DistanceMeters', trackpoint)
  }
}

var tps = R.map(Trackpoint, trackpoints)

console.log(tps)

var logtpdiff = function(title, tp1, tp2) {
}

var logdiff = function(tp0, tp1, tps) {
  if (tps.length > 0) {
    var tp2 = R.head(tps)
    var seconds1 = moment(tp2.time).diff(moment(tp1.time)) / 1000
    var meters1 = tp2.distance - tp1.distance
    var speed1 = meters1 / seconds1 * 3.6;
    var seconds2 = moment(tp2.time).diff(moment(tp0.time)) / 1000
    var meters2 = tp2.distance - tp0.distance
    var speed2 = meters2 / seconds2 * 3.6;
    console.log(
      seconds1 + 's',
      Math.round(meters1, 0) + 'm',
      (Math.round(speed1 * 10) / 10) + 'km/h',
      '|', 
      seconds2 + 's',
      Math.round(meters2, 0) + 'm',
      (Math.round(speed2 * 10) / 10) + 'km/h'
    )
    logdiff(tp0, tp2, R.tail(tps))
  }
}

logdiff(R.head(tps), R.head(tps), R.tail(tps))
*/

// R.reduce
