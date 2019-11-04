"use-strict";

let data = "";
let svgContainer = "";
let legend = "";
const msm = {
    width: 1000,
    height: 800,
    marginAll: 50,
    marginLeft: 50,
}
const small_msm = {
    width: 500,
    height: 500,
    marginAll: 50,
    marginLeft: 80
}

window.onload = function () {
    svgContainer = d3.select("#chart")
        .append('svg')
        .attr('width', msm.width)
        .attr('height', msm.height);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("pokemon.csv")
        .then((d) => makeScatterPlot(d))
}

function makeScatterPlot(csvData) {
    data = csvData.filter((data) => {return data["Sp. Def"] != "NA" && data["Total"] != "NA"})
    let dropDown_gen = d3.select("#genFilter").append("select")
        .attr("name", "generation");

    let dropDown_legend = d3.select("#legendFilter").append("select")
        .attr("name", "legendary")

    // get arrays of special defense and total stats
    let def = data.map((row) => parseFloat(row["Sp. Def"]));
    let total = data.map((row) => parseFloat(row["Total"]));

    // find data limits
    let axesLimits = findMinMax(def, total);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total", svgContainer, msm);

    // draw title and axes labels
    makeLabels(svgContainer, msm, "Pokemon: Special Defense vs Total Stats",'Special Defense','Total Stats');
    plotData(mapFunctions);

    //get distinct values of generation and legendary and add "all" option
    let distinctGen = [...new Set(data.map(d => d["Generation"]))];
    distinctGen.push("All")
    let distinctLeg = [...new Set(data.map(d => d["Legendary"]))];
    distinctLeg.push("All")


    //create dropdown options for generation
    let options = dropDown_gen.selectAll("option")
           .data(distinctGen)
           .enter()
           .append("option")
           .text(function (d) { return d; })
           .attr("value", function (d) { return d; })
           .attr("selected", function(d){ return d == 1; });
    //dropdown menu options for legendary
    let optionsLeg = dropDown_legend.selectAll("option")
        .data(distinctLeg)
        .enter()
        .append("option")
        .text(function(d) {return d;})
        .attr("value", function(d) {return d;})  
        .attr("selected", function(d){ return d == "True"; }); 
         
           
    var selectedL = "All"; //selected Legendary
    var selectedG = "All"; //selected Generation

    dropDown_gen.on("change", function() {
        selectedG = this.value;
        showGen(this, selectedL)
    });
    dropDown_legend.on("change", function() {
        selectedL = this.value;
        showLeg(this, selectedG)
    });
    
}

function showGen(me, selectedL) {
    let selected = me.value;
    displayOthers = me.checked ? "inline" : "none";
    display = me.checked ? "none" : "inline";

    //hide non-selected
    svgContainer.selectAll(".circles")
        .data(data)
        .filter(function(d) {
            if (selectedL != "All") {
                return selected != d.Generation || selectedL != d.Legendary;
            } else {
                return selected != d.Generation;}
            })
        .attr("display", displayOthers);
    
    //show selected
    svgContainer.selectAll(".circles")
        .data(data)
        .filter(
                function(d) {
            if (selectedL != "All") {
                return selected == d.Generation && selectedL == d.Legendary;
            } else {
                return selected == d.Generation;}
            })
        .attr("display", display);
    
    //show all
    if (selected == "All" && selectedL == "All") {
        svgContainer.selectAll(".circles")
        .data(data)
        .attr("display", display);
    } else if (selected == "All" && selectedL != "All") {
        svgContainer.selectAll(".circles")
        .data(data)
        .filter(function(d) {return selectedL == d.Legendary})
        .attr("display", display);
    }
}

function showLeg(me, selectedG) {
    let selected = me.value;
    displayOthers = me.checked ? "inline" : "none";
    display = me.checked ? "none" : "inline";

    //reset display on data
    svgContainer.selectAll(".circles")
        .data(data)
        .attr("display", display)

    //hide non selected
    svgContainer.selectAll(".circles")
    .data(data)
    .filter(function(d) {
        if (selectedG != "All") {
            return selected != d.Legendary || selectedG != d.Generation;
        } else {
            return selected != d.Legendary;}
        })
    .attr("display", displayOthers);

    //show selected
    svgContainer.selectAll(".circles")
        .data(data)
        .filter(
                function(d) {
            if (selectedG != "All") {
                return selected == d.Legendary && selectedG == d.Generation;
            } else {
                return selected == d.Legendary;}
            })
        .attr("display", display);

    //show all
    if (selected == "All" && selectedG == "All") {
        svgContainer.selectAll(".circles")
        .data(data)
        .attr("display", display);
    } else if (selected == "All" && selecteG != "All") {
        svgContainer.selectAll(".circles")
        .data(data)
        .filter(function(d) {return selectedG == d.Generation})
        .attr("display", display);
    }
}

function plotData(map) {
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // let toolTipChart = div.append("div").attr("id", "tipChart")
    let toolChart = div.append('svg')
        .attr('width', small_msm.width)
        .attr('height', small_msm.height)

    var color = d3.scaleOrdinal()
    .domain(Array.from(new Set(data.map(d => d["Type 1"]))))
    .range(["#4E79A7", "#A0CBE8", "#F28E2B", "#FFBE&D", "#59A14F", "#8CD17D",
    "#B6992D", "#499894", "#86BCB6", "#86BCB6", "#E15759", "#FF9D9A", "#79706E", "#BAB0AC", "#D37295"])

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 7)
        .attr('stroke-width', 2)
        .attr("fill", function(d) {return color(d["Type 1"])})
        .attr("class", "circles")
        // add tooltip functionality to points
        .on("mouseover", (d) => {
            toolChart.selectAll("*").remove()
            div.transition()
                .duration(200)
                .style("opacity", .9);
                div.html(d["Name"]+ "<br/>" +
                        d["Type 1"] + "<br/>" +
                        d["Type 2"])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    legend = d3.select("#legend")
        .append("svg")
        .attr("width", 500)
        .attr("height", msm.height)
    
    legend.selectAll('circle')
        .data(color.domain())
        .enter()
        .append('circle')
        .attr("cx", 10)
        .attr("cy", function(d,i){ return 24.5 + i*25})
        .attr('r', 6)
        .style("fill", function(d){ return color(d)})
    
    legend.selectAll("labels")
    .data(color.domain())
    .enter()
    .append("text")
    .attr("x", 20)
    .attr("y", function(d,i){ return 25 + i*25}) // 25 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

}

function makeLabels(svgContainer, msm, title, x, y) {
    svgContainer.append('text')
        .attr('x', (msm.width - 2 * msm.marginAll) / 2 - 90)
        .attr('y', msm.marginAll / 2 + 10)
        .style('font-size', '10pt')
        .text(title);

    svgContainer.append('text')
        .attr('x', (msm.width - 2 * msm.marginAll) / 2 - 30)
        .attr('y', msm.height - 10)
        .style('font-size', '10pt')
        .text(x);

    svgContainer.append('text')
        .attr('transform', 'translate( 15,' + (msm.height / 2 + 30) + ') rotate(-90)')
        .style('font-size', '10pt')
        .text(y);
}

// draw the axes and ticks
function drawAxes(limits, x, y, svgContainer, msm) {
    // return x value from a row of data
    let xValue = function (d) {
        return +d[x];
    }

    // function to scale x value
    let xScale = d3.scaleLinear()
        .domain([limits.xMin - 10, limits.xMax + 10]) // give domain buffer room
        .range([0 + msm.marginAll, msm.width - msm.marginAll])

    // xMap returns a scaled x value from a row of data
    let xMap = function (d) {
        return xScale(xValue(d));
    };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
        .attr('transform', 'translate(0, ' + (msm.height - msm.marginAll) + ')')
        .call(xAxis);

    // return y value from a row of data
    let yValue = function (d) {
        return +d[y]
    }

    // function to scale y
    let yScale = d3.scaleLinear()
        .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
        .range([0 + msm.marginAll, msm.height - msm.marginAll])

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) {
        return yScale(yValue(d));
    };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
        .attr('transform', 'translate(' + msm.marginAll + ', 0)')
        .call(yAxis);

    // return mapping and scaling functions
    return {
        x: xMap,
        y: yMap,
        xScale: xScale,
        yScale: yScale
    };
}

// find min and max for arrays of x and y
function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
    }
}
