import { Card, CardContent} from '@material-ui/core'
import React from 'react';
import * as d3 from "d3";
import { useD3 } from './hooks';
import {Conrec} from "ml-conrec"
import { options } from 'yargs';


const height =  190;
const width = 190;
var margin = { top: 10, right: 10, bottom: 10, left: 10, edge: 40};



// wrapper for entire plot

type PlotProps = {
  plotdata: object
  experiment: object
}

export default function Plot_Objective(props: PlotProps) {
  const {plotdata, experiment} = props
  var valvar = experiment.valueVariables
  var catvar = experiment.categoricalVariables

  if (catvar.lenght != 0) {
    console.log("triggered")
    console.log( catvar)
    var longest = 0
    for (var cvar = 0; cvar < catvar.length; cvar++){
      console.log("triggered2")
      for (var option = 0; option < catvar[cvar]['options'].length; option++){
        console.log(catvar[cvar]['options'][option].length)
        if (catvar[cvar]['options'][option].length > longest) {longest = catvar[cvar]['options'][option].length}
      }
    }
    margin["edge"] = longest*10

  }


  // function to generate scales
  function getscale(index, startpos, stoppos) {
    if (index < valvar.length) {
      return (d3.scaleLinear()
        .domain([valvar[index]["minVal"], valvar[index]["maxVal"]]) 
        .range([startpos,stoppos])   
      )
    } else {
      return (d3.scalePoint()
                    .domain(catvar[index - valvar.length]["options"])
                    .range([startpos,stoppos]) 
      )
    }
  }


  // get length of dataset to pass
  const data_length = plotdata.dimensions.length

  // generate min max for dependence scale
  var dep_scale = [0,0]
  for (const [index, value] of plotdata.plots_data.entries()) {
    var min = Math.min(...value[index]["yi"])
    var max = Math.max(...value[index]["yi"])

    if (index == 0) {
      dep_scale[0] = min
      dep_scale[1] = max
    }
    if (min < dep_scale[0]) {
      dep_scale[0] = min
    }
    if (max > dep_scale[1]) {
      dep_scale[1] = max
    }
  }

  // define width of containing svg tag
  const svg_height = (data_length * (margin["top"] + margin["bottom"] + height)) + (2 * margin["edge"]) 
  const svg_width = (data_length * (margin["left"] + margin["right"] + height)) + (2 * margin["edge"])


  //Function to manipulate dom

  const ref = useD3(
    (svg) => {

    
    for (const [i, i_value] of plotdata.plots_data.entries()) {
      for (const [j, j_value] of i_value.entries()) {
        const idstring = i + "_" + j



        if (j == i_value.length - 1) {
          var xy = [];
          for(var k=0; k < j_value["xi"]["__ndarray__"].length; k++){
             xy.push({x:j_value["xi"]["__ndarray__"][k],
                      y:j_value["yi"][k]
                    });
            }

          var xscl = d3.scaleLinear()
          .domain(d3.extent(xy,function(d) {return d.x;}))
          .range([0, width])
  
          var yscl = d3.scaleLinear()
            .domain(dep_scale)
            .range([height, 0])
  
          var slice = d3.line()
            .x(function(d,i) { return xscl(d.x);})
            .y(function(d,i) { return yscl(d.y);})
        
        
          svg
            .select(".plot_" + idstring)
            .select(".plot")
            .append("path")
            .attr("class", "line")
            .attr("d", slice(xy))
            .style("fill", "none")
            .style("stroke", "blue")
            .style("stroke-width", 2);
          svg
            .select(".plot_" + idstring)
            .select(".topaxis")
            .call(d3.axisTop(getscale(j,0,width)))
          svg
            .select(".plot_" + idstring)
            .select(".botaxis")
            .call(d3.axisBottom(getscale(j,0,width)).tickFormat(""))    
          svg
            .select(".plot_" + idstring)
            .select(".leftaxis")
            .call(d3.axisLeft(yscl).tickFormat(""))
          svg
            .select(".plot_" + idstring)
            .select(".rightaxis")
            .call(d3.axisRight(yscl))
        } 
        else {

                  //get shape of z data
          var data_width = j_value["zi"]["shape"][1]
          var data_height  = j_value["zi"]["shape"][0]
        
          //generate inpur array required by d3's contour generator
          var xgrid = new Array(data_width * data_height);
          var ygrid = new Array(data_width * data_height);
          var values = new Array(data_width * data_height);
          for (var o = 0, p = 0; o < data_height; ++o) {
            for (var q = 0; q < data_width; ++q, ++p) {
              xgrid[p] = j_value["xi"]["__ndarray__"][o]
              ygrid[p] = j_value["yi"]["__ndarray__"][q];
              values[p] = j_value["zi"]["__ndarray__"][data_height -1 - o][q];
            }
          }


        //determine max and min value to generate correct threshod boundries
        var minval = dep_scale[0];
        var maxval = dep_scale[1]
        var midval = ((maxval-minval)/2) + minval;
        var parts = (maxval-minval)/25
        var thresholds = d3.range(minval, maxval, parts)
        var myColor = d3.scaleLinear().domain([minval, midval, maxval])
                       .range(["yellow", "green", "blue"])

      // generate contours
       var contours = d3.contours().size([data_width, data_height]).thresholds(thresholds)(values)
       var scalex = width/data_width
       var scaley = height/data_height
       //console.log(contours)

      //generate scales 
      var x = getscale(j,0,width)
      var y = getscale(i,width, 0)
    


      //transoformation function to remove beveling along the edges
      var projection = d3.geoTransform({
        point: function(px, py) {
          //calculate additional scaling to ensure contour is square with plotting area centered
          const addscaley = 0.8/data_height+1
          const addscalex = 0.8/data_width+1
          //transformation of actual point on curve
          py=(py-0.4)*scaley*addscaley
          px=(px-0.4)*scalex*addscalex
          //clamp curve points outside plotting area
          if ( px < 0) { px = 0;} // px < 0 ? px = 0 : px;
          if ( py < 0) { py = 0;} // py < 0 ? py = 0 : py;
          if ( px > (width) ) { px = width; } // px > (n-1) ? px = n-1 : px;
          if ( py > (height) ) { py = height; } // py > (m-1) ? py = m-1 : py;
          this.stream.point(px, py);
        }
    });

      
       svg
        .select(".plot_" + idstring)
        .select(".plot")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 0.0)
        .selectAll("path")
        .data(contours)
        .join("path")
        .attr("fill", function(d){return myColor(d.value)})
        .attr("d", d3.geoPath(projection))


      for (var entry=0; entry<experiment.dataPoints.length; entry++) {
        svg
          .select(".plot_" + idstring)
          .select(".plot-area")
          .append("circle")
            .attr("cx", function () {return x(experiment.dataPoints[entry][j].value)})
            .attr("cy", function () {return y(experiment.dataPoints[entry][i].value)})
            .attr("r", 4)
            .attr("id", function(d) {return "Datapoint"+entry})
            .style("fill", "#000000")
            .on("mouseover", function(d) {
              d3.selectAll("#" + this.id).transition().style("fill", "#FF0000");
            })
            .on("mouseout", function(d) {
              d3.selectAll('circle').transition().style("fill", "#000000");
            });
                 
      }


      svg
        .select(".plot_" + idstring)
        .select(".topaxis")
        .call(d3.axisTop(x).tickFormat(""))

      if (i == data_length -1) {
        svg
        .select(".plot_" + idstring)
        .select(".botaxis")
        .attr("transform", "translate(0," + height +")")
        .call(d3.axisBottom(x))

      } else {
        svg
        .select(".plot_" + idstring)
        .select(".botaxis")
        .attr("transform", "translate(0," + height +")")
        .call(d3.axisBottom(x).tickFormat(""))  


      }

      if (j == 0) {
        svg
        .select(".plot_" + idstring)
        .select(".leftaxis")
        .call(d3.axisLeft(y))

      } else {
      svg
        .select(".plot_" + idstring)
        .select(".leftaxis")
        .call(d3.axisLeft(y).tickFormat(""))
      }
      svg
        .select(".plot_" + idstring)
        .select(".rightaxis")
        .attr("transform", "translate(" + width + ",0)")
        .call(d3.axisRight(y).tickFormat(""))
        }
      }
    }
  },
    [data_length]
  );

  //Generate all DOM Tags for Plots

  const plots = []
  for (const [i, i_value] of plotdata.plots_data.entries()) {
    for (const [j, j_value] of i_value.entries()) {
      const idstring = i + "_" + j  
      plots.push(
        <g className={"plot_" + idstring} transform={
          "translate(" + 
          (margin['edge'] + j * (margin["left"] + margin["right"] + width))
          + "," + 
          (margin['edge'] + i * (margin["top"] + margin["bottom"] + height))
           + ")"
        }>
          
          <g className="plot"/>
          <g className="topaxis"/>
          <g className="botaxis" transform={"translate(0," + height +")"}/>
          <g className="leftaxis" />
          <g className="rightaxis" transform={"translate(" + width + ",0)"}/>
          <g className="plot-area"/>
        </g>
      )
    }
  }


  return (
    <Card>
      <CardContent>
        <svg 
        ref={ref}
        style={{
          height: svg_height,
          width: svg_width,
          marginRight: "0px",
          marginLeft: "0px",
        }}
        >
 {plots}
      </svg>

             
      </CardContent>
    </Card>
  );
};


