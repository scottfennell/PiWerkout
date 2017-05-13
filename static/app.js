(function() {
  'use strict';
  var interval, updateGraph, since = 0, updateTime, width, height, g, x, y, line,
    parseTime, margin, displaySeconds = 300, currentData = [], path;
  
  updateTime = function(data) {
    var startDate = data.rpm_data[0].time * 1000;
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
  $(document).ready(function(){
    $('#chart').css({
      width: 750,
      height: 500
    });
    
    for(var i = 0; i < displaySeconds; i++) {
      currentData.push({
        rpm: 0,
        time: 0
      });
    }
    
    lineChart();
  });
  
  interval = setInterval(function() {
    d3.json('/rpm/'+since, function(data) {
      if (data.rpm_data && data.rpm_data.length > 0){
        updateTime(data);
        // updateGraph(data);
        // 
        var last = data.rpm_data.length;
        var newData;
        if (since > 0) {
          newData = data.rpm_data.filter(function (point) {
            if(point.time > since) {
              return true;
            }
          });
        } else {
          newData = data.rpm_data;
        }
        
        if (newData.length > 0) {
          newData.forEach(function(point) {
            currentData.push(point);
            since = point.time;
          });
        }
        console.log("Add data", currentData)
        // lineChartData(null, newData);
      }
      //tick();
    });
  },1000);
  
  
  function lineChart() {
    var svg = d3.select("#chart svg");
    margin = {top: 20, right: 20, bottom: 30, left: 50};
    width = +svg.attr("width") - margin.left - margin.right;
    height = +svg.attr("height") - margin.top - margin.bottom;
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    parseTime = d3.timeParse("%d-%b-%y");

    x = d3.scaleTime()
        .domain([0, displaySeconds-1])
        .rangeRound([0, width]);

    y = d3.scaleLinear()
        .domain([0, 150])
        .rangeRound([height, 0]);
    line = d3.line()
        .x(function(d, i) { 
          return x(i); 
        })
        .y(function(d, i) { 
          return y(d.rpm); 
        });


    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
      .select(".domain")
        .remove();

    g.append("g")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price ($)");

    path = g.append("path")
        .datum(currentData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
  }
  
  function tick() {
    // Push a new data point onto the back.
    // Redraw the line.
    d3.select(path)
        .attr("d", line)
        .attr("transform", null);
    // Slide it to the left.
    d3.active(path)
        .attr("transform", "translate(" + x(-1) + ",0)")
      .transition();
    // Pop the old data point off the front.
    data.shift();
  }
}());