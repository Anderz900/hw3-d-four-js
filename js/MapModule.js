
export default function StackedAreaChart(){ // does not need to have a name
    
    let susData
    let divSchemeNeg
    let divSchemePos
    let hoverListener
	
	// define reusable chart update function
	function chart(selection){
		selection.each(function(data){// this: contains a currently selected container element (e.g., div)
			
			// ---- Init the internal structure only once -----
			let svg = d3.select(this).selectAll('svg')
				.data([data]);

			
			let svgEnter = svg.enter().append('svg');
			let gEnter = svgEnter.append('g');
			
			gEnter.append("g")
				.attr("class", "x-axis axis")
					
			gEnter.append("g")
				.attr("class", "y-axis axis");
			
			// Activity IV - Add a tooltip placeholder
			// Tooltip placeholder
			gEnter.append("text")
				.attr("class", "focus")
				.attr("x", 20)
				.attr("y", 0)
				.attr("dy", ".35em");	
			// ------------------------------------------------
			
			// Activity II - Create a stacked area chart

			// Update canvas sizes
			svg = svg.merge(svgEnter);
			svg.attr("width", width)
				.attr("height", height)
			
			let g = svg.select("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
		
			tooltip = g.select('.focus');
				
			let dataCategories = data.length>0?Object.keys(data[0]).filter(d=>d!=="Year"):[];
			// Initialize stack layout
			stack = d3.stack()
				.keys(dataCategories);
				
			// Stack data
			stackedData = stack(data);
				
			console.log(data);
			console.log(stackedData);
			// Scales and axes
			x.range([0, width - margin.left - margin.right])
				.domain(d3.extent(data, d=>d.Year));
			
			y.range([height - margin.top - margin.bottom, 0])
				.domain([0,d3.max(stackedData, d => d3.max(d, d => d[1]))]);
			
			color.domain(dataCategories);

			// Stacked area layout
			area = d3.area()
			.curve(d3.curveCardinal)
			.x(d=>x(d.data.Year))
			.y0(d=>y(d[0]))
			.y1(d=>y(d[1]));

			// Draw the layers
			let categories = g.selectAll(".area")
				.data(stackedData);
			
			// ------------------------------------------------

			
			categories.enter().append("path")
				.attr("class", "area")
				.merge(categories)
				.style("fill", (d,i)=>color(dataCategories[i]))
				.attr("d", d=>area(d))
				.on("click", handleClick)
				.on("mouseover", (d,i)=>tooltip.text(excerpt(dataCategories[i], 100)))
				.on("mouseout", d=>tooltip.text(""));// Activity IV - Add tooltip events on the area paths
			
			categories.exit().remove();
			
			// Call axis functions with the new domain 
			g.select(".x-axis")
				.attr("transform", "translate(0," + (height-margin.top-margin.bottom) + ")")
				.call(xAxis);
			g.select(".y-axis").call(yAxis);
			
		});
	}
	chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
	};

	// Activity V - allow users to register for your custom events 
	chart.on = function() {
        var value = listeners.on.apply(listeners, arguments);
        return value === listeners ? chart : value;
    };
	function handleClick(d,i){
		// Activity V - call registered callbacks and pass the category info
		listeners.apply("select", this, [d.key,d.index]);
	}
	return chart;
	
}
