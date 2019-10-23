export default function StackedAreaChart(){

    // initialize size
    let margin={
        top: 40,
        left: 60,
        right: 0,
        bottom: 60
    };

    let width=800;
    let height=400;

    // initialize axis variables to be updated in real time
    let x = d3.scaleTime();
    let y = d3.scaleLinear();
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    let yAxis = d3.axisLeft().scale(y);
    let xAxis = d3.axisBottom().scale(x);
    let listeners = d3.dispatch('select');

    let stack, stackedData, area, tooltip;
    //  function dataFiltering(x){
    //    var attractions = attractionData;
    //    console.log(attractionData);
    
    //    attractions.sort(function(a,b){return b.x - a.x});
    //    console.log(attractions)
    //    attractions.slice(0,5);
    //    attractions = attractions.slice(0,5);
    //    renderBarChart(attractions);
    
    // reusable chart update function
    function removeColumn(data, colIndex) {
        var temp = data.split("\n");
        let res = '';
        for(var i = 0; i < temp.length; ++i) {
            temp[i] = temp[i].split(",");
            res+= temp[i].splice(colIndex,1) + '\n';
            temp[i] = temp[i].join(","); 
        }
        return res;
        
    }
   
    


    function chart(selection){
        selection.each(function(data){ // contains a currently selected container element
            
            

            

            // initialize internal structure once
            let svg = d3.select(this).selectAll('svg')
                .data([data]);

            let svgEnter = svg.enter().append('svg');
            let groupEnter = svgEnter.append('g');

            groupEnter.append('g')
                .attr('class', 'x-axis axis');

            groupEnter.append('g')
                .attr('class', 'y-axis axis');
            
            
            groupEnter.append("text")
				.attr("class", "focus")
				.attr("x", 20)
				.attr("y", 0)
				.attr("dy", ".35em");

            // ----------------------------------
            // creating the stacked area chart

            // updating canvas size
            svg = svg.merge(svgEnter);

            svg.attr('width', width);
            svg.attr('height', height);

            let group = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            tooltip = group.select('.focus')

            let countries = data.length>0?Object.keys(data[0]).filter(d=>d!=="Year"):[];
            
            // intialize stack layout
            stack = d3.stack()
                .keys(countries);
            
            // stack data
            stackedData = stack(data);
            
            console.log(data);
            console.log(countries)
            console.log(stackedData);

            // scales and axes
            x.range([0, width - margin.left - margin.right])
                .domain(d3.extent(data, d=>d.Year));

            y.range([height - margin.top-margin.bottom, 0])
                .domain([0, d3.max(stackedData, d => d3.max(d, d=>d[1]))]);

            color.domain(countries)

            // Stacked area layout
            area = d3.area()
                .curve(d3.curveCardinal)
                .x(d=>x(d.data.Year))
                .y0(d=>y(d[0]))
                .y1(d=>y(d[1]));

            // drawing the chart layers
            let countryStacks = group.selectAll('.area')
                .data(stackedData);
            
            countryStacks
                .enter()
                .append('path')
                .attr('class', 'area')
                .merge(countryStacks)
                .style('fill', (d, i)=>color(countries[i]))
                .attr('d', d=>area(d))
                .on("click", handleClick)
                .on("mouseover", (d,i)=>tooltip.text(countries[i]))
                .on("mouseout", d=>tooltip.text(""));

            countryStacks.exit().remove()

            // calling axis functions with new domain

            group.select('.x-axis')
                .attr('transform', "translate(0," + (height-margin.top-margin.bottom) + ")")
                .call(xAxis)

            group.select('.y-axis').call(yAxis)
        })
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
    
    chart.on = function() {
        let value = listeners.on.apply(listeners, arguments);
        return value === listeners ? chart : value;
    };

    function handleClick(d,i){
		listeners.apply("select", this, [d.key,d.index]);
	}

    return chart

}

