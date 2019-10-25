import StackedAreaChart from './StackedAreaChart.js';
import Timeline from './Timeline.js';


var imported = document.createElement('script');

//imported.src = './js/papaparse.min.js';

document.head.appendChild(imported);


let susData
let divSchemeNeg
let divSchemePos
let hoverListener
let categoryData;

let marginBar={
    top: 40,
    left: 60,
    right: 0,
    bottom: 60
};

let widthBar = 240;
let heightBar = 260; 

let color = d3.scaleOrdinal(d3.schemeCategory10);
//let selectCountry = d3.select("#country-select").on("change", updateVisualization);;

let x = d3.scaleBand()
    .range([0, widthBar])
    .paddingInner(0.1);

let y = d3.scaleLinear()
    .range([heightBar, 0]);

let xAxis = d3.axisBottom()
    .scale(x);

let yAxis = d3.axisLeft()
    .scale(y);

let selectedCountry;
let prevSelected = null;
let count = 0;

let footprint = {
    type: "Ecological footprint",
    Cropland: 0,
    Grazing_land: 0,
    Forest_land: 0,
    Fishing_water: 0,
    Carbon_urban: 0,
    total: 0
};

let biocapacity = {
    type: "Biocapacity",
    Cropland: 0,
    Grazing_land: 0,
    Forest_land: 0,
    Fishing_water: 0,
    Carbon_urban: 0,
    total: 0
}

let countryData, category, stack, stackedData,
    svgBar, svgEnter, groupEnter, group, bars;


let areaYearData, areaCountryData;
let filterCountry, filterRange;
let parseDate = d3.timeParse("%Y");

let areaChart;

function ecologyMap(){

    areaChart = StackedAreaChart()
        .on("select", onSelectCountry);
    let timeline = Timeline()
    .on("brushed", onBrushRange);
    d3.select('body').style('background', '#181818')

    let width = 800,
        height = 640,
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

    svg.attr('transform', 'translate(0, -80)')

    let zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', zoomed)

    // svg.call(zoom)
    let path;

    Promise.all([
        d3.json('./data/world-110m.json'), 
        d3.json('./data/sustainability.json'),
        d3.csv('./data/per_country_eco_breakdown.csv', d=>{
            Object.keys(d).forEach(key=>{
                if(key!="Type"&&key!="Category") {
                    d[key] = parseFloat(d[key]);
                }
            })
            return d;
        }),
        d3.csv("data/per_year.csv", d=>{
            d.total_pba = parseFloat(d.total_pba);
            d.Year = parseDate(d.Year.toString());
            return d;
        }), 
        d3.csv("data/per_country.csv", d=>{
            Object.keys(d).forEach(key=>{
                if(key != "Year") {
                    d[key] = parseFloat(d[key]);
                } else if(key == "Year") {
                    d[key] = parseDate(d[key].toString());
                }
            })
            return d;
        })
    ]).then(data => {

        let worldData = data[0]

        

        let sustainabilityData = data[1]
        categoryData = data[2];
        areaYearData = data[3];
        console.log(areaYearData[0]);
        areaCountryData = data[4];
        susData = {}

        sustainabilityData.forEach((d)=>{
            
            let country = d.Country
            let sus = d.Sustainability
            susData[country] = sus

        })

        // console.log(susData)

        let minSus = d3.min(sustainabilityData, function(d){return d.Sustainability})
        let maxSus = d3.max(sustainabilityData, function(d){return d.Sustainability})

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
            .center([0, -15])
            .scale(120)
        
        path = d3.geoPath()
        .projection(projection)

        let worldFiltered = topojson.feature(worldData, worldData.objects.countries).features
        console.log(worldFiltered);
        console.log(worldFiltered.length);
        let list1 = [];
        let list2 = []
        for (let j = 0; j< worldFiltered.length; j++){
            list1.push(worldFiltered[j]);
            list2.push(worldFiltered[j].properties.name);   
        }
        console.log(list2);

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
                .style('stroke', 'none')
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
            // .on('mouseover', function(){
            //     d3.select(this)
            //     .transition()
            //     .style('stroke', '#fff')
            // })
            .on('click', clicked)

        // d3.select("#stacked-area-chart")
        //     .datum(areaCountryData)
        //     .call(areaChart);
    
        d3.select("#timeline")
            .datum(areaYearData)
            .call(timeline);
            countryList();


        
            d3.select("#wemadeit")
            .on("click", function(){
                let e = document.getElementById("myDropdown");
                console.log(e.value);
                //let e = document.querySelector('#selection');
                //let selectedcountry = e.options[e.selectedIndex]//.value;
                console.log('-------- search box',  e.value);
                console.log("heyo");
                console.log(list2);
                let i;
                for (let j = 0; j< list2.length; j++){
                    if (e.value == list2[j]){i = j;}
                }
                clicked(list1[i]);
            })
    
    
    })

    function countryList(){
        let countrylist = Object.keys(areaCountryData[0]).slice(1);
        console.log(document.getElementById("myDropdown"));
        d3.select("#myDropdown").selectAll("option").data(countrylist, function(d){
            return d;
        })
        .enter()
        .append("option")
        .text(function(d){return d;});   
    }

    

    function onSelectCountry(d, list2){
        console.log(list2);
        filterCountry = filterCountry===d?null:d;
        let filtered = filterCountryData(filterCountry, filterRange);
        d3.select("#stacked-area-chart")
            .datum(filtered)
            .call(areaChart);
    }

    function onBrushRange(dateRange) {
        filterRange = dateRange;
        let filtered = filterCountryData(filterCountry, filterRange);
        d3.select("#stacked-area-chart")
            .datum(filtered)
            .call(areaChart);
    }
    
    function within(d, range){
        return d.getTime()>=range[0].getTime()&&d.getTime()<=range[1].getTime();
    }
    
    function filterCountryData(country, dateRange) {
        let filtered = dateRange?areaCountryData.filter(d=>within(d.Year, dateRange)): areaCountryData; 
        filtered = filtered.map(row=>{
            return country?{
                Year:row.Year,
                [country]:row[country]
            }:row;
        });
        return filtered;
    }

    function clicked(d) {
        console.log(count);
        console.log(d);
        let country = d.properties.name;
        console.log(prevSelected);
        if (prevSelected == null){
            prevSelected = country;
            selectedCountry = country;
            count++;
        } else {
            if (selectedCountry == country) {
                console.log(selectedCountry);
                reset();
                if(count == 2) {
                    count = 0;
                    clicked(d);
                }
                count++;
                return;
            } else {
                count = 0;
                prevSelected = selectedCountry;
                selectedCountry = country;
            }
        }
    
        

        
        
        
        handleCoordination(country);
        onSelectCountry(country);

        let filtered = filterCountryData(filterCountry, filterRange);
        d3.select("#stacked-area-chart")
            .datum(filtered)
            .call(areaChart);

        // d3.select("#stacked-area-chart")
        //     .datum(areaCountryData)
        //     .call(areaChart);
    
        let countrySustainability = susData[d.properties.name];
        
        // document.querySelector('#blurb').innerHTML = ''
        
        document.querySelector('#keyArea').innerHTML = '<li><i class="fas fa-square fa-1.4x" style="color: #1f77b4"></i><br>Cropland</li><li><i class="fas fa-square fa-1.4x" style="color: #ff7f0e"></i><br>Grazing Land</li><li><i class="fas fa-square fa-1.4x" style="color: #2ca02c"></i><br>Forestland</li><li><i class="fas fa-square fa-1.4x" style="color: #d62728"></i><br>Fishing Water</li><li><i class="fas fa-square fa-1.4x" style="color: #9467bd"></i><br>Carbon/Urban</li>'

        document.querySelector('#countryName').innerHTML = d.properties.name
        
        if(susData[country] < 0){
            document.querySelector('#countryName').setAttribute('style', 'color: #FF3838')
        }
        else if(susData[country] > 0){
            document.querySelector('#countryName').setAttribute('style', 'color: #88FF86')
        }
        else{
            document.querySelector('#countryName').setAttribute('style', 'color: #fff')
        }

        document.querySelector('#countrySus').innerHTML = `Sustainability Margin: ${countrySustainability}`
        if(countrySustainability < 0){
            // document.querySelector('#countrySus').setAttribute('style', `color:${divSchemeNeg(susData[d.properties.name])}`)
            document.querySelector('#countrySus').setAttribute('style', 'color: #FF3838')
        }
        else if(countrySustainability > 0){
            // document.querySelector('#countrySus').setAttribute('style', `color:${divSchemePos(susData[d.properties.name])}`)
            document.querySelector('#countrySus').setAttribute('style', 'color: #88FF86')
        }
        else{
            document.querySelector('#countrySus').setAttribute('style', 'color:#181818')
        }

        if (active.node() === this) return reset();
        active.classed("active", false);
        active = d3.select(this).classed("active", true);
        active.style('stroke', '#fff')
        active.on('mouseout', function(d){
            active.style('stroke', '#fff')
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

        document.querySelector('#countryName').setAttribute('style', 'color: #fff')
        document.querySelector('#keyArea').innerHTML = " "

        document.querySelector('#stacked-bar-chart').innerHTML = ''
        document.querySelector('#stacked-area-chart').innerHTML = ''
        document.querySelector('#countryName').innerHTML = 'None'
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
        .attr('stroke', 'rgba(0, 0, 0, .4')

        g.selectAll('path')
        .style('fill', function(d){
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
        .style('stroke', 'None')
        

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

      function handleCoordination(country) {
        console.log("country clicked", country);
        countryData = getCountryData(categoryData, country);
        drawStackedBarChart(countryData);
      }

      function getCountryData(data, country) {
        footprint.Cropland = data[0][country];
        footprint.Grazing_land = data[1][country];
        footprint.Forest_land = data[2][country];
        footprint.Fishing_water = data[3][country];
        footprint.Carbon_urban = data[4][country];
        footprint.total = footprint.Cropland + footprint.Grazing_land + footprint.Forest_land + 
                          footprint.Fishing_water + footprint.Carbon_urban;

        biocapacity.Cropland = data[5][country];
        biocapacity.Grazing_land = data[6][country];
        biocapacity.Forest_land = data[7][country];
        biocapacity.Fishing_water = data[8][country];
        biocapacity.Carbon_urban = data[9][country];
        biocapacity.total = biocapacity.Cropland + biocapacity.Grazing_land + biocapacity.Forest_land + 
                            biocapacity.Fishing_water + biocapacity.Carbon_urban;

        return [footprint, biocapacity];
      }

}

function drawStackedBarChart(countryData) {
    //select("#stacked-bar-chart")

  document.querySelector('#stacked-bar-chart').innerHTML = ''

  let svg = d3.select("#stacked-bar-chart").selectAll("svg")
    .data([countryData]);

  svgEnter = svg.enter().append("svg");
  groupEnter = svgEnter.append("g");

  groupEnter.append('g')
      .attr("class", "x-axis axis");

  groupEnter.append("g")
      .attr("class", "y-axis axis");
  
  svg = svg.merge(svgEnter);

  svg.attr("width", widthBar + marginBar.left + marginBar.right);
  svg.attr("height", heightBar + marginBar.top + marginBar.bottom);

  group = svg.select("g")
      .attr("transform", "translate(" + marginBar.left + "," + marginBar.top + ")");

  //let keys = ["Cropland","Grazing Land","Forest Land","Fishing Water","Carbon/Urban Land"];
  let keys = countryData.length>0?Object.keys(countryData[0]).filter(d=>d!=="type"&&d!="total"):[];

  stack = d3.stack().keys(keys);
  stackedData = stack(countryData);
  console.log(stackedData);
  color.domain(keys);

  //x.domain(data.map(d=>d.Type));
  x.domain(["Ecological footprint","Biocapacity"]);
  y.domain([0, d3.max(countryData, d=>d.total)]);
  

  bars = group.selectAll(".bar")
      .data(stackedData)
      .enter().append("g")
          .attr("fill", (d,i)=>{
              console.log(keys[i], color(keys[i]));
              return color(keys[i])})
      .selectAll("rect")
      .data(function(d) { 
          return d;
      })
      .enter()
      .append("rect")
      .attr("x", d=>{ 
          return x(d.data.type); 
      })
      .attr("y", d=>{ 
          return y(d[1]); })
      .attr("height", (d,i)=>{ 
          console.log(d);
          return y(d[0])-y(d[1]); 
      })
      .attr("width", x.bandwidth())
      .on("mouseover", (d,i)=>{
          //getCategory(d);
      })
      .on("mouseout", function(d) {
      });	
  
  let xAxisGroup = 
  group.append("g")
      .attr("class", "x-axis axis")
      .attr("transform", "translate(0," + heightBar + ")")
      .call(xAxis);


  //let yAxisGroup = 
  group.append("g")
      .attr("class", "y-axis axis")
      .call(yAxis);

  group.append("g")
      .append("text")
        .attr("transform", "translate(20," + -20 + ")")
        .attr("fill", "#ddd")
        .text("Sustainability Breakdown")
        .style('font-size', '16px')

}

ecologyMap()