(function() {
  'use strict';
  var interval, updateGraph, since = 0, updateTime;
  
  updateTime = function(data) {
    var startDate = data.rpm_per_sec[0][0] * 1000;
    var current = Date.now();
    var elapsedMillis = current - startDate;
    var elapsedSeconds = Math.floor(elapsedMillis/1000);
    elapsedMillis = Math.floor(elapsedMillis - (elapsedSeconds * 1000));
    var elapsedMin = Math.floor(elapsedSeconds / 60);
    elapsedSeconds = Math.floor(elapsedSeconds - elapsedMin * 60);
    d3.select('#time').text(elapsedMin + ":" + elapsedSeconds + "." + elapsedMillis);
  };
  
  updateGraph = function(data) {
    
    console.log("data", data.rpm_per_sec)
    nv.addGraph(function() {
      var chart = nv.models.lineChart()
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; }) //adjusting, 100% is 1.00, not 100 as it is in the data
                    .color(d3.scale.category10().range())
                    .useInteractiveGuideline(true)
                    ;
      chart.xAxis     //Chart x-axis settings
          .axisLabel('Time (s)')
          .tickFormat(d3.format(',r'));

      chart.yAxis     //Chart y-axis settings
          .axisLabel('RPM')
          .tickFormat(d3.format('0f'));

      d3.select('#chart svg')
          .datum([{
            key: 'RPM',
            values: data.rpm_per_sec.map(function(val,idx) {
              return val
            })
          }])
          .call(chart);

      //TODO: Figure out a good way to do this automatically
      nv.utils.windowResize(chart.update);

      return chart;
    });
  };
  

  interval = setInterval(function() {
    d3.json('/rpm/'+since, function(data) {
      updateTime(data);
      updateGraph(data);
    });
  },1000);
}())
