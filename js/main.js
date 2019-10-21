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
})

function onSelectCountry(d, i){
    filterCountry = filterCountry===d?null:d;
    console.log(filterRange);
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