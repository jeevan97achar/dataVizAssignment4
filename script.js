/*
 Function to load data from a CSV file, extract a specific column, and create a visualization.
 @param binCounts: number of contours to be used in the visualization.
*/
function LoadDataAndVisualize(binCounts) {
    // Load data
    d3.csv("data/Data_CT.csv").then(function (data) {
        // Extract the 'values_T' column from your data
        const extractedValues = data.map(d => +d[Object.keys(d)[0]]); // Convert to numeric value if needed

        // Set dimensions for the visualization
        const width = 800; // replace with your desired width
        const height = 600; // replace with your desired height
        const numColumns = 512; // number of columns
        const numRows = 500; // number of rows

        // Determine min, max, and mid values
        const min = d3.min(extractedValues);
        const max = d3.max(extractedValues);
        const mid = (min + max) / 2;

        // Sample color scale
        let colors = d3.scaleLinear()
            .domain(d3.range(min, max, parseInt(Math.abs(max - min) / 6.7)))
            .range(["#ffffff", "#3e5ebc", "#2b83ba", "#abdda6", "#fdae61", "#d7191c"])
            .interpolate(d3.interpolateHcl);

        // Initialize SVG element for visualization
        const svg = d3.select("#contourMap").append("svg")
            .attr("width", width)
            .attr("height", height);

        // Initialize brush slider
        const margin = 20;
        const sliderWidth = width - margin * 2;
        const sliderHeight = 60;

        var x = d3.scaleLinear()
            .domain([min, max])
            .range([0, sliderWidth]);

        var brush = d3.brushX()
            .extent([[0, 0], [sliderWidth, sliderHeight]])
            .on("brush", brushed);

        var slider = d3.select("body").append("svg")
            .attr("width", sliderWidth + margin * 2)
            .attr("height", sliderHeight + margin)
            .append("g")
            .attr("transform", "translate(" + margin + "," + margin + ")")
            .call(d3.axisBottom().scale(x).ticks(5));

        var brushg = slider.append("g")
            .attr("class", "brush")
            .call(brush);

        brush.move(brushg, [20, 50].map(x));

        // Brush event function
        function brushed() {
            var range = d3.brushSelection(this).map(x.invert);
            update(range[0], range[1]);
        }

        // Function to update visualization
        function update(newMin, newMax) {
            const contours = d3.contours()
                .size([numColumns, numRows])
                .thresholds(d3.range(newMin, newMax, binCounts))
                (extractedValues);

            svg.selectAll("path").remove();

            svg.selectAll("path")
                .data(contours)
                .enter().append("path")
                .attr("d", d3.geoPath())
                .attr("fill", d => colors(d.value));
        }

        // Initial contours creation
        const initialContours = d3.contours()
            .size([numColumns, numRows])
            .thresholds(d3.range(min, max, binCounts))
            (extractedValues);

        // Apply color to initial contours
        svg.selectAll("path")
            .data(initialContours)
            .enter().append("path")
            .attr("d", d3.geoPath())
            .attr("fill", d => colors(d.value));
    });
}

LoadDataAndVisualize(550);
