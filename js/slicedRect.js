class SlicedRect {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;


    }

    initVis() {
        let vis = this;

        vis.margin = {top: 40, bottom: 40, left: 135, right: 135};

        const img = new Image();
        img.onload = () => {
            vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
            vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

            let scale = Math.min(vis.width / img.width, vis.height / img.height);

            vis.sum_fee = d3.sum(vis.data, d => d.visitor_visa_fee);
            vis.percentwidths = [];
            vis.percentoffsets = [];

            let cumulative = 0;

            vis.data.forEach(d => {
                let percentwidth = d.visitor_visa_fee / vis.sum_fee;
                vis.percentwidths.push(percentwidth);
                vis.percentoffsets.push(cumulative);
                cumulative += percentwidth;
            });

            vis.colorScale = d3.scaleLinear()
                .domain(d3.extent(vis.data, d => d.visitor_visa_refusal_rate))
                .range(["#333333", "#d73027"]);

            d3.select("#" + vis.parentElement).select("svg").remove();

            vis.svg = d3.select("#" + vis.parentElement).append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox", `0 0 ${vis.width + vis.margin.left + vis.margin.right} ${vis.height + vis.margin.top + vis.margin.bottom}`)
                .append("g")
                .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

            vis.tooltip = d3.select("#tooltip");

            vis.svg.append("image")
                .attr("xlink:href", "images/img.png")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", scale * img.width)
                .attr("height", scale * img.height)
                .lower();

            vis.svg.selectAll("rect.slice")
                .data(vis.data)
                .enter()
                .append("rect")
                .attr("class", "slice")
                .attr("x", (d, i) => scale * img.width * vis.percentoffsets[i])
                .attr("y", 0)
                .attr("width", (d, i) => scale * img.width * vis.percentwidths[i])
                .attr("height", scale * img.height)
                .attr("fill", (d, i) => vis.colorScale(d.visitor_visa_refusal_rate))
                .attr("opacity", 0.7)
                .on("mouseover", function(event, d) {
                    vis.tooltip
                        .style("opacity", 1)
                        .html(`
                        <strong>Region:</strong> ${d.consulate_country_region} <br>
                        <strong>Total Cost:</strong> ${(d.visitor_visa_fee / 1000000).toFixed(1)}M€ <br>
                        <strong>Refusal Rate:</strong> ${(d.visitor_visa_refusal_rate * 100).toFixed(1)}%`);
                })
                .on("mousemove", function(event) {
                    vis.tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY + 10) + "px");
                })
                .on("mouseleave", function() {
                    vis.tooltip
                        .style("opacity", 0);
                });

            vis.svg.selectAll(".label")
                .data(vis.data)
                .enter()
                .append("text")
                .attr("class", "label")
                .attr("x", (d,i) =>
                    scale * img.width * vis.percentoffsets[i] +
                    (scale * img.width * vis.percentwidths[i]) / 2
                )
                .attr("y", function(d, i) {
                    if (i % 2 === 0) return scale * img.height + 20;
                    else return scale * img.height + 40;
                })
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text(d => d.consulate_country_region)
                .attr("fill", "#e5e7eb")
                .attr("font-size", "10px");

            const defs = vis.svg.append("defs");

            const gradient = defs.append("linearGradient")
                .attr("id", "legend-gradient");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#333333");

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#d73027");

            const legendG = vis.svg.append("g")
                .attr("transform", `translate(0, ${scale * img.height + 60})`);

            legendG.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 150)
                .attr("height", 12)
                .attr("fill", "url(#legend-gradient)");

            legendG.append("text")
                .attr("x", 0)
                .attr("y", 25)
                .attr("fill", "#e5e7eb")
                .attr("font-size", "10px")
                .text("Low");

            legendG.append("text")
                .attr("x", 150)
                .attr("y", 25)
                .attr("text-anchor", "end")
                .attr("fill", "#e5e7eb")
                .attr("font-size", "10px")
                .text("High");

            legendG.append("text")
                .attr("x", 75)
                .attr("y", 40)
                .attr("text-anchor", "middle")
                .attr("fill", "#e5e7eb")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .text("Refusal Rate");
        };
        img.src = "images/img.png";

        /*vis.svg.selectAll("clipPath")
            .data(vis.data)
            .enter()
            .append("clipPath")
            .attr("id", (d,i) => "clip-" + i)
            .append("rect")
            .attr("x", (d,i) => vis.width * vis.percentoffsets[i])
            .attr("y", 0)
            .attr("width", (d, i) => vis.width * vis.percentwidths[i])
            .attr("height", vis.height);

        vis.svg.selectAll("imageSlice")
            .data(vis.data)
            .enter()
            .append("image")
            .attr("href", (d, i) => "img/img" + (i % 6) + ".png")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("clip-path", (d,i) => `url(#clip-${i})`);*/
    }
}