(function scatterxy(tag, board, sw)

{

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

var xCat = "PCA_X",
    yCat = "PCA_Y",
    rCat = "comment_id",
	distCat = "Comment",
    colorCat = "winner";

var labels = {
    "comment_id": "comment_id",
    "PCA_Y": "PCA Y Value",
    "PCA_X": "PCA X Value",
	"Comment": "Comment"
}

d3.csv("Comments_test.csv", function(data) {
    data.forEach(function(d) {
        d.PCA_Y = +d.PCA_Y;
        d.icustay_id = +d.icustay_id;
        d.PCA_X = +d.PCA_X;
        d.comment_id = +d.comment_id;
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
            return labels[xCat] + ": " + d[xCat] + "<br>" + labels[yCat] + ": " + d[yCat] + "<br>" + labels[rCat] + ": " + d[rCat]+ "<br>" + labels[distCat] + ": " + d[distCat];
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
        .text("PCA X Values");
    svg.append("g")
        .classed("y axis", true)
        .call(yAxis)
        .append("text")
        .classed("label", true)
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("dy", "1.5em")
        .style("text-anchor", "end")
        .text("PCA Y Values");

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
                return 0.2 * Math.sqrt(d[rCat] / Math.PI);
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
        xCat = "comment_id",
        yCat = "PCA_Y",
        rCat = "PCA_X",
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


}());













// Word cloud layout by Jason Davies, http://www.jasondavies.com/word-cloud/
// Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf

// Word cloud layout by Jason Davies, http://www.jasondavies.com/word-cloud/
// Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf
(function() {

if (typeof define === "function" && define.amd) define(["d3"], cloud);
else cloud(this.d3);



function cloud(d3) {
  d3.layout.cloud = function cloud() {
    var size = [256, 256],
        text = cloudText,
        font = cloudFont,
        fontSize = cloudFontSize,
        fontStyle = cloudFontNormal,
        fontWeight = cloudFontNormal,
        rotate = cloudRotate,
        padding = cloudPadding,
        spiral = archimedeanSpiral,
        words = [],
        timeInterval = Infinity,
        event = d3.dispatch("word", "end"),
        timer = null,
        random = Math.random,
        cloud = {};

    cloud.start = function() {
      var board = zeroArray((size[0] >> 5) * size[1]),
          bounds = null,
          n = words.length,
          i = -1,
          tags = [],
          data = words.map(function(d, i) {
            d.text = text.call(this, d, i);
            d.font = font.call(this, d, i);
            d.style = fontStyle.call(this, d, i);
            d.weight = fontWeight.call(this, d, i);
            d.rotate = rotate.call(this, d, i);
            d.size = ~~fontSize.call(this, d, i);
            d.padding = padding.call(this, d, i);
            return d;
          }).sort(function(a, b) { return b.size - a.size; });

      if (timer) clearInterval(timer);
      timer = setInterval(step, 0);
      step();

      return cloud;

      function step() {
        var start = Date.now();
        while (Date.now() - start < timeInterval && ++i < n && timer) {
          var d = data[i];
          d.x = (size[0] * (random() + .5)) >> 1;
          d.y = (size[1] * (random() + .5)) >> 1;
          cloudSprite(d, data, i);
          if (d.hasText && place(board, d, bounds)) {
            tags.push(d);
            event.word(d);
            if (bounds) cloudBounds(bounds, d);
            else bounds = [{x: d.x + d.x0, y: d.y + d.y0}, {x: d.x + d.x1, y: d.y + d.y1}];
            // Temporary hack
            d.x -= size[0] >> 1;
            d.y -= size[1] >> 1;
          }
        }
        if (i >= n) {
          cloud.stop();
          event.end(tags, bounds);
        }
      }
    }

    cloud.stop = function() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      return cloud;
    };

    function place(board, tag, bounds) {
      var perimeter = [{x: 0, y: 0}, {x: size[0], y: size[1]}],
          startX = tag.x,
          startY = tag.y,
          maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]),
          s = spiral(size),
          dt = random() < .5 ? 1 : -1,
          t = -dt,
          dxdy,
          dx,
          dy;

      while (dxdy = s(t += dt)) {
        dx = ~~dxdy[0];
        dy = ~~dxdy[1];

        if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) break;

        tag.x = startX + dx;
        tag.y = startY + dy;

        if (tag.x + tag.x0 < 0 || tag.y + tag.y0 < 0 ||
            tag.x + tag.x1 > size[0] || tag.y + tag.y1 > size[1]) continue;
        // TODO only check for collisions within current bounds.
        if (!bounds || !cloudCollide(tag, board, size[0])) {
          if (!bounds || collideRects(tag, bounds)) {
            var sprite = tag.sprite,
                w = tag.width >> 5,
                sw = size[0] >> 5,
                lx = tag.x - (w << 4),
                sx = lx & 0x7f,
                msx = 32 - sx,
                h = tag.y1 - tag.y0,
                x = (tag.y + tag.y0) * sw + (lx >> 5),
                last;
            for (var j = 0; j < h; j++) {
              last = 0;
              for (var i = 0; i <= w; i++) {
                board[x + i] |= (last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
              }
              x += sw;
            }
            delete tag.sprite;
            return true;
          }
        }
      }
      return false;
    }

    cloud.timeInterval = function(_) {
      return arguments.length ? (timeInterval = _ == null ? Infinity : _, cloud) : timeInterval;
    };

    cloud.words = function(_) {
      return arguments.length ? (words = _, cloud) : words;
    };

    cloud.size = function(_) {
      return arguments.length ? (size = [+_[0], +_[1]], cloud) : size;
    };

    cloud.font = function(_) {
      return arguments.length ? (font = d3.functor(_), cloud) : font;
    };

    cloud.fontStyle = function(_) {
      return arguments.length ? (fontStyle = d3.functor(_), cloud) : fontStyle;
    };

    cloud.fontWeight = function(_) {
      return arguments.length ? (fontWeight = d3.functor(_), cloud) : fontWeight;
    };

    cloud.rotate = function(_) {
      return arguments.length ? (rotate = d3.functor(_), cloud) : rotate;
    };

    cloud.text = function(_) {
      return arguments.length ? (text = d3.functor(_), cloud) : text;
    };

    cloud.spiral = function(_) {
      return arguments.length ? (spiral = spirals[_] || _, cloud) : spiral;
    };

    cloud.fontSize = function(_) {
      return arguments.length ? (fontSize = d3.functor(_), cloud) : fontSize;
    };

    cloud.padding = function(_) {
      return arguments.length ? (padding = d3.functor(_), cloud) : padding;
    };

    cloud.random = function(_) {
      return arguments.length ? (random = _, cloud) : random;
    };

    return d3.rebind(cloud, event, "on");
  };

  function cloudText(d) {
    return d.text;
  }

  function cloudFont() {
    return "serif";
  }

  function cloudFontNormal() {
    return "normal";
  }

  function cloudFontSize(d) {
    return Math.sqrt(d.value);
  }

  function cloudRotate() {
    return (~~(Math.random() * 6) - 3) * 30;
  }

  function cloudPadding() {
    return 1;
  }

  // Fetches a monochrome sprite bitmap for the specified text.
  // Load in batches for speed.
  function cloudSprite(d, data, di) {
    if (d.sprite) return;
    c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);
    var x = 0,
        y = 0,
        maxh = 0,
        n = data.length;
    --di;
    while (++di < n) {
      d = data[di];
      c.save();
      c.font = d.style + " " + d.weight + " " + ~~((d.size + 1) / ratio) + "px " + d.font;
      var w = c.measureText(d.text + "m").width * ratio,
          h = d.size << 1;
      if (d.rotate) {
        var sr = Math.sin(d.rotate * cloudRadians),
            cr = Math.cos(d.rotate * cloudRadians),
            wcr = w * cr,
            wsr = w * sr,
            hcr = h * cr,
            hsr = h * sr;
        w = (Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5 << 5;
        h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
      } else {
        w = (w + 0x1f) >> 5 << 5;
      }
      if (h > maxh) maxh = h;
      if (x + w >= (cw << 5)) {
        x = 0;
        y += maxh;
        maxh = 0;
      }
      if (y + h >= ch) break;
      c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
      if (d.rotate) c.rotate(d.rotate * cloudRadians);
      c.fillText(d.text, 0, 0);
      if (d.padding) c.lineWidth = 2 * d.padding, c.strokeText(d.text, 0, 0);
      c.restore();
      d.width = w;
      d.height = h;
      d.xoff = x;
      d.yoff = y;
      d.x1 = w >> 1;
      d.y1 = h >> 1;
      d.x0 = -d.x1;
      d.y0 = -d.y1;
      d.hasText = true;
      x += w;
    }
    var pixels = c.getImageData(0, 0, (cw << 5) / ratio, ch / ratio).data,
        sprite = [];
    while (--di >= 0) {
      d = data[di];
      if (!d.hasText) continue;
      var w = d.width,
          w32 = w >> 5,
          h = d.y1 - d.y0;
      // Zero the buffer
      for (var i = 0; i < h * w32; i++) sprite[i] = 0;
      x = d.xoff;
      if (x == null) return;
      y = d.yoff;
      var seen = 0,
          seenRow = -1;
      for (var j = 0; j < h; j++) {
        for (var i = 0; i < w; i++) {
          var k = w32 * j + (i >> 5),
              m = pixels[((y + j) * (cw << 5) + (x + i)) << 2] ? 1 << (31 - (i % 32)) : 0;
          sprite[k] |= m;
          seen |= m;
        }
        if (seen) seenRow = j;
        else {
          d.y0++;
          h--;
          j--;
          y++;
        }
      }
      d.y1 = d.y0 + seenRow;
      d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
    }
  }

  // Use mask-based collision detection.
  function cloudCollide(tag, board, sw) {
    sw >>= 5;
    var sprite = tag.sprite,
        w = tag.width >> 5,
        lx = tag.x - (w << 4),
        sx = lx & 0x7f,
        msx = 32 - sx,
        h = tag.y1 - tag.y0,
        x = (tag.y + tag.y0) * sw + (lx >> 5),
        last;
    for (var j = 0; j < h; j++) {
      last = 0;
      for (var i = 0; i <= w; i++) {
        if (((last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0))
            & board[x + i]) return true;
      }
      x += sw;
    }
    return false;
  }

  function cloudBounds(bounds, d) {
    var b0 = bounds[0],
        b1 = bounds[1];
    if (d.x + d.x0 < b0.x) b0.x = d.x + d.x0;
    if (d.y + d.y0 < b0.y) b0.y = d.y + d.y0;
    if (d.x + d.x1 > b1.x) b1.x = d.x + d.x1;
    if (d.y + d.y1 > b1.y) b1.y = d.y + d.y1;
  }

  function collideRects(a, b) {
    return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
  }

  function archimedeanSpiral(size) {
    var e = size[0] / size[1];
    return function(t) {
      return [e * (t *= .1) * Math.cos(t), t * Math.sin(t)];
    };
  }

  function rectangularSpiral(size) {
    var dy = 4,
        dx = dy * size[0] / size[1],
        x = 0,
        y = 0;
    return function(t) {
      var sign = t < 0 ? -1 : 1;
      // See triangular numbers: T_n = n * (n + 1) / 2.
      switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
        case 0:  x += dx; break;
        case 1:  y += dy; break;
        case 2:  x -= dx; break;
        default: y -= dy; break;
      }
      return [x, y];
    };
  }

  // TODO reuse arrays?
  function zeroArray(n) {
    var a = [],
        i = -1;
    while (++i < n) a[i] = 0;
    return a;
  }

  var cloudRadians = Math.PI / 180,
      cw = 1 << 11 >> 5,
      ch = 1 << 11,
      canvas,
      ratio = 1;

  if (typeof document !== "undefined") {
    canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    ratio = Math.sqrt(canvas.getContext("2d").getImageData(0, 0, 1, 1).data.length >> 2);
    canvas.width = (cw << 5) / ratio;
    canvas.height = ch / ratio;
  } else {
    // Attempt to use node-canvas.
    canvas = new Canvas(cw << 5, ch);
  }

  var c = canvas.getContext("2d"),
      spirals = {
        archimedean: archimedeanSpiral,
        rectangular: rectangularSpiral
      };
  c.fillStyle = c.strokeStyle = "red";
  c.textAlign = "center";
}




})();


(function() {
  var margin = {top: 20, right: 20, bottom: 40, left: 20},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  d3.csv("ner_of_corpus.csv", function(error, data) {

    var categories = d3.keys(d3.nest().key(function(d) { return d.Classes; }).map(data));
    var color = d3.scale.ordinal().range(["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"]);
    var fontSize = d3.scale.pow().exponent(5).domain([0,1]).range([10,80]);

    var layout = d3.layout.cloud()
        .timeInterval(10)
        .size([width, height])
        .words(data)
        .rotate(function(d) { return 0; })
        .font('monospace')
        .fontSize(function(d,i) { return fontSize(Math.random()); })
        .text(function(d) { return d.Comment; })
        .spiral("archimedean")
        .on("end", draw)
        .start();

    var svg = d3.select("#my_dataviz").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var wordcloud = svg.append("g")
        .attr('class','wordcloud')
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1)
        .domain(categories);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll('text')
        .style('font-size','20px')
        .style('fill',function(d) { return color(d); })
        .style('font','sans-serif');

    function draw(words) {
      wordcloud.selectAll("text")
          .data(words)
        .enter().append("text")
          .attr('class','word')
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", function(d) { return d.font; })
          .style("fill", function(d) {
              var paringObject = data.filter(function(obj) { return obj.Comment === d.text});
              return color(paringObject[0].Classes);
          })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
          .text(function(d) { return d.text; });
    };

  });


})();







(function(){
    const sample = [
    {

      Category: 'Very Poor',
      Count: 2696,
      color: '#000000'
    },
    {
      Category: 'Poor',
      Count: 356,
      color: '#00a2ee'
    },

    {
      Category: 'Neutral',
      Count: 157,
      color: '#007bc8'
    },
    {
      Category: 'Good',
      Count: 349,
      color: '#65cedb'
    },
    {
      Category: 'Excellent',
      Count: 316,
      color: '#ff6e52'
    }
  ];

  const svg = d3v5.select('svg');
  const svgContainer = d3v5.select('#graphcontainer');

  const margin = 80;
  const width = 700 - 2 * margin;
  const height = 500 - 2 * margin;

  const chart = svg.append('g')
    .attr('transform', `translate(${margin}, ${margin})`);

  const xScale = d3v5.scaleBand()
    .range([0, width])
    .domain(sample.map((s) => s.Category))
    .padding(0.3)

  const yScale = d3v5.scaleLinear()
    .range([height, 0])
    .domain([0, 2800]);

  // vertical grid lines
  // const makeXLines = () => d3v5.axisBottom()
  //   .scale(xScale)

  const makeYLines = () => d3v5.axisLeft()
    .scale(yScale)

  chart.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3v5.axisBottom(xScale));

  chart.append('g')
    .call(d3v5.axisLeft(yScale));

  // vertical grid lines
  // chart.append('g')
  //   .attr('class', 'grid')
  //   .attr('transform', `translate(0, ${height})`)
  //   .call(makeXLines()
  //     .tickSize(-height, 0, 0)
  //     .tickFormat('')
  //   )

  chart.append('g')
    .attr('class', 'grid')
    .call(makeYLines()
      .tickSize(-width, 0, 0)
      .tickFormat('')
    )

  const barGroups = chart.selectAll()
    .data(sample)
    .enter()
    .append('g')

  barGroups
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (g) => xScale(g.Category))
    .attr('y', (g) => yScale(g.Count))
    .attr('height', (g) => height - yScale(g.Count))
    .attr('width', xScale.bandwidth())
    .on('mouseenter', function (actual, i) {
      d3v5.selectAll('.Count')
        .attr('opacity', 0)

      d3v5.select(this)
        .transition()
        .duration(300)
        .attr('opacity', 0.6)
        .attr('x', (a) => xScale(a.Category) - 5)
        .attr('width', xScale.bandwidth() + 10)

      const y = yScale(actual.Count)

      line = chart.append('line')
        .attr('id', 'limit')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)

      barGroups.append('text')
        .attr('class', 'divergence')
        .attr('x', (a) => xScale(a.Category) + xScale.bandwidth() / 2)
        .attr('y', (a) => yScale(a.Count) + 30)
        .attr('fill', 'white')
        .attr('text-anchor', 'middle')
        .text((a, idx) => {
          const divergence = (a.Count - actual.Count).toFixed(1)

          let text = ''
          if (divergence > 0) text += '+'
          text += `${divergence}`

          return idx !== i ? text : '';
        })

    })
    .on('mouseleave', function () {
      d3v5.selectAll('.Count')
        .attr('opacity', 1)

      d3v5.select(this)
        .transition()
        .duration(300)
        .attr('opacity', 1)
        .attr('x', (a) => xScale(a.Category))
        .attr('width', xScale.bandwidth())

      chart.selectAll('#limit').remove()
      chart.selectAll('.divergence').remove()
    })

  barGroups
    .append('text')
    .attr('class', 'Count')
    .attr('x', (a) => xScale(a.Category) + xScale.bandwidth() / 2)
    .attr('y', (a) => yScale(a.Count) + 30)
    .attr('text-anchor', 'middle')
    .text((a) => `${a.Count}`)

  svg
    .append('text')
    .attr('class', 'label')
    .attr('x', -(height / 2) - margin)
    .attr('y', margin / 2.4)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Category Count')

  svg.append('text')
    .attr('class', 'label')
    .attr('x', width / 2 + margin)
    .attr('y', height + margin * 1.7)
    .attr('text-anchor', 'middle')
    .text('Categories')

  svg.append('text')
    .attr('class', 'title')
    .attr('x', width / 2 + margin)
    .attr('y', 40)
    .attr('text-anchor', 'middle')
    .text('Count of Sentence Categories')

  svg.append('text')
    .attr('class', 'source')
    .attr('x', width - margin / 2)
    .attr('y', height + margin * 1.7)
    .attr('text-anchor', 'start')
    .text('Source: Corpus')
}());
