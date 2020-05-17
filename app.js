function renderViz() {
    d3.csv("movies.csv")
        .then(data => setupGroups(data))
        .then(data => renderStreamGraph(data))
        .then(data => console.log(data))
        .catch(e => console.log(e))
}

function setupGroups(data) {
    d3.select("svg").append("g").attr("id", "chart")
    return data
}

function renderStreamGraph(data) {
    var xScale = d3.scaleLinear().domain([1, 10]).range([0, 500])
    var yScale = d3.scaleLinear().domain([-50, 50]).range([500, 0])

    var movies = Object.keys(data[0]).filter(d => d !== "day")
    var colorScale = d3.scaleOrdinal().domain(movies).range(d3.schemeSpectral[6])

    var stackChart = d3.stack()
    stackChart.keys(movies)
        .offset(d3.stackOffsetSilhouette)
        .order(d3.stackOrderNone)

    var areaGen = d3.area()
        .x(d => xScale(d.data.day))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis)

    d3.select("#chart")
        .selectAll("path")
        .data(stackChart(data))
        .enter()
        .append("path")
        .attr("d", d => areaGen(d))
        .attr("fill", d => colorScale(d.key))

    setInterval(() => {
        data.forEach((e, i) => {
            data[i].day = wrap(parseInt(data[i].day) + 1, 1, 10)
            data = data.sort((a,b) => a.day - b.day)
        });
        d3.selectAll("path")
            .data(stackChart(data))
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .attr("d", d => areaGen(d))
        console.log(data)
    }, 1000);

    return data
}

function wrap(i, min, max) {
    if (i > max)
        return min
    if (i < min)
        return max

    return i
}