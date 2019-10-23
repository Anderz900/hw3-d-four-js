import StackedAreaChart from './StackedAreaChart.js';
import Timeline from './Timeline.js';
//**************************
import StackedBarChart from './StackedBarChart.js';
//import Map from './map.js';

let yearData, countryData, categoryData, susData; 

let parseDate = d3.timeParse("%Y");

let areaChart = StackedAreaChart()
    .on("select", onSelectCountry);

let barChart = StackedBarChart();

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
    }),
    d3.csv("data/per_country_eco_breakdown.csv", d=>{
        Object.keys(d).forEach(key=>{
            if(key!="Type"&&key!="Category") {
                d[key] = parseFloat(d[key]);
            }
        })
        return d;
    }),
    d3.csv("data/per_country_sustainability.csv", d=>{
        Object.keys(d).forEach(key=>{
            if(key!="Country") {
                d[key] = parseFloat(d[key]);
            }
        })
        return d;
    })
]).then(data=>{
    yearData = data[0];
    countryData = data[1];
    categoryData = data[2];
    susData = data[3];

    //sconsole.log(categoryData);
    //console.log(susData);

    d3.select("#stacked-bar-chart2")
        .datum(categoryData)
        .call(barChart);

    d3.select("#stacked-area-chart")
        .datum(countryData, categoryData)
        .call(areaChart);

    d3.select("#timeline")
        .datum(yearData)
        .call(timeline);
})

function onSelectCountry(d, i){
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
    let filtered = dateRange?countryData.filter(d=>within(d.Year, dateRange)): countryData; 
    filtered = filtered.map(row=>{
        return country?{
            Year:row.Year,
            [country]:row[country]
        }:row;
    });
    return filtered;
}