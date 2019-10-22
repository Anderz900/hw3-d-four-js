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
            console.log("ayo")
            let dataz = data;
            let n = data.length - 1;
            console.log(dataz)
            let organize1 = dataz[n];
            console.log(organize1);
            let organize2 = (Object.values(organize1));
            let organize5 = []
            for (let i = 0; i<organize2.length;i++){organize5[i] = organize2[i];}
            console.log(organize5);
            organize2.sort(function(a,b){return b - a });
            let organize3 = organize2.slice(0,20);
            console.log(organize3);
            console.log(organize2);
            console.log(organize5);
            let list1 = []
            for (let i = 0; i<organize5.length; i++){
                if (organize3.includes(organize5[i])){list1.push(i)}
            }
            
            console.log(list1)
            
            
            let data3 = ''
            console.log(data[1]);
            let datavals = data;
            let maxlength = Object.values(datavals[0]).length
            console.log(maxlength);
            for (let i = 0; i<datavals.length; i++){
                let organise = Object.values(datavals[i]);
                data3 += (organise) + '\n';
            }

            
            let data4 = '';
            console.log(data3);
            console.log("ayooo");
            
            console.log(list1);
            
            console.log("ayooo");
            //data3= removeColumn(data3, )
            console.log(data3);
            for (let i = 1; i<list1.length;i++){
                data4 += removeColumn(data3, list1[i]);

                }  
            
            console.log("mikecheck");
            console.log(data4);
            
            
           
            

            

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

