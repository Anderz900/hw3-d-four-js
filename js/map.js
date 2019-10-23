var imported = document.createElement('script');
imported.src = './js/papaparse.min.js';
document.head.appendChild(imported);

let susData
let divSchemeNeg
let divSchemePos
let hoverListener

function ecologyMap(){

    d3.select('body').style('background', '#181818')

    let width = 1000,
        height = 800,
        active = d3.select(null)

    let svg = d3.select('#map-area').append('svg')
        .attr('width', width)
        .attr('height', height)
        .on('click', stopped, true)

    svg.append('rect')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#181818')
        .on('click', reset)

    let g = svg.append('g')

    svg.attr('transform', 'translate(0, -20)')

    let zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', zoomed)

    // svg.call(zoom)
    let path;

    Promise.all([d3.json('./data/world-110m.json'), 
    d3.json('./data/sustainability.json')]).then(data => {


        let worldData = data[0]
        let sustainabilityData = data[1]
        susData = {}

        sustainabilityData.forEach((d)=>{
            
            let country = d.Country
            let sus = d.Sustainability
            susData[country] = sus

        })

        // console.log(susData)

        minSus = d3.min(sustainabilityData, function(d){return d.Sustainability})
        maxSus = d3.max(sustainabilityData, function(d){return d.Sustainability})

        console.log(minSus)
        console.log(maxSus)


        
        divSchemePos = d3.scaleDiverging()
            .domain([0, 1, maxSus-90])
            .interpolator(d3.interpolateGreens)

        divSchemeNeg = d3.scaleDiverging()
            .domain([0, -1, minSus])
            .interpolator(d3.interpolateReds)
            

        let projection = d3.geoMercator()
            .translate([width/2, height/2+100])
            .center([0, 0])
                
        
        path = d3.geoPath()
        .projection(projection)

        let worldFiltered = topojson.feature(worldData, worldData.objects.countries).features

        g.selectAll('path')
            .data(worldFiltered)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', (d)=>{
                let country = d.properties.name
                
                /*  Go back to js object and get the value for each key */
                if(susData[country] > 0){
                    return divSchemePos(susData[country])
                }
                else if(susData[country] < 0){
                    return divSchemeNeg(susData[country])
                }
                else{
                    return '#878787'
                }
            })
            .on('mouseout',function(){
                d3.select(this)
                .transition()
                .style('fill', (d)=>{
                    let country = d.properties.name
                
                /*  Go back to js object and get the value for each key */
                if(susData[country] > 0){
                    return divSchemePos(susData[country])
                }
                else if(susData[country] < 0){
                    return divSchemeNeg(susData[country])
                }
                else{
                    return '#878787'
                }
                })
                .transition()
                .duration(5100)
    
            })
            .on('click', clicked)
    })

    function clicked(d) {

        let countrySustainability = susData[d.properties.name]

        document.querySelector('#countryName').innerHTML = d.properties.name
        document.querySelector('#countrySus').innerHTML = `Sustainability Margin: ${countrySustainability}`
        if(countrySustainability < 0){
            document.querySelector('#countrySus').setAttribute('style', `color:${divSchemeNeg(susData[d.properties.name])}`)
        }
        else if(countrySustainability > 0){
            document.querySelector('#countrySus').setAttribute('style', `color:${divSchemePos(susData[d.properties.name])}`)
        }
        else{
            document.querySelector('#countrySus').setAttribute('style', 'color:#181818')
        }

        if (active.node() === this) return reset();
        active.classed("active", false);
        active = d3.select(this).classed("active", true);
        active.style('fill', '#222222')
        active.on('mouseout', function(d){
            active.style('fill', '#222222')
        })

        var bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = Math.max(1, Math.min(5, 0.9 / Math.max(dx / width, dy / height))),
            translate = [width / 2 - scale * x, height / 2 - scale * y];
      
        svg.transition()
            .duration(1200)
            // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
            .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4
      }
      
      function reset() {

        document.querySelector('#countryName').innerHTML = ''
        document.querySelector('#countrySus').innerHTML = ''

        svg.selectAll('path').style('fill', function(d){
            let country = d.properties.name
                
                /*  Go back to js object and get the value for each key */
                if(susData[country] > 0){
                    return divSchemePos(susData[country])
                }
                else if(susData[country] < 0){
                    return divSchemeNeg(susData[country])
                }
                else{
                    return '#878787'
                }
        })

        g.selectAll('path').style('fill', function(d){
            let country = d.properties.name
                
                /*  Go back to js object and get the value for each key */
                if(susData[country] > 0){
                    return divSchemePos(susData[country])
                }
                else if(susData[country] < 0){
                    return divSchemeNeg(susData[country])
                }
                else{
                    return '#878787'
                }
        })


        .transition()
        active.classed("active", false);
        active = d3.select(null);
      
        svg.transition()
            .duration(1250)
            // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
            .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
      }
      
      function zoomed() {
        g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
        // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
        g.attr("transform", d3.event.transform); // updated for d3 v4
      }
      
      // If the drag behavior prevents the default click,
      // also stop propagation so we don’t click-to-zoom.
      function stopped() {
        if (d3.event.defaultPrevented) d3.event.stopPropagation();
      }
}

ecologyMap()