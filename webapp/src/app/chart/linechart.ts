import * as d3 from 'd3';
import { BicycleData } from '../shared/bicycle.service';

export class LineChart {

    private margin;
    private width: number;
    private height: number;
    private chartWidth: number;
    private chartHeight: number;
    private g;
    private line;
    private path;
    private average;
    private x;
    private y;
    private parseTime;
    private displaySeconds: number = 1800;
    private averageRpm: number = 0;

    private currentData: object[];
    private startTime: number;


    constructor(element: HTMLElement) {
        this.chartWidth = element.clientWidth;
        this.chartHeight = (element.clientWidth / 16) * 9;
        var svg = d3.select(element).append('svg');
        svg.attr('width', this.chartWidth).attr('height', this.chartHeight);
        this.margin = {top: 20, right: 20, bottom: 30, left: 50};
        this.width = +svg.attr('width') - this.margin.left - this.margin.right;
        this.height = +svg.attr('height') - this.margin.top - this.margin.bottom;
        this.g = svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.currentData = [];
        this.parseTime = d3.timeParse('%d-%b-%y');

        this.x = d3.scaleLinear() //Was scaleTime until 0-300 scale
            .domain([0, this.displaySeconds-1])
            .rangeRound([0, this.width]);

        this.y = d3.scaleLinear()
            .domain([0, 150])
            .rangeRound([this.height, 0]);

        this.line = d3.line<BicycleData>()
            .x((d: BicycleData): number => this.x(d.offset))
            .y((d: BicycleData) => this.y(d.rpm));
        
        this.g.append('g')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3.axisBottom(this.x))
        .select('.domain')
            .remove();

        this.g.append('g')
            .call(d3.axisLeft(this.y))
        .append('text')
            .attr('fill', '#000')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .attr('text-anchor', 'end')
            .text('Price ($)');
        
        this.average = this.g.append('g')
            .append('line')
            .attr('id', 'average')
            .attr('x1', 0)
            .attr('x2', this.displaySeconds-1)
            .attr('y1', this.y(80))
            .attr('y2', this.y(80))
            .style('stroke', "rgb(188,35,99)")
            
            // .attr('fill', 'none');

        //  svg.append("svg:line")width
        //     .attr("x1", 0)
        //     .attr("x2", width)
        //     .attr("y1", before_meal)
        //     .attr("y2", before_meal)
        //     .style("stroke", "rgb(189, 189, 189)");

        
        this.path = this.g.append('g')
            .attr('clip-path', 'url(#clip)')
            .append('path')
                .attr('id', 'rpmpath')
                .datum(this.currentData)
                .attr('class', 'line')
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-linejoin', 'round')
                .attr('stroke-linecap', 'round')
                .attr('stroke-width', 1.5)
                // .attr('d', this.line); //This has no data yet

        this.path.transition()
                .duration(500)
                .ease(d3.easeLinear);
    }

    update(newData: BicycleData[]) {
        var current = (Date.now() / 1000),
        gapTime,
        lineNode,
        lastRpm
        if (newData.length > 0) {
            newData.forEach((point: BicycleData) => {
                if (!this.startTime) {
                    this.startTime = point.time;
                }

                point.offset = point.time - this.startTime;
                lastRpm = point.rpm;
                if (point.averageRpm) {
                    this.averageRpm = point.averageRpm;
                }
                this.currentData.push(point);
            });
            
            
            this.average.attr('y1', this.y(this.averageRpm)).attr('y2',  this.y(this.averageRpm));
        } 
        
        gapTime = current - this.startTime - this.displaySeconds;
        lineNode = document.getElementById('rpmpath');
        if (gapTime > 0) {
            this.path
                .attr('d', this.line)
                .transition()
                .attr('transform', 'translate(' + this.x(-1 * gapTime) + ',0)');
            
            
            
        } else {
            this.path
                .attr('d', this.line);
        }

    }
}