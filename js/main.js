import StackedAreaChart from './StackedAreaChart.js';
import Timeline from './Timeline.js';

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



// d3.select('.countries')
//     .data(countryData, function(d){
//         //return d.
//     })
//     .enter()
//     .append();

d3.select("#selection")
    .on("change", function(){
        let e = document.getElementById("selection");
        //let e = document.querySelector('#selection');
        //let selectedcountry = e.options[e.selectedIndex]//.value;
        console.log(e.value);
        onSelectCountry([e.value]);
})
d3.select('#selection')
    .on('click', function(){
        let e = document.getElementById("selection");
        e.value = '';
    })



//end here

//for stacked area chart, not dropdown menu
function onSelectCountry(d, i){
    console.log(d);
    filterCountry = filterCountry===d?null:d;

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


