// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_line = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("data/weather.csv").then(data => {
    // 2.b: ... AND TRANSFORM DATA
    data.forEach(d => {
        d.year = +d3.timeFormat("%Y")(new Date(d.date));
        d.month = d3.timeFormat("%B")(new Date(d.date));
        d.record_max_temp = +d.record_max_temp;
    });    

    // Sort by month order, helped by chat
    const monthOrder = ["January", "February", "March", "April", "May", "June"];
    
    // 3.a: SET SCALES FOR CHART 1
    const xScale = d3.scalePoint()
        .domain(monthOrder)
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .range([height, 0]);
    const maxTempAllCities = d3.max(data.filter(d => d.year === 2015), d => d.record_max_temp);
    yScale.domain([0, maxTempAllCities]);

    // 4.a: PLOT DATA FOR CHART 1
    const line = d3.line()
        .x(d => xScale(d.month))
        .y(d => yScale(d.temp));

    // 5.a: ADD AXES FOR CHART 1
    svg1_line.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    // Add x-axis label
    svg1_line.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Month");

    // Add y-axis label
    svg1_line.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left / 2)
        .attr("x", -height / 2)
        .text("Record Max Temperature (°F)");
    
    // tooltip interactivity chart 1
    const tooltip = d3.select("body") 
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "12px");


    
    function updateChart(city) {
        const filteredData = data.filter(d => d.city === city && d.year === 2015);
        const monthlyMaxTemps = Array.from(
            d3.rollup(filteredData,
                v => {
                    const maxEntry = d3.max(v, d => d.record_max_temp);
                    return v.find(d => d.record_max_temp === maxEntry);
                },
                d => d.month
            ),
        ([month, d]) => ({ month, temp: d.record_max_temp, date: d.date })
    );

        
        monthlyMaxTemps.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
        
        svg1_line.selectAll(".data-line").remove();
        svg1_line.selectAll(".y-axis").remove();

        svg1_line.selectAll(".data-point").remove();
        svg1_line.selectAll(".hover-circle").remove();


        svg1_line.append("path")
            .datum(monthlyMaxTemps)
            .attr("class", "data-line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // svg1_line.append("g")
        //     .attr("class", "y-axis")
        //     .call(d3.axisLeft(yScale));

        svg1_line.selectAll(".data-point") 
            .data(monthlyMaxTemps) 
            // .data([selectedCategoryData]) // D7: Bind only to category selected by dropdown menu
            .enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("cx", d => xScale(d.month))
            .attr("cy", d => yScale(d.temp))
            .attr("r", 10)
            .style("fill", "transparent")
            .style("pointer-events", "all")
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html(`<strong>Date:</strong> ${d.date} <br><strong>Temp:</strong> ${d.temp}°F`)
                    .style("top", (event.pageY + 10) + "px") // Position relative to pointer
                    .style("left", (event.pageX + 10) + "px");

                // Create the large circle at the hovered point
                svg1_line.append("circle")
                    .attr("class", "hover-circle")
                    .attr("cx", xScale(d.month))  // Position based on the xScale (year)
                    .attr("cy", yScale(d.temp)) // Position based on the yScale (count)
                    .attr("r", 6)  // Radius of the large circle
                    .style("fill", "steelblue") // Circle color
                    .style("stroke-width", 2);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            // Remove the hover circle when mouseout occurs
            svg1_line.selectAll(".hover-circle").remove();
        });

    }
    updateChart("Chicago");
    d3.select("#categorySelect").on("change", function () {
        const selectedCity = d3.select(this).property("value");
        updateChart(selectedCity);
    });
    




    // 6.a: ADD LABELS FOR CHART 1
    // add title
    // svg1_line.append("text")
    //     .attr("class", "title")
    //     .attr("x", width / 2)
    //     .attr("y", -margin.top / 2)
    //     .text("");
    
    // 7.a: ADD INTERACTIVITY FOR CHART 1



});