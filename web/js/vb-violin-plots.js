/**
 * Created by Ioannis on 18/6/2015.
 */
// Class: Violin --------------------------------------------- //
function addViolin(svg, results, range, width, domain, resolution, interpolation, log) {

    "use strict";

    var dx = (domain[1] / resolution) / 2;
    // for x axis
    var y = d3.scale.linear()
        .range([width / 2, 0])
        .domain([0, Math.max(d3.max(results, function (d) {
            return d.count * 1.5;
        }))]); //0 -  max probability


    if (log) {
        var x = d3.scale.log()
            .range(range)
            .domain(domain)
            .nice();
        console.log('Printing log in violin');
    } else {
        // for y axis
        var x = d3.scale.linear()
            .range(range)
            .domain(domain)
            .nice();
    }


    console.log("Now printing scaled violin area data");
    var area = d3.svg.area()
        .interpolate(interpolation)
        .x(function (d) {
            if (interpolation == "step-before") {
                //console.log(x(d.x + d.dx / 2));
                return x(d.val + dx)
            }
            console.log('*' + d.val + ':' + x(d.val));
            return x(d.val);
        })
        .y0(width / 2)
        .y1(function (d) {
            return y(d.count);
        });

    var line = d3.svg.line()
        .interpolate(interpolation)
        .x(function (d) {
            if (interpolation == "step-before")
                return x(d.val + dx);
            return x(d.val);
        })
        .y(function (d) {
            return y(d.count);
        });

    var gPlus = svg.append("g");
    var gMinus = svg.append("g");

    gPlus.append("path")
        .datum(results)
        .attr("class", "area")
        .attr("d", area);

    gPlus.append("path")
        .datum(results)
        .attr("class", "violin")
        .attr("d", line);


    gMinus.append("path")
        .datum(results)
        .attr("class", "area")
        .attr("d", area);

    gMinus.append("path")
        .datum(results)
        .attr("class", "violin")
        .attr("d", line);

    var x = width;

    gPlus.attr("transform", "rotate(90,0,0)  translate(0,-" + width + ")");//translate(0,-200)");
    gMinus.attr("transform", "rotate(90,0,0) scale(1,-1)");


}

function addBoxPlot(svg, elmProbs, elmMean, range, width, domain, boxPlotWidth, log) {

    "use strict";

    if (log) {
        var y = d3.scale.log()
            .range(range)
            .domain(domain)
            .nice();
        console.log('Printing log in boxplot');

    } else {

        var y = d3.scale.linear()
            .range(range)
            .domain(domain)
            .nice();
    }

    var x = d3.scale.linear()
        .range([0, width]);

    var left = 0.5 - boxPlotWidth / 2;
    var right = 0.5 + boxPlotWidth / 2;

    var probs = [0.05, 0.25, 0.5, 0.75, 0.95];
    for (var i = 0; i < probs.length; i++) {
        probs[i] = y(elmProbs[i]);
    }

    var gBoxPlot = svg.append("g")


    gBoxPlot.append("rect")
        .attr("class", "boxplot fill")
        .attr("x", x(left))
        .attr("width", x(right) - x(left))
        .attr("y", probs[3])
        .attr("height", -probs[3] + probs[1]);

    var iS = [0, 2, 4];
    var iSclass = ["", "median", ""];
    for (var i = 0; i < iS.length; i++) {
        gBoxPlot.append("line")
            .attr("class", "boxplot " + iSclass[i])
            .attr("x1", x(left))
            .attr("x2", x(right))
            .attr("y1", probs[iS[i]])
            .attr("y2", probs[iS[i]])
    }

    iS = [[0, 1], [3, 4]];
    for (i = 0; i < iS.length; i++) {
        gBoxPlot.append("line")
            .attr("class", "boxplot")
            .attr("x1", x(0.5))
            .attr("x2", x(0.5))
            .attr("y1", probs[iS[i][0]])
            .attr("y2", probs[iS[i][1]]);
    }

    gBoxPlot.append("rect")
        .attr("class", "boxplot")
        .attr("x", x(left))
        .attr("width", x(right) - x(left))
        .attr("y", probs[3])
        .attr("height", -probs[3] + probs[1]);

    gBoxPlot.append("circle")
        .attr("class", "boxplot mean")
        .attr("cx", x(0.5))
        .attr("cy", y(elmMean))
        .attr("r", x(boxPlotWidth / 5));

    //gBoxPlot.append("circle")
    //    .attr("class", "boxplot mean")
    //    .attr("cx", x(0.5))
    //    .attr("cy", y(elmMean))
    //    .attr("r", x(boxPlotWidth / 10));


}

function addBeeswarm(svg, points, range, width, yDomain, xDomain, log) {

    "use strict";

    var tooltip = d3.select('#beeSwarmTooltip');

    if (log) {
        var y = d3.scale.log()
            .range(range)
            .domain(yDomain)
            .nice();

    } else {

        var y = d3.scale.linear()
            .range(range)
            .domain(yDomain)
            .nice();
    }

    var x = d3.scale.linear()
        .range([0, width])
        .domain(xDomain)
        .nice();


    var gSwarmPlot = svg.append("g");


    points.swarm.forEach(function (p, i) {

        var species = points.data[i].species, insecticide = points.data[i].insecticide;

        gSwarmPlot.append("circle")
            .attr("cx", x(p.x))
            .attr("cy", y(p.y))
            .attr("r", 4)
            .style("fill", palette[species])
            //ToDo: Make mouseovers stylistically similar with the donut charts
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html(species + "<br/> ("
                    + insecticide + ": " + points.data[i].y + ")")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px")

            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    });


}

function createBeeViolinPlot(divid, BBox, count) {

    "use strict";

    // Only proceed if in IR mode
    if ($('#view-mode').val() === 'smpl') return;

    var self = this;
    var width = 280;
    var height = 300;
    var url = 'http://funcgen.vectorbase.org/popbio-map-preview/asolr/solr/vb_popbio/irViolinStats?&' + qryUrl + BBox + '&json.wrf=?&callback=?';

    //console.log(BBox);
    //console.log(count);

    $.getJSON(url)
        .done(function (json) {
            // make sure the parent div is empty
            $(divid).empty();

            if (json.facets.count && json.facets.count > 0) {

                // let's create and populate a drop down
                var s = $('<select />').attr('id', 'plotType');

                // add options to the selection box, store additional info into data
                json.facets.vtypes.buckets.forEach(function (element) {
                        var i = 0;
                        element.vunits.buckets.forEach(function (innElement) {
                            var optionText = element.val + ' (' + innElement.val + '): ' + innElement.count + ' phenotypes';
                            $('<option/>', {
                                text: optionText,
                                value: innElement.val,
                                data: {
                                    phenotype_value_type_s: element.val,
                                    phenotype_value_unit_s: innElement.val,
                                    count: innElement.count,
                                    min: innElement.pmin,
                                    max: innElement.pmax
                                }
                            }).appendTo(s);
                        })
                    }
                )
                ;

                s.appendTo($(divid));

                // build the graph using the first option in the drop-down
                var selectionData = s.find(':selected').data();
                buildPlot(divid, BBox, selectionData);

                // build a new graph whenever selection is changed
                s.change(function () {
                    selectionData = s.find(':selected').data();
                    buildPlot(divid, BBox, selectionData);
                });


            }
        })
        .fail(function () {
            console.log('Failed while loading irViolinStats')
        });


}

function buildPlot(divid, BBox, selection) {
    "use strict";

    var pCount = selection.count, pMin = selection.min, pMax = selection.max,
        pType = selection.phenotype_value_type_s, pUnit = selection.phenotype_value_unit_s;
    var width = 250, height = 300;
    var plotDiv = d3.select(divid);

    if (pUnit === 'percent') {
        pMin = 0;
        pMax = 100;
    }
    if (d3.select('#beeViolinPlot')) d3.select('#beeViolinPlot').remove();
    var svg = plotDiv.append("svg")
        .attr("style", 'width: 400px; height: 500px; border: 0; padding-top:20px')
        .attr("id", "beeViolinPlot");

    var yDomain, boxWidth = 100, boxSpacing = 10;
    var margin = {top: 30, bottom: 30, left: 30, right: 20};

    var vlJsonFacet = {
        pmean: "avg(phenotype_value_f)",
        pperc: "percentile(phenotype_value_f,5,25,50,75,95)",
        //pmin: "min(phenotype_value_f)",
        //pmax: "max(phenotype_value_f)",
        denplot: {
            type: "range",
            field: "phenotype_value_f",
            gap: (pMax - pMin) / 20,
            start: pMin,
            end: pMax
        }
    };

    var bsUrl = 'http://funcgen.vectorbase.org/popbio-map-preview/asolr/solr/vb_popbio/irBeeswarm?&' + qryUrl + '&fq=phenotype_value_type_s:"' + pType
        + '"&fq=phenotype_value_unit_s:"' + pUnit + '"' + BBox + '&json.wrf=?&callback=?';

    var vlUrl = 'http://funcgen.vectorbase.org/popbio-map-preview/asolr/solr/vb_popbio/irViolin?&' + qryUrl + '&fq=phenotype_value_type_s:"' + pType
        + '"&fq=phenotype_value_unit_s:"' + pUnit + '"&json.facet=' + JSON.stringify(vlJsonFacet) + BBox + '&json.wrf=?&callback=?';


    //console.log(vlUrl);
    var g = svg.append("g").attr("transform", "translate(" + (0 * (boxWidth + boxSpacing) + margin.left) + ",0)");

    function addAxis() {
        var yIR = d3.scale.linear()
            .range([height - margin.bottom, margin.top])
            .domain(yDomain)
            .nice();

        var yAxis = d3.svg.axis()
            .scale(yIR)
            .orient("left");

        svg.append("g")
            .attr('class', 'axis')
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis);

        svg.append("text")
            .attr("x", margin.left + boxWidth + boxSpacing / 2)
            .attr("y", 10)
            .style("text-anchor", "middle")
            .text(pType.capitalizeFirstLetter());

        svg.append("text")
            .attr("x", margin.left + boxWidth / 2)
            .attr("y", 290)
            .style("text-anchor", "middle")
            .text("Background");

        svg.append("text")
            .attr("x", margin.left + boxWidth + boxSpacing + boxWidth / 2)
            .attr("y", 290)
            .style("text-anchor", "middle")
            .text("Selection");

        // add the global chart
    }

    if (pCount > 1000) {
        // Lot's of data, do a violin box-plot
        yDomain = [pMin, pMax]
        //
        //} else if (pCount > 10) {
        //    // Manageable amounts of data, do a beeswarm box-plot
        //    domain = [pMin, pMax]

    } else {
        // Few data-points, just do a beeswarm skipping the box-plot
        yDomain = [pMin, pMax];

        // generate the beeswarm
        var bsPromise = $.getJSON(bsUrl),
            vlPromise = $.getJSON(vlUrl);
        $.when(bsPromise, vlPromise).done(function (bsJson, vlJson) {

            var sayhello;
            if (bsJson[0].grouped.phenotype_value_type_s.matches > 0) {
                var firstResult = bsJson[0].grouped.phenotype_value_type_s.groups[0];
                //console.log(firstResult.groupValue);
                var beeswarm, xaxis = boxWidth / 2
                    dataset = [];

                var scaledRadius = 10 * (pMax - pMin) / 240;
                firstResult.doclist.docs.forEach(function (element, index) {
                    //console.log(element.phenotype_value_f);

                    dataset.push({
                        x: undefined,
                        y: element.phenotype_value_f,
                        species: element.species_category[0],
                        insecticide: element.insecticide_s
                    });

                });

                beeswarm = new Beeswarm(dataset, 0, scaledRadius);
                //beeswarm = new Beeswarm(dataset, xaxis, radius, scaledRadius);
                addAxis();
                addBeeswarm(g, beeswarm, [270, 30], boxWidth, yDomain, beeswarm.domain, false);
            }
            if (vlJson[0].facets.count > 0) {

                var vlHist = vlJson[0].facets.denplot.buckets,
                    vlMean = vlJson[0].facets.pmean,
                    vlPerc = vlJson[0].facets.pperc,
                    vlCount = vlJson[0].facets.count;

                addBoxPlot(g, vlPerc, vlMean, [270, 30], boxWidth, yDomain, .15, false);
            }
        });

        bsPromise.fail(function () {
            console.log('Failed while loading irBeeswarm')
        });

        vlPromise.fail(function () {
            console.log('Failed while loading irViolin')
        });
    }

    return;


    // Test beeswarm

    var beeswarm, num_data = 100,
        min = 10, max = 300,
        xaxis = boxWidth / 2, radius = 4,
        dataset = [], i;

    for (i = 0; i < num_data; ++i)
        dataset.push({
            'x': 1,
            'y': Math.floor(Math.random() * (max - min + 1)) + min
        });

    beeswarm = new Beeswarm(dataset, xaxis, radius);

    addBeeswarm(g, beeswarm.swarm, [270, 30], boxWidth, yDomain, beeswarm.domain, false);
}

function Violin(div, options) {
    var self = this;
    var width = 250;
    var height = 300;

    var evorHist, evorMean, evorPerc, duplHist, duplMean, duplPerc, univHist, univMean, univPerc;

    this.divback = div.attr("class", "popup-back").attr("id", "violin-popup-back");
    this.div = this.divback.append("div").attr("id", "violin-popup").attr("class", "popup").append("div").attr("class", "violin-div").attr("id", "violin");

    var url = '/solr/ninjadata/select?q={!join from=member_ids to=id}analysis_id:"AnOrthoMap-v1.01"&rows=0&wt=json&json.nl=map&json.facet={' +
        'evorMean:"avg(evo_rate_f)",' +
        'evoPerc:"percentile(evo_rate_f,5,25,50,75,95)",' +
        'duplMean:"avg(avg_para_count_f)",' +
        'duplPerc:"percentile(avg_para_count_f,5,25,50,75,95)",' +
        'univMean:"avg(frac_species_f)",' +
        'univPerc:"percentile(frac_species_f,5,25,50,75,95)",' +
        'evor: {range : {field:evo_rate_f, start:0, end:4, gap:0.13}},' +
        'dupl: {range : {field:avg_para_count_f, start:1, end:31, gap:1.03}},' +
        'univ: {range : {field:frac_species_f, start:0, end:1, gap:0.033}}' +
        '}';
    console.log(url);

    d3.json(url,
        function (error, json) {
            if (error) return console.warn(error);

            if (defined(json.facets.count) && json.facets.count > 0) {


                evorHist = json.facets.evor.buckets;
                evorMean = json.facets.evorMean;
                evorPerc = json.facets.evoPerc;
                duplHist = json.facets.dupl.buckets;
                duplMean = json.facets.duplMean;
                duplPerc = json.facets.duplPerc;
                univHist = json.facets.univ.buckets;
                univMean = json.facets.univMean;
                univPerc = json.facets.univPerc;

            }

        });

    this.comm.ready(this);

    this.comm.on("violin.violin" + this.id, function (event) {
        if (!event || !event.source || event.source == self || !event.object) return;

        if (!/^MZ.+/.test(event.object.branchset[0].name)) return;

        var nodeX = event.object.branchset[0].x,
            nodeY = event.object.branchset[0].y;

        console.log('lakis:' + event.object.branchset[0].x);
        //

        //console.dir(event.object);
        // this is how we get all the needed statistics to build the global violin plots
        var url = '/solr/ninjadata/select?rows=0&wt=json&json.nl=map' +
            '&q={!join from=member_ids to=id} analysis_id:"AnOrthoMap-v1.01" AND type:cluster AND ' +
            'x_coord_i:' + nodeX +
            ' AND y_coord_i:' + nodeY +
            '&json.facet={' +
            'evorMean:"avg(evo_rate_f)",' +
            'evoPerc:"percentile(evo_rate_f,5,25,50,75,95)",' +
            'duplMean:"avg(avg_para_count_f)",' +
            'duplPerc:"percentile(avg_para_count_f,5,25,50,75,95)",' +
            'univMean:"avg(frac_species_f)",' +
            'univPerc:"percentile(frac_species_f,5,25,50,75,95)",' +
            'evor: {range : {field:evo_rate_f, start:0, end:4, gap:0.13}},' +
            'dupl: {range : {field:avg_para_count_f, start:1, end:31, gap:1.03}},' +
            'univ: {range : {field:frac_species_f, start:0, end:1, gap:0.033}}' +
            '}';
        console.log(url);
        d3.json(url,
            function (error, json) {
                if (error) return console.warn(error);

                if (defined(json.facets.count) && json.facets.count > 0) {
                    //add a close button
                    self.div.selectAll("*").remove();
                    self.div.append("div").attr("class", "cancel")
                        .on("click", function () {
                            d3.select("#violin-popup-back").style("display", "none");
                        });

                    var margin = {top: 30, bottom: 30, left: 30, right: 20};
                    var boxWidth = 100;
                    var boxSpacing = 10;

                    var domain = [0, 4];
                    var resolution = 20;
                    var d3ObjId = "violin";


                    //var interpolation = 'step-before';
                    var interpolation = 'basis';

                    var yEvor = d3.scale.linear()
                        .range([height - margin.bottom, margin.top])
                        .domain(domain)
                        .nice();

                    var yAxisEvor = d3.svg.axis()
                        .scale(yEvor)
                        .orient("left");

                    var svg = self.div.append("svg")
                        .attr("style", 'width: 32%; height: 100%; border: 0');

                    svg.append("text")
                        .attr("x", margin.left + boxWidth + boxSpacing / 2)
                        .attr("y", 10)
                        .style("text-anchor", "middle")
                        .text("Evolutionary Rate");

                    svg.append("text")
                        .attr("x", margin.left + boxWidth / 2)
                        .attr("y", 290)
                        .style("text-anchor", "middle")
                        .text("All");

                    svg.append("text")
                        .attr("x", margin.left + boxWidth + boxSpacing + boxWidth / 2)
                        .attr("y", 290)
                        .style("text-anchor", "middle")
                        .text("Cluster");


                    // add the global chart
                    var g = svg.append("g").attr("transform", "translate(" + (0 * (boxWidth + boxSpacing) + margin.left) + ",0)");

                    addViolin(g, evorHist, [height - margin.bottom, margin.top], boxWidth, domain, resolution, interpolation, 0.25, false);
                    addBoxPlot(g, evorPerc, evorMean, [height - margin.bottom, margin.top], boxWidth, domain, .15, false);

                    // add the chart for the cluster
                    g = svg.append("g").attr("transform", "translate(" + (1 * (boxWidth + boxSpacing) + margin.left) + ",0)");

                    addViolin(g, json.facets.evor.buckets, [height - margin.bottom, margin.top], boxWidth, domain, resolution, interpolation, 0.25, false);
                    addBoxPlot(g, json.facets.evoPerc, json.facets.evorMean, [height - margin.bottom, margin.top], boxWidth, domain, .15, false);


                    svg.append("g")
                        .attr('class', 'axis')
                        .attr("transform", "translate(" + margin.left + ",0)")
                        .call(yAxisEvor);


                    // lets add a graph for duplicability
                    domain = [1, 31];
                    var yDupl = d3.scale.log()
                        .range([height - margin.bottom, margin.top])
                        //.range([height - margin.bottom, margin.top])
                        .domain(domain)
                        .nice();


                    var yAxisDupl = d3.svg.axis()
                        .scale(yDupl)
                        .orient("left")
                        .ticks(3, ",.1s")
                        .tickSize(6, 0);


                    svg = self.div.append("svg")
                        .attr("style", 'width: 32%; height: 100%; border: 0');

                    svg.append("text")
                        .attr("x", margin.left + boxWidth + boxSpacing / 2)
                        .attr("y", 10)
                        .style("text-anchor", "middle")
                        .text("Duplicability");

                    svg.append("text")
                        .attr("x", margin.left + boxWidth / 2)
                        .attr("y", 290)
                        .style("text-anchor", "middle")
                        .text("All");

                    svg.append("text")
                        .attr("x", margin.left + boxWidth + boxSpacing + boxWidth / 2)
                        .attr("y", 290)
                        .style("text-anchor", "middle")
                        .text("Cluster");


                    g = svg.append("g").attr("transform", "translate(" + (0 * (boxWidth + boxSpacing) + margin.left) + ",0)");
                    //var g = svg.append("g").attr("transform", "translate(" + (0 * (boxWidth + boxSpacing) + margin.left) + ",-" + margin.top + ")");

                    addViolin(g, duplHist, [height - margin.bottom, margin.top], boxWidth, domain, resolution, interpolation, 0.25, true);
                    addBoxPlot(g, duplPerc, duplMean, [height - margin.bottom, margin.top], boxWidth, domain, .15, true);

                    // add the chart for the cluster
                    g = svg.append("g").attr("transform", "translate(" + (1 * (boxWidth + boxSpacing) + margin.left) + ",0)");

                    addViolin(g, json.facets.dupl.buckets, [height - margin.bottom, margin.top], boxWidth, domain, resolution, interpolation, 0.25, true);
                    addBoxPlot(g, json.facets.duplPerc, json.facets.duplMean, [height - margin.bottom, margin.top], boxWidth, domain, .15, true);


                    svg.append("g")
                        .attr('class', 'axis')
                        .attr("transform", "translate(" + margin.left + ",0)")
                        .call(yAxisDupl);

                    // lets add a graph for universality
                    domain = [0, 1];
                    var yUniv = d3.scale.linear()
                        .range([height - margin.bottom, margin.top])
                        .domain(domain)
                        .nice();

                    var yAxisUniv = d3.svg.axis()
                        .scale(yUniv)
                        .orient("left");


                    svg = self.div.append("svg")
                        .attr("style", 'width: 32%; height: 100%; border: 0');

                    svg.append("text")
                        .attr("x", margin.left + boxWidth + boxSpacing / 2)
                        .attr("y", 10)
                        .style("text-anchor", "middle")
                        .text("Universality");

                    svg.append("text")
                        .attr("x", margin.left + boxWidth / 2)
                        .attr("y", 290)
                        .style("text-anchor", "middle")
                        .text("All");

                    svg.append("text")
                        .attr("x", margin.left + boxWidth + boxSpacing + boxWidth / 2)
                        .attr("y", 290)
                        .style("text-anchor", "middle")
                        .text("Cluster");


                    g = svg.append("g").attr("transform", "translate(" + (0 * (boxWidth + boxSpacing) + margin.left) + ",0)");
                    //var g = svg.append("g").attr("transform", "translate(" + (0 * (boxWidth + boxSpacing) + margin.left) + ",-" + margin.top + ")");

                    addViolin(g, univHist, [height - margin.bottom, margin.top], boxWidth, domain, resolution, interpolation, 0.25, false);
                    addBoxPlot(g, univPerc, univMean, [height - margin.bottom, margin.top], boxWidth, domain, .15, false);

                    // add the chart for the cluster
                    g = svg.append("g").attr("transform", "translate(" + (1 * (boxWidth + boxSpacing) + margin.left) + ",0)");

                    addViolin(g, json.facets.univ.buckets, [height - margin.bottom, margin.top], boxWidth, domain, resolution, interpolation, 0.25, false);
                    addBoxPlot(g, json.facets.univPerc, json.facets.univMean, [height - margin.bottom, margin.top], boxWidth, domain, .15, false);


                    svg.append("g")
                        .attr('class', 'axis')
                        .attr("transform", "translate(" + margin.left + ",0)")
                        .call(yAxisUniv);

                    d3.select("#violin-popup-back").style("display", "block");
                }

                //self.text += JSON.stringify(json.response.docs, null, 2);
                //self.text += "</table>";
                //self.div.node().innerHTML = self.text;
            });
    });
}
// --------------------------------------------------------- //

