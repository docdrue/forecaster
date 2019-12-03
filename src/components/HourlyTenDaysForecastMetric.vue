<template>
  <div class='hourly-10-days-forecast'>
    <div class='wrapper'>
      <div>Metric</div><div>English</div>
		  <svg id='chart'></svg>
		</div>
	</div>
</template>

<script>
  import Vue from 'vue'
  import VueJsonp from 'vue-jsonp'
  import store from '../store'
  import VueD3 from 'vue-d3'
  import Config from '../config'
  import SunCalc from 'suncalc'

  Vue.use(VueD3)
  Vue.use(VueJsonp)

  export default {
    store,
    data () {
      return {
        data: [],
        sunRiseSet: []
      }
    },
    created () {
      const self = this
      setTimeout(() => {
        self.graphWindSpeed()
      }, 100)
    },
    watch: {

    },
    methods: {
      graphWindSpeed () {
        // store.watch(
        //   // When the returned result changes...
        //   function (state) {
        //     return state.user.notifications
        //   },
        //   // Run this callback
        // )
        // store.subscribe((mutation, state) => {
        //   console.log(state.units)
        // })

        const self = this
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
          .y(d => y(d.wspd.metric))

        const svg = self.$d3.select('#chart')
          .attr('width', width + 200)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        // Paint wind forecast graphic
        self.$d3.json(URL, (error, data) => {
          if (error) return self.$router.push({ name: 'ErrorPage' })
          data = data.hourly_forecast
          const speedArray = []
          const roundedSpeedArray = []

          // Get Sunrise Sunset by current forecast dates.
          const currentLatitude = self.$store.state.currentLocation.latitude
          const currentLongitude = self.$store.state.currentLocation.longitude
          const sscfd = data.map(res => {
            const mday = parseInt(res.FCTTIME.mday) + 1
            return {
              aheadDate: `${res.FCTTIME.month_name_abbrev} ${mday} ${res.FCTTIME.year}`,
              date: `${res.FCTTIME.month_name_abbrev} ${res.FCTTIME.mday} ${res.FCTTIME.year}`
            }
          })
          const used = {}
          const usedDates = sscfd.filter(function (obj) {
            return obj.aheadDate in used ? 0 : (used[obj.aheadDate] = 1)
          })
          self.sunRiseSet = usedDates.map(res => {
            const data = SunCalc.getTimes(new Date(res.aheadDate), currentLatitude, currentLongitude)
            return {
              date: new Date(res.date),
              sunrise: data.sunrise,
              sunset: data.sunset
            }
          })

          // TODO: don't use forEach
          data.forEach(d => {
            d.FCTTIME.mday_padded = parseDate(`${d.FCTTIME.month_name}-${d.FCTTIME.hour}-${d.FCTTIME.mday_padded}-${d.FCTTIME.year}`)
            d.wspd.metric = (d.wspd.metric * 1000) / 3600
            d.wspd.metric = d.wspd.metric.toFixed(1)
            roundedSpeedArray.push(Math.round(d.wspd.metric))
            speedArray.push(d.wspd.metric)
          })

          // Paint 'Y' axis
          var yAxisTicks = Math.max(...roundedSpeedArray) + 2
          self.$d3.axisLeft(y).ticks(yAxisTicks)
          y.domain([0, yAxisTicks])

          // Paint 'X' axis
          x.domain(self.$d3.extent(data, d => d.FCTTIME.mday_padded))

          // Sunrise, Sunset areas
          svg.append('g').append('rect')
            .attr('class', 'night')
            .attr('width', width)
            .attr('height', height)

          const timescaleDay = self.$d3.scaleTime()
            .nice(self.$d3.timeDay)
            .domain(self.$d3.extent(data, d => d.FCTTIME.mday_padded))
            .range([0, width])

          const rectangles = svg.append('g')
              .attr('class', 'sun-rise-set')
              .selectAll('rect')
              .data(self.sunRiseSet)
              .enter()

          rectangles.append('rect')
            .attr('x', function (d) {
              return (timescaleDay(d.sunrise))
            })
            .attr('class', 'day')
            .attr('y', 0)
            .attr('width', function (d) {
              return (timescaleDay(d.sunset) - timescaleDay(d.sunrise))
            })
            .attr('height', height)
            .attr('stroke', 'none')

          // Liner gradient for area of wind line forecast
          const maxValueOfSpeedArray = Math.max(...speedArray)
          const maxCriticalSpeed = Config.maxCriticalSpeedMetric
          const y1GradientPersents = (100 / maxCriticalSpeed) * maxValueOfSpeedArray
          svg.append('linearGradient')
            .attr('id', 'temperature-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0).attr('y1', `${y1GradientPersents}%`)
            .attr('x2', 0).attr('y2', 0)
            .selectAll('stop')
              .data([
                { offset: '0%', color: '#27c0aa' },
                { offset: '50%', color: '#e3b20c' },
                { offset: '100%', color: 'red' }
              ])
            .enter().append('stop')
              .attr('offset', function (d) { return d.offset })
              .attr('stop-color', function (d) { return d.color })

          // Area of wind line forecast
          var area = self.$d3.area()
            .x(d => x(d.FCTTIME.mday_padded))
            .y0(height)
            .y1(d => y(d.wspd.metric))

          svg.append('path')
            .datum(data)
            .attr('class', 'line-area')
            .attr('d', area)

          // Paint wind forecast line
          var line = self.$d3.line()
            .x(d => x(d.FCTTIME.mday_padded))
            .y(d => y(d.wspd.metric))
            .curve(self.$d3.curveLinear) // curveBasis

          svg.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line)
            .style('fill', 'none')
            .style('stroke-width', 5)

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
            .tickFormat(d => {
              if (d.getHours() === 12) {
                //  if (d.getDate() == 1 || moment(d).isSame(start, 'day')) {
                //    formatter = self.$d3.time.format.utc('%a %d %b')
                //  } else {
                //    formatter = self.$d3.time.format.utc('%a %d')
                //  }
                //  return formatter(d)
                var formatter = self.$d3.utcFormat('%a %d %b')
                return formatter(d)
              } else {
                return null
              }
            })

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
            .tickFormat(d => {
              // if (d.getHours() != 0) {
              // 	return d.getHours()
              // } else {
              // 	return '24'
              // }

              return ''
            })
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
            .tickFormat(d => {
              // if (d.getHours() != 0) {
              // 	return d.getHours()
              // } else {
              // 	return '24'
              // }

              return ''
            })
          svg.append('g')
            .classed('axis', true)
            .classed('hours', true)
            .classed('x2', true)
            .classed('labeled', true)
            .attr('transform', `translate(0,${height + 2})`)
            .call(hoursAxisBottom)

          // Update graph by metric system.
          store.subscribe((mutation, state) => {
            update()
          })
          function update () {
            console.log('Updated')
          }

          // Overlay focus
          function mousemove () {
            var x0 = x.invert(self.$d3.mouse(this)[0])
            var i = bisectDate(data, x0, 1)
            var d0 = data[i - 1]
            var d1 = data[i]
            var d = x0 - d0.date > d1.date - x0 ? d1 : d0

            helper.attr('transform', 'translate(' + x(d.FCTTIME.mday_padded) + ',' + 0 + ')')
            focus.attr('transform', 'translate(' + x(d.FCTTIME.mday_padded) + ',' + y(d.wspd.metric) + ')')
            focusHour.attr('transform', 'translate(' + x(d.FCTTIME.mday_padded) + ',0)')
            focus.select('text.wind-speed').text(`${formatValue(d.wspd.metric)} m/s from ${d.wdir.dir}`)
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
            .on('mouseover', () => {
              focus.style('display', null)
              focusHour.style('display', null)
              helper.style('display', null)
            })
            .on('mouseout', () => {
              focus.style('display', 'none')
              focusHour.style('display', 'none')
              helper.style('display', 'none')
            })
            .on('mousemove', mousemove)
        })
      }
    }
  }
</script>
