import StackedAreaChart from './StackedAreaChart.js';
import Timeline from './Timeline.js';


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
let yearData, countryData; 

let parseDate = d3.timeParse("%Y");

let areaChart = StackedAreaChart()
    .on("select", onSelectCountry);

let timeline = Timeline()
    .on("brushed", onBrushRange);

let filterCountry, filterRange;

Promise.all([
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
]).then(data=>{
    yearData = data[0];
    countryData = data[1];

    console.log(data);
    d3.select("#stacked-area-chart")
        .datum(countryData)
        .call(areaChart);

    d3.select("#timeline")
        .datum(yearData)
        .call(timeline);
    
    //new function call
    countryList();
})

//start here
//loads country names into search bar
function countryList(){
    let countrylist = Object.keys(countryData[0]).slice(1);
    console.log(countrylist[0]);
    d3.select('datalist').selectAll('option')
        .data(countrylist, function(d){
            return d;
        })
        .enter()
        .append('option')
        .attr('value', function(d){
            return d;
        })
}


//note that this event listener also calls onSelectCountry,
//which is intended for clicking on the stacked area chart
//this is probably where problems are coming from
d3.select("#selection")
    .on("input", function(){
        let e = document.getElementById("selection");
        //let e = document.querySelector('#selection');
        //let selectedcountry = e.options[e.selectedIndex]//.value;
        console.log('-------- search box',  e.value);
        console.log("heyo");
        onSelectCountry(e.value);
})
d3.select('#selection')
    .on('click', function(){
        let e = document.getElementById("selection");
        e.value = '';
    })



//end here

//debug here for clicking
//for stacked area chart, not dropdown menu
function onSelectCountry(d, i){
    
    filterCountry = filterCountry===d?null:d;
    console.log('-------- onSelectCountry',  d, filterCountry);
    //console.log(filterRange);
    
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
    let filtered = dateRange?countryData.filter(d=>within(d.Year, dateRange)): countryData; 
    filtered = filtered.map(row=>{
        return country?{
            Year:row.Year,
            [country]:row[country]
        }:row;
    });
    return filtered;
}

// function ourfilterCountryData(country, dateRange){
    
// }