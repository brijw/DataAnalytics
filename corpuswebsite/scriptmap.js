(function() {
  'use strict';

  // map viewport dimensions
  var width = 860,
    height = 850;

// var legendText = ["Amuriat","Kabuleta","Kalembe","Katumba",
// "Kyagulanyi","Mao","Mayambala","Mugisha",
// "Mwesigye","Tumukunde","Museveni", "InvalidVotes"];

  // create a scale of colours for each party, so we can map results to district segments
  var quantize = d3.scale.quantize()
    .domain([1, 11])
    .range(d3.range(11).map(function(i) {
      return "f" + i;
    }));

  // set up map projection, and position it.
  var projection = d3.geo.albers()
  projection.center([36, 1.9])
    .rotate([0, 11.5, -16.4])
    .parallels([25, 35])
    .scale(5000);
  var path = d3.geo.path().projection(projection);

  // add d3 zoom behaviour to map container.
  var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

  // set up SVG, viewport and clipping mask for map
  var svg = d3.select('#electionMap')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('perserveAspectRatio', 'xMinYMid')
    .attr('id', "sizer-map")
    .attr('class', "sizer")
    .call(zoom);

  var rect = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "overlay")
    .style("fill", "none")
    .style("pointer-events", "all");
  var mapContainer = svg.append("g");
  var tooltip = d3.select("#tooltipContainer")
    .append("div")
    .attr("class", "tooltip");
  tooltip.html(" ");

  // Barchart
  var barchart = d3.select("#tooltipContainer")
    .append("div")
    .attr("class", "charty")
    .style("opacity", 0)
    .style("height", 0);



    // var piechart = d3.select("#tooltipContainer")
    //   .append("div")
    //   .attr("class", "charty")
    //   .style("opacity", 0)
    //   .style("height", 0);

  //Width and height of barchart
  var w = 260,
    h = 200,
    barPadding = 1;

  //Create bar chart
  var barsvg = barchart
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr('viewBox', '0 0 ' + w + ' ' + h)
    .attr('perserveAspectRatio', 'xMinYMid')
    .attr('id', "sizer-result")
    .attr('class', "sizer");

    // var piesvg = piechart
    //   .append("svg:svg")
    //   .attr("width", w)
    //   .attr("height", h)
    //   .attr('viewBox', '0 0 ' + w + ' ' + h)
    //   .attr('perserveAspectRatio', 'xMinYMid')
    //   .attr('id', "sizer-result")
    //   .attr('class', "sizer");



  // use queue function to load map and results data asynchronously, then call ready function when done.
  queue()
    .defer(d3.json, "map.json")
    .defer(d3.json, "election-data3.json")


    .await(ready);

  var ug, mapFeatures, boundaries, district;

  function ready(error, ug, boundaries) {
    mapFeatures = topojson.feature(ug, ug.objects.subunits).features;
    var map = mapContainer.append("g").attr("class", "subunits").selectAll("path").data(mapFeatures),
    district = boundaries.data,
    legend,
    content,
    amuriatCount=0,
    kabuletaCount=0,
    kalembeCount=0,
    katumbaCount=0,
    kyagulanyiCount=0,
    maoCount=0,
    mayambalaCount=0,
    mugishaCount=0,
    mwesigyeCount=0,
    tumukundeCount=0,
    museveniCount=0,
    //ValidVotesCount=0,
    invalidVotesCount=0;

    // count number of constituencies won by each party
    for (var i = 0; i < district.length; i++) {
      if (district[i].winner == 'Amuriat') {
        amuriatCount++;
      } else if (district[i].winner == 'Kabuleta') {
        kabuletaCount++;
      } else if (district[i].winner == 'Kalembe') {
        kalembeCount++;
      } else if (district[i].winner == 'Katumba') {
        katumbaCount++;
      } else if (district[i].winner == 'Kyagulanyi') {
        kyagulanyiCount++;
      } else if (district[i].winner == 'Mao') {
        maoCount++;
      } else if (district[i].winner == 'Mayambala') {
        mayambalaCount++;
      } else if (district[i].winner == 'Mugisha') {
        mugishaCount++;
      }
      else if (district[i].winner == 'Mwesigye') {
       mwesigyeCount++;
     }
     else if (district[i].winner == 'Tumukunde') {
      tumukundeCount++;
    }
    else if (district[i].winner == 'Museveni') {
     museveniCount++;
   } else {
        invalidVotesCount++;
      }
    }

    // count number of constituencies won by each party


    // make legend
    var color = d3.scale.ordinal().range(["#0000FF", "#964B00", "#FFFFFF", "#808000", "#FF0000", "#008000", "#008080", "#800080",
    "#CCCCFF","#FFA500","#FFFF00", "gray"]);
    color.domain(["Amuriat","Kabuleta","Kalembe","Katumba",
"Kyagulanyi","Mao","Mayambala","Mugisha",
"Mwesigye","Tumukunde","Museveni", "InvalidVotes"]);



    map.enter()
      .append("path")
      .attr("class", function(d, i) {
        var badge = "f0";
        if (typeof district[d.properties.id - 1] === "undefined") {
          badge = "f0";
        } else {

            badge = "f" + district[d.properties.id - 1].colour;

        }
        return "ward ward-" + d.properties.id + " " + badge;
      })
      .attr("d", path);

      map.on("mousemove", function(d,i){
        tooltip.style("opacity", 1);
        if (district[d.properties.id - 1].winner != "0") {
          d3.select(".charty").style("opacity", 1).style("height", "auto");
          content = "<h2>" + district[d.properties.id - 1].district + "</h2>" +
            "<p><strong class='f" + district[d.properties.id - 1].colour + "'>" +

          (  "Won")

            + " by " +

            (
             district[d.properties.id - 1].winner
           )  + "</strong>" + "<br/><span>Votes:</span> <strong>" + district[d.properties.id - 1].TotalVotes + "</strong></p>";


          tooltip.html(content);

          var partyData = [{
            "party": "Amuriat",
            "result": parseInt(district[d.properties.id - 1].Amuriat)
          }, {
            "party": "Kabuleta",
            "result": parseInt(district[d.properties.id - 1].Kabuleta)
          }, {
            "party": "Kalembe",
            "result": parseInt(district[d.properties.id - 1].Kalembe)
          }, {
            "party": "Katumba",
            "result": parseInt(district[d.properties.id - 1].Katumba)
          }, {
            "party": "Kyagulanyi",
            "result": parseInt(district[d.properties.id - 1].Kyagulanyi)
          }, {
            "party": "Mao",
            "result": parseInt(district[d.properties.id - 1].Mao)
          }, {
            "party": "Mayambala",
            "result": parseInt(district[d.properties.id - 1].Mayambala)
          }, {
            "party": "Mugisha",
            "result": parseInt(district[d.properties.id - 1].Mugisha)
          }, {
            "party": "Mwesigye",
            "result": parseInt(district[d.properties.id - 1].Mwesigye)
          }, {
            "party": "Tumukunde",
            "result": parseInt(district[d.properties.id - 1].Tumukunde)
          }, {
            "party": "Museveni",
            "result": parseInt(district[d.properties.id - 1].Museveni)
          }];



          partyData.push({
            "party": "InvalidVotes",
            "result": parseInt(district[d.properties.id - 1].InvalidVotes)
          });

          var SortByResult = function(x, y) {
            return y.result - x.result;
          };

          var max = d3.max(partyData, function(d) {
            return d.result;
          });

          var barx = d3.scale.linear().domain([0, max]).range([0, 160]);
          //var piex = d3.scale.linear().domain([0, max]).range([0, 160]);
          var winner = district[d.properties.id - 1].colour;

          barsvg.attr("width", w).attr("height", h).selectAll("rect")
            .data(partyData.sort(SortByResult).filter(function(d) {
              return d.result !== 0;
            }))
            .enter()
            .append("rect")
            .attr("x", 100)
            .attr("y", function(d, i) {
              return i * (h / partyData.length);
            })
            .attr("width", function(d, i) {
              return barx(d.result);
            })
            .attr("height", h / partyData.length - barPadding)
            .attr("class", function(d, i) {
              if (i < 1) {
                return "f" + winner;
              } else {
                return "lightbar";
              }
            });

          barsvg.selectAll("text")
            .data(partyData.sort(SortByResult).filter(function(d) {
              return d.result !== 0;
            }))
            .enter()
            .append("text")
            .text(function(d) {
              return d.party + ": " + d.result;
            })
            .attr("text-anchor", "left")
            .attr("x", function(d) {
              return 1;
            })
            .attr("y", function(d, i) {
              return i * (h / partyData.length - barPadding) + 20;
            })
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "black");
          }

        // } else {
        //   content = "<h2>" + district[d.properties.id - 1].district + "</h2>" + "<p><strong>Previously held by " + ((district[d.properties.id - 1].previous_winner == "Liberal Democrat" || district[d.properties.id - 1].previous_winner == "Conservative") ? district[d.properties.id - 1].previous_winner + "s" : district[d.properties.id - 1].previous_winner) + "</strong></p>";
        //   d3.select(".charty").style("opacity", 0);
        //   tooltip.html(content);
        // }
        var badge = "f0";
        if (!isNaN(district[d.properties.id - 1].colour)) {

            badge = "f" + district[d.properties.id - 1].colour;

        }
        d3.select("#tooltipContainer h2").attr("class", badge);
      })
      .on("mouseout", function(d) {
       tooltip.html(" ");
       d3.select(".charty").style("height", 0);
       barsvg.attr("width", 0).attr("height", 0);
       barsvg.selectAll("rect,text").remove();
     });

  }

  function zoomed() {
    var t = d3.event.translate,
      s = d3.event.scale;
    t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s) - 150 * s, t[0]));
    t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));
    zoom.translate(t);
    mapContainer.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
  }


}());
