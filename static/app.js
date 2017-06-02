(function() {
  'use strict';
  var interval, updateGraph, since = 0, updateTime, width, height, g, x, y, line,
    parseTime, margin, displaySeconds = 300, currentData = [], path, tickTime, startTime,
    powerGauge, chartWidth, chartHeight;
  
  

  $(document).ready(function(){
    // 
    chartWidth = $('#chart').width();
    chartHeight = chartWidth / 1.6;
    $('#chart').height(chartHeight);
    lineChart();
    
    powerGauge = window.gauge('#powergauge', {
  		size: 300,
  		clipWidth: 300,
  		clipHeight: 300,
  		ringWidth: 40,
  		maxValue: 120,
  		transitionMs: 4000,
  	});
  	powerGauge.render();
    	
  });
  
  interval = setInterval(function() {
    d3.json('/rpm/'+since, function(data) {
      var last, newData, lastRpm;
      if (data.rpm_data && data.rpm_data.length > 0){
        if (!startTime) {
          startTime = data.rpm_data[0].time;
        }
        last = data.rpm_data.length;
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
            point.offset = point.time - startTime;
            lastRpm = point.rpm;
            currentData.push(point);
            since = point.time;
          });
          if (lastRpm !== undefined) {
            powerGauge.update(lastRpm);
          }
        } 
      }
      tick();
    });
    tick();
  }, 1000);
  
  function lineChart() {
    var svg = d3.select("#chart svg");
    svg.attr('width', chartWidth).attr('height', chartHeight);
    margin = {top: 20, right: 20, bottom: 30, left: 50};
    width = +svg.attr("width") - margin.left - margin.right;
    height = +svg.attr("height") - margin.top - margin.bottom;
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    parseTime = d3.timeParse("%d-%b-%y");

    x = d3.scaleLinear() //Was scaleTime until 0-300 scale
        .domain([0, displaySeconds-1])
        .rangeRound([0, width]);

    y = d3.scaleLinear()
        .domain([0, 150])
        .rangeRound([height, 0]);
    line = d3.line()
        .x(function(d, i) { 
          return x(d.offset); 
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

    path = g.append("g")
        .attr("clip-path", "url(#clip)")
      .append("path")
        .attr("id", "rpmpath")
        .datum(currentData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line)
      .transition()
        .duration(500)
        .ease(d3.easeLinear);
  }
  
  function tick(){
    var current = (Date.now() / 1000),
      elapsedSeconds = current - startTime,
      gapTime,
      lineNode;
    d3.select('#time').text(secondsToMinutes(elapsedSeconds));
    gapTime = current - startTime - displaySeconds;
    lineNode = document.getElementById('rpmpath');
    if (gapTime > 0) {
      d3.select(lineNode)
        .attr("d", line)
        .transition()
        .attr("transform", "translate(" + x(-1 * gapTime) + ",0)");
    } else {
      d3.select(lineNode)
        .attr("d", line);
    }
  }
  
  function secondsToMinutes(elapsedSeconds) {
    var elapsedMin = Math.floor(elapsedSeconds / 60);
    elapsedSeconds = Math.floor(elapsedSeconds - elapsedMin * 60);
    if (elapsedSeconds < 10) {
      elapsedSeconds = "0" + elapsedSeconds;
    }
    return elapsedMin + ":" + elapsedSeconds;
  }
}());