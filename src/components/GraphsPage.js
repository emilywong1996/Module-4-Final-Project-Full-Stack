import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as d3 from "d3";
import './Components.css';

export const GraphsPage = () => {

  const [equipmentValue, setEquipmentValue] = useState('')

  const navigate = useNavigate();

  const handleLogOutClick = () => {
    sessionStorage.removeItem('appjwt');
    navigate('/');
  }

  const handleSubmitFormClick = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`http://localhost:3000/data/${equipmentValue}`
          ,{
            "equipment": equipmentValue
          });
          
          let queryData = [];
          for (let i = 0; i < response.data.length; i++) {
              const yearParser = d3.timeParse("%Y");
              const date = yearParser(response.data[i].year);
              queryData.push({
                date: +date,
                value: +response.data[i].breakdown_rate
              });
          }
    
        // Declare the chart dimensions and margins.
        const svgWidth = 775;
        const svgHeight = svgWidth/2;
        const marginTop = svgWidth/40;
        const marginRight = svgWidth/40;
        const marginBottom = svgWidth/26.7;
        const marginLeft = svgWidth/16;
        const width = svgWidth - marginLeft - marginRight;
        const height = svgHeight - marginTop - marginBottom;

        // Create the SVG container.
        const svg = d3.select("svg")
          .attr("width", svgWidth)
          .attr("height", svgHeight)

        // Overwrite the previous data with a white background
        svg.append("rect")
          .attr("width", "100%")
          .attr("height", "100%")
          .attr("fill","white")

        // Declare the x (horizontal position) scale.
        const x = d3.scaleTime()
          .rangeRound([marginLeft/2, width]);

        // Declare the y (vertical position) scale.
        const y = d3.scaleLinear()
          .rangeRound([height, marginBottom]);

        // Declare the line generator.
        const line = d3.line()
          .x(d => x(d.date))
          .y(d => y(d.value));

        x.domain(d3.extent(queryData, d => d.date));
        y.domain(d3.extent(queryData, d => d.value));

        // Add the x-axis, remove the domain line, add grid lines and a label.
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .call(g => g.append("text")
            .attr("x", width/2)
            .attr("y", marginTop - height)
            .attr("fill", "#000")
            .attr("text-anchor", "end")
            .style("font-size", "15px")
            .text(`${equipmentValue}`))
          .select(".domain")
          .remove();
          
          
        // Add the y-axis, remove the domain line, add grid lines and a label.
        svg.append("g")
          .attr("transform", "translate(" + marginBottom * 5/6 + ", 0)")
          .call(d3.axisLeft(y).ticks(height / 50))
          .call(g => g.select(".domain").remove())
          .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1))
          .call(g => g.append("text")
            .attr("x", height/3.5)
            .attr("y", -width)
            .attr("fill", "#000")
            .attr("transform", "rotate(90)")
            .attr("text-anchor", "start")
            .style("font-size", "15px")
            .text("Breakdown Rate"));

        // Append a path for the line.
        svg.append("path")
          .datum(queryData)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", line);
    
        Array.from(document.querySelectorAll("input")).forEach(input => (input.value = ""));
        setEquipmentValue(null);
        return svg.node();

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <button id="logout" onClick={() => handleLogOutClick()}>Log Out</button>
      <h2>Graphs</h2>
      <form autoComplete="off" onSubmit={handleSubmitFormClick}>
        <label>Equipment:</label>
        <input onChange={(e) => setEquipmentValue(e.target.value)} name="equipment" placeholder='Enter Equipment Name' required/>
        <button type="submit">Graph Equipment!</button>
      </form>
      <svg className="line-graph"></svg>
     
    </div>
  )
}