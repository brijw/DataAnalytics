var margin = {
        top: 20,
        right: 210,
        bottom: 50,
        left: 70
    },
    outerWidth = 1050,
    outerHeight = 500,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]).nice();

var y = d3.scale.linear()
    .range([height, 0]).nice();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-height);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(-width);

var xCat = "perctofvalidvotes",
    yCat = "perctofregvoters",
    rCat = "pertofinvalidvotes",
    colorCat = "winner";

var labels = {
    "pertofinvalidvotes": "%Invalid Votes from Total Votes Cast",
    "perctofregvoters": "%Voter Turn Out",
    "perctofvalidvotes": "%Valid Votes for Museveni from total Cast"
}

d3.csv("musevenivotepattern.csv", function(data) {
    data.forEach(function(d) {
        d.perctofregvoters = +d.perctofregvoters;
        d.icustay_id = +d.icustay_id;
        d.perctofvalidvotes = +d.perctofvalidvotes;
        d.pertofinvalidvotes = +d.pertofinvalidvotes;
        d.hospital_expire_flag = +d.hospital_expire_flag;
        d.winner = d.winner;
    });

    var xMax = d3.max(data, function(d) {
            return d[xCat];
        }) * 1.05,
        xMin = d3.min(data, function(d) {
            return d[xCat];
        }),
        xMin = xMin > 0 ? 0 : xMin,
        yMax = d3.max(data, function(d) {
            return d[yCat];
        }) * 1.05,
        yMin = d3.min(data, function(d) {
            return d[yCat];
        }),
        yMin = yMin > 0 ? 0 : yMin;
    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    var color = d3.scale.category10();

    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return labels[xCat] + ": " + d[xCat] + "<br>" + labels[yCat] + ": " + d[yCat] + "<br>" + labels[rCat] + ": " + d[rCat];
        });

    var zoomBeh = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([0, 1000])
        .on("zoom", zoom);

    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoomBeh);
    svg.call(tip);
    svg.append("rect")
        .attr("width", width)
        .attr("height", height);
    svg.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .classed("label", true)
        .attr("x", width)
        .attr("y", margin.bottom - 10)
        .style("text-anchor", "end")
        .text("%Valid Votes for Museveni from total Cast");
    svg.append("g")
        .classed("y axis", true)
        .call(yAxis)
        .append("text")
        .classed("label", true)
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("dy", "1.5em")
        .style("text-anchor", "end")
        .text("%Voter Turn Out");

    var objects = svg.append("svg")
        .classed("objects", true)
        .attr("width", width)
        .attr("height", height);
    objects.append("svg:line")
        .classed("axisLine hAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("transform", "translate(0," + height + ")");
    objects.append("svg:line")
        .classed("axisLine vAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height);
    objects.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .classed("dot", true)
        .attr({
            r: function(d) {
                return 4 * Math.sqrt(d[rCat] / Math.PI);
            },
            cx: function(d) {
                return x(d[xCat]);
            },
            cy: function(d) {
                return y(d[yCat]);
            }
        })
    .style("fill", function(d) {
        return color(d[colorCat]);
    })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .classed("legend", true)
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });
    legend.append("rect")
        .attr("x", width + 10)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", color);
    legend.on("click", function(type) {
        // dim all of the icons in legend
        d3.selectAll(".legend")
            .style("opacity", 0.1);
        // make the one selected be un-dimmed
        d3.select(this)
            .style("opacity", 1);
        // select all dots and apply 0 opacity (hide)
        d3.selectAll(".dot")
        // .transition()
        // .duration(500)
        .style("opacity", 0.0)
        // filter out the ones we want to show and apply properties
        .filter(function(d) {
            return d["winner"] == type;
        })
            .style("opacity", 1) // need this line to unhide dots
        .style("stroke", "black")
        // apply stroke rule
        .style("fill", function(d) {
            if (d.hospital_expire_flag == 1) {
                return this
            } else {
                return "white"
            };
        });
    });
    legend.append("text")
        .attr("x", width + 26)
        .attr("dy", ".65em")
        .text(function(d) {
            return d;
        });
    d3.select("button.reset").on("click", change)
    d3.select("button.changexlos").on("click", updateX)

    function change() {
        xMax = d3.max(data, function(d) {
            return d[xCat];
        });
        xMin = d3.min(data, function(d) {
            return d[xCat];
        });
        zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));

        var svg = d3.select("#scatter").transition();
        svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(labels[xCat]);
        objects.selectAll(".dot").transition().duration(1000)
            .attr({
                r: function(d) {
                    return 4 * Math.sqrt(d[rCat] / Math.PI);
                },
                cx: function(d) {
                    return x(d[xCat]);
                },
                cy: function(d) {
                    return y(d[yCat]);
                }
            })
    }

    function zoom() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        svg.selectAll(".dot")
            .attr({
                cx: function(d) {
                    return x(d[xCat]);
                },
                cy: function(d) {
                    return y(d[yCat]);
                }
            })
            // .attr("transform", transform);
    }

    function transform(d) {
        return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
    }

    function updateX() {
        xCat = "pertofinvalidvotes",
        yCat = "perctofregvoters",
        rCat = "perctofvalidvotes",
        colorCat = "winner";
        xMax = d3.max(data, function(d) {
            return d[xCat];
        }) * 1.05,
        xMin = d3.min(data, function(d) {
            return d[xCat];
        }),
        xMin = xMin > 0 ? 0 : xMin,
        yMax = d3.max(data, function(d) {
            return d[yCat];
        }) * 1.05,
        yMin = d3.min(data, function(d) {
            return d[yCat];
        }),
        yMin = yMin > 0 ? 0 : yMin;
        x.domain([xMin, xMax]);
        y.domain([yMin, yMax]);

        var zoomBeh = d3.behavior.zoom()
            .x(x)
            .y(y)
            .scaleExtent([0, 1000])
            .on("zoom", zoom);

        var svg = d3.select("svg").transition();
        svg.select(".y.axis")
            .duration(1000)
            .call(yAxis);
        svg.select('.x.axis')
            .duration(1000)
            .call(xAxis);
        svg.select('.label')
            .duration(1000)
        .attr("x", width)
            .attr("y", margin.bottom - 10)
            .style("text-anchor", "end")
            .text("%Invalid Votes from Total Votes Cast");

        d3.selectAll("circle.dot")
            .transition()
            .duration(1000)
            .attr({
                r: function(d) {
                    return 4 * Math.sqrt(d[rCat] / Math.PI);
                },
                cx: function(d) {
                    return x(d[xCat]);
                },
                cy: function(d) {
                    return y(d[yCat]);
                }
            })
    }
});