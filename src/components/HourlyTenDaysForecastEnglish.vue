<template>
  <div class='hourly-10-days-forecast'>
    <div class='wrapper'>
		  <svg id='chart' class="dragscroll"></svg>
		  <svg id='chart-y-axis'></svg>
		</div>
	</div>
</template>

<script>
  import Vue from 'vue'
  import VueJsonp from 'vue-jsonp'
  import store from '../store'
  import VueD3 from 'vue-d3'

  Vue.use(VueD3)
  Vue.use(VueJsonp)

  export default {
    store,
    data () {
      return {
        data: ''
      }
    },
    created () {
      this.fetchData()
    },
    watch: {
      '$route': 'fetchData',
      '$store.state.units': 'fetchData'
    },
    methods: {
      fetchData () {
        var self = this

				// Get hourly 10 days forecast
        Vue.jsonp(`https://api.wunderground.com/api/2c381b3416dfbb9a/hourly10day/q/zmw:${this.$route.params.zmw}.json`).then(json => {
          this.data = json.hourly_forecast
        }, json => {
					// Failed.
          self.$router.push({ name: 'ErrorPage' })
        }).then(function () {
          self.graphWindSpeed(self)
        })
      },
      graphWindSpeed (self) {
        var margin = {
          top: 30,
          right: 80,
          bottom: 30,
          left: 12
        }
        var width = 5000
        var height = 400

        var parseDate = self.$d3.timeParse('%B-%H-%d-%Y')
        var bisectDate = self.$d3.bisector(d => d.FCTTIME.mday_padded).left
        var formatValue = self.$d3.format(',')

        var URL = `https://api.wunderground.com/api/2c381b3416dfbb9a/hourly10day/q/zmw:${self.$route.params.zmw}.json`

        var x = self.$d3.scaleTime()
          .range([0, width - 1])

        var y = self.$d3.scaleLinear()
          .range([height, 0])

        //  var line =
        self.$d3.line()
          .x(d => x(d.FCTTIME.mday_padded))
          .y(d => y(d.wspd.english))

        var svg = self.$d3.select('#chart')
          .attr('width', width + 200)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        var svgYAxis = self.$d3.select('#chart-y-axis')
          .attr('width', 38)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + 46 + ',' + margin.top + ')')

				// Paint fixed 'Y' axis for wind forecast graphic
        self.$d3.json(URL, (data) => {
          data = data.hourly_forecast
          const speedEnglishArray = []
          let speedEnglish = ''

          data.forEach(d => {
            speedEnglish = d.wspd.english
            speedEnglishArray.push(speedEnglish)
          })

					// Paint 'Y' axis for english units
          const yAxisTicksEnglish = Math.max(...speedEnglishArray) + 2
          const yAxisEnglish = self.$d3.axisLeft(y).ticks(yAxisTicksEnglish)
          y.domain([0, yAxisTicksEnglish])
          svgYAxis.append('g')
            .attr('class', 'y axis english')
            .attr('transform', 'translate(-22,0)')
            .style('position', 'fixed')
            .call(yAxisEnglish)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Wind speed (miles per hour)')
        })

        //  Paint wind forecast graphic
        self.$d3.json(URL, (error, data) => {
          if (error) return self.$router.push({ name: 'ErrorPage' })
          console.table(data)
          data = data.hourly_forecast
          const speedEnglishArray = []
          let speedEnglish = ''

          data.forEach(d => {
            d.FCTTIME.mday_padded = parseDate(`${d.FCTTIME.month_name}-${d.FCTTIME.hour}-${d.FCTTIME.mday_padded}-${d.FCTTIME.year}`)
            speedEnglish = d.wspd.english
            speedEnglishArray.push(speedEnglish)
          })

          //  Paint 'Y' axis
          const yAxisTicksEnglish = Math.max(...speedEnglishArray) + 2
          //  const yAxisEnglish =
          self.$d3.axisLeft(y).ticks(yAxisTicksEnglish)
          y.domain([0, yAxisTicksEnglish])
						// 	svg.append('g')
						// 		.attr('class', 'y axis')
						// 		.attr('transform', 'translate(-22,0)')
						// 		.style('position', 'fixed')
						// 		.call(yAxis)
						// 		.append('text')
						// 		.attr('transform', 'rotate(-90)')
						// 		.attr('y', 6)
						// 		.attr('dy', '.71em')
						// 		.style('text-anchor', 'end')
						// 		.text('Wind speed (m/s)')

					// Paint 'X' axis
					// 	var xAxis = self.$d3.axisBottom(x).ticks(10)
          x.domain(self.$d3.extent(data, d => d.FCTTIME.mday_padded))
						// svg.append('g')
						// 	.attr('class', 'x axis')
						// 	.attr('transform', 'translate(0,' + height + ')')
						// 	.call(xAxis);

          // Area of wind line forecast
          var area = self.$d3.area()
            .x(d => x(d.FCTTIME.mday_padded))
            .y0(height)
            .y1(d => y(d.wspd.english))

          svg.append('path')
            .datum(data)
            .attr('class', 'line-area')
            .attr('d', area)

					// Paint wind forecast line
          var line = self.$d3.line()
            .x(d => x(d.FCTTIME.mday_padded))
            .y(d => y(d.wspd.english))
            .curve(self.$d3.curveLinear)
          svg.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line)
            .style('fill', 'none')
            .style('stroke-width', 2)

					// Paint days tickmarks axis
          var timescale = self.$d3.scaleTime()
            .nice(self.$d3.timeDay)
            .domain(self.$d3.extent(data, d => d.FCTTIME.mday_padded))
            .range([0, width])

          var daysTickmarksAxis = self.$d3.axisBottom()
						.scale(timescale)
						.ticks(self.$d3.timeDay, 1)
						.tickFormat('')
						.tickSize(height)
						.tickPadding(60)

          svg.append('g')
						.classed('axis', true)
						.classed('days', true)
						.attr('transform', 'translate(0,0)')
						.call(daysTickmarksAxis)

					// Paint days tickmarks axis label
          var daysLabelsAxis = self.$d3.axisBottom()
						.scale(timescale)
						.ticks(self.$d3.timeHour, 12)
						.tickSize(0)
						.tickPadding(6)
						.tickFormat(
              d => {
                if (d.getHours() === 12) {
                  //  if (d.getDate() == 1 || moment(d).isSame(start, 'day')) {
                  //   formatter = self.$d3.time.format.utc('%a %d %b')
                  //  } else {
                  //    formatter = self.$d3.time.format.utc('%a %d')
                  //  }
                  //  return formatter(d)
                  var formatter = self.$d3.utcFormat('%a %d %b')
                  return formatter(d)
                } else {
                  return null
                }
              }
            )

          svg.append('g')
            .classed('axis', true)
            .classed('days', true)
            .classed('labeled', true)
            .attr('transform', 'translate(0.5,20)')
            .call(daysLabelsAxis)

					// Paint hours tickmarks axis for top and bottom of graphic
          var hoursAxisTop = self.$d3.axisTop()
            .scale(timescale)
            .ticks(self.$d3.timeHour, 1)
            .tickPadding(6)
            .tickSize(8)
            .tickFormat(
              d => {
							// if (d.getHours() != 0) {
							// 	return d.getHours()
							// } else {
							// 	return '24'
							// }
                return ''
              }
						)
          svg.append('g')
            .classed('axis', true)
						.classed('hours', true)
						.classed('x1', true)
						.classed('labeled', true)
						.attr('transform', 'translate(0,-2)')
						.call(hoursAxisTop)

					// Paint hours tickmarks axis for bottom of graphic
          var hoursAxisBottom = self.$d3.axisBottom()
						.scale(timescale)
						.ticks(self.$d3.timeHour, 1)
						.tickPadding(6)
						.tickSize(8)
						.tickFormat(
              d => {
							// if (d.getHours() != 0) {
							// 	return d.getHours()
							// } else {
							// 	return '24'
							// }
                return ''
              }
						)
          svg.append('g')
						.classed('axis', true)
						.classed('hours', true)
						.classed('x2', true)
						.classed('labeled', true)
						.attr('transform', `translate(0,${height + 2})`)
						.call(hoursAxisBottom)

					// Overlay focus
          function mousemove () {
            var x0 = x.invert(self.$d3.mouse(this)[0])
            var i = bisectDate(data, x0, 1)
            var d0 = data[i - 1]
            var d1 = data[i]
            var d = x0 - d0.date > d1.date - x0 ? d1 : d0

            helper.attr('transform', 'translate(' + x(d.FCTTIME.mday_padded) + ',' + 0 + ')')
            focus.attr('transform', 'translate(' + x(d.FCTTIME.mday_padded) + ',' + y(d.wspd.english) + ')')
            focusHour.attr('transform', 'translate(' + x(d.FCTTIME.mday_padded) + ',0)')
            focus.select('text.wind-speed').text(`${formatValue(d.wspd.english)} m/h from ${d.wdir.dir}`)
            focusHour.select('text.hour').text(`${d.FCTTIME.hour}h`)
            focus.select('image.wind-arrow').attr('transform', `rotate(${d.wdir.degrees})`)
          }

          var helper = svg.append('g')
						.attr('class', 'helper')
						.style('display', 'none')
          helper.append('line')
						.attr('x1', 0)
						.attr('y1', 0)
						.attr('x2', 0)
						.attr('y2', height)

          var focus = svg.append('g')
						.attr('class', 'focus')
						.style('display', 'none')
          focus.append('image')
						.attr('class', 'wind-arrow')
						.attr('xlink:href', '/src/assets/wind-arrow.png')
						.attr('x', -10)
						.attr('y', -10)
						.attr('height', '20px')
						.attr('width', '20px')
          focus.append('text')
						.attr('class', 'wind-speed')
						.attr('x', 18)
						.attr('dy', '.35em')

          var focusHour = svg.append('g')
						.attr('class', 'focus-hour')
						.style('display', 'none')
          focusHour.append('text')
						.attr('class', 'hour')
						.attr('x', 9)
						.attr('dy', '1.35em')

          svg.append('rect')
						.attr('class', 'overlay dragscroll')
						.attr('width', width)
						.attr('height', height)
						.on('mouseover',
              () => {
                focus.style('display', null)
                focusHour.style('display', null)
                helper.style('display', null)
              }
            )
						.on('mouseout',
              () => {
                focus.style('display', 'none')
                focusHour.style('display', 'none')
                helper.style('display', 'none')
              }
            )
						.on('mousemove', mousemove)
        })
      }
    }
  }
</script>
