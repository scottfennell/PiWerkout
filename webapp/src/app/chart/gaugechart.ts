import * as d3 from 'd3';
import { BicycleData } from '../shared/bicycle.service';

export class GaugeChart {
	private range = undefined;
	private r = undefined;
	private pointerHeadLength = undefined;
	
	private svg = undefined;
	private arc = undefined;
	private scale = undefined;
	private ticks = undefined;
	private tickData = undefined;
	private pointer = undefined;


	private container;
	private config;
	
	constructor(container, configuration = {}) {
		this.config = {
			size						: 400,
			width						: 100,
			height						: 100,
			ringInset					: 20,
			ringWidth					: 20,
			
			pointerWidth				: 10,
			pointerTailLength			: 5,
			pointerHeadLengthPercent	: 0.9,
			
			minValue					: 0,
			maxValue					: 100,
			
			minAngle					: -90,
			maxAngle					: 90,
			
			transitionMs				: 750,
			
			majorTicks					: 5,
			labelFormat					: d3.format(''),
			labelInset					: 20,
			
			arcColorFn					: d3.interpolateHsl(d3.rgb('#0f0'), d3.rgb('#f00'))
		};

		this.container = container;
		this.configure(configuration);
		this.render(0);
	}
  	
  	deg2rad(deg) {
  		return deg * Math.PI / 180;
  	}
  	
  	newAngle(d) {
  		var ratio = this.scale(d);
  		var newAngle = this.config.minAngle + (ratio * this.range);
  		return newAngle;
  	}
  	
  	public configure(configuration) {
		Object.apply(this.config, configuration);
		this.config.width = this.container.clientWidth;
		this.config.height = (this.container.clientWidth / 16) * 9;

		this.config.size = Math.min(this.config.width, this.config.height);
  		
  		this.range = this.config.maxAngle - this.config.minAngle;
  		this.r = this.config.size / 2;
  		this.pointerHeadLength = Math.round(this.r * this.config.pointerHeadLengthPercent);

  		// a linear scale that maps domain values to a percent from 0..1
  		this.scale = d3.scaleLinear()
  			.range([0,1])
  			.domain([this.config.minValue, this.config.maxValue]);
  			
		this.ticks = this.scale.ticks(this.config.majorTicks);
		this.tickData = d3.range(this.config.majorTicks).map(() => 1/this.config.majorTicks);
		this.arc = d3.arc();
  		this.arc.innerRadius(this.r - this.config.ringWidth - this.config.ringInset)
  		this.arc.outerRadius(this.r - this.config.ringInset)
  	}
  	
  	centerTranslation() {
  		return 'translate('+ this.r +','+ this.r +')';
  	}
  	
  	public isRendered() {
  		return (this.svg !== undefined);
  	}
  	
  	public render(newValue) {

  		this.svg = d3.select(this.container)
  			.append('svg:svg')
  				.attr('class', 'gauge')
  				.attr('width', this.config.width)
				.attr('height', this.config.height);
  		
  		var centerTx = this.centerTranslation();
  		
  		var arcs = this.svg.append('g')
  			.attr('class', 'arc')
			.attr('transform', centerTx);
		
		let pieGenerator = d3.pie()
			// .value((d) => {
			// 	console.log("D is ",d);
			// 	return d;
			// })
			.startAngle(-0.5 * Math.PI)
			.endAngle(0.5 * Math.PI);
			  
  		arcs.selectAll('path')
  			.data(pieGenerator(this.tickData))
			.enter()
			.append('path')
  			.attr('fill', (d, i) => {
				let col = this.config.arcColorFn(d.startAngle * i);
				return col;
			})
			.attr('d', this.arc);
  		
  		var lg = this.svg.append('g')
  				.attr('class', 'label')
  				.attr('transform', centerTx);
  		lg.selectAll('text')
  				.data(this.ticks)
  			.enter().append('text')
  				.attr('transform', (d) => {
  					var ratio = this.scale(d);
  					var newAngle = this.config.minAngle + (ratio * this.range);
  					return 'rotate(' +newAngle +') translate(0,' +(this.config.labelInset - this.r) +')';
  				})
  				.text(this.config.labelFormat);

  		var lineData = [ [this.config.pointerWidth / 2, 0], 
  						[0, -this.pointerHeadLength],
  						[-(this.config.pointerWidth / 2), 0],
  						[0, this.config.pointerTailLength],
  						[this.config.pointerWidth / 2, 0] ];
  		var pointerLine = d3.line();//.curve(d3.curveMonotoneX());
  		var pg = this.svg.append('g').data([lineData])
  				.attr('class', 'pointer')
  				.attr('transform', centerTx);
  				
  		this.pointer = pg.append('path')
  			.attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
  			.attr('transform', 'rotate(' + this.config.minAngle +')');
  			
  		this.updateLocal(newValue === undefined ? 0 : newValue);
  	}

	public update(newData : BicycleData[]) {
		if (newData && newData.length > 0) {
			let lastIndex = newData[newData.length-1];
			this.updateLocal(lastIndex.rpm)
		}
	}
  	
  	public updateLocal(newValue, newConfiguration?) {
  		if ( newConfiguration  !== undefined) {
  			this.configure(newConfiguration);
  		}
  		var ratio = this.scale(newValue);
  		var newAngle = this.config.minAngle + (ratio * this.range);
  		this.pointer.transition()
  			.duration(this.config.transitionMs)
  			.ease(d3.easeElastic)
  			.attr('transform', 'rotate(' +newAngle +')');
  	}
}