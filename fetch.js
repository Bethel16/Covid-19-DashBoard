var url1 = ("https://api.covid19api.com/summary");
var newObj = new Array();
fetch(url1)
  .then(response => response.json())
  .then(data => {
    
    for (var i = 0; i < data.Countries.length; i++) {
      newObj[i] = { code: data.Countries[i].CountryCode, total: data.Countries[i].TotalConfirmed }
    }
});  

(async () => {

    const topology = await fetch(
      'https://code.highcharts.com/mapdata/custom/world.topo.json'
    ).then(response => response.json());
  
    Highcharts.getJSON('https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/world-population.json', function (data) {
  
for(var j=0 ;j< data.length ;j++){
    for(var i=0;i<newObj.length ;i++){
        if(data[j].code == newObj[i].code){
            data[j].z = newObj[i].total;
        }
    }
}


      Highcharts.mapChart('container', {
        chart: {
          borderWidth: 1,
          map: topology
        },
  
        title: {
          text: 'Locate country to see Total confirmed cases'
        },
  
        subtitle: {
          text: ''
        },
  
        accessibility: {
          description: ''
        },
  
        legend: {
          enabled: false
        },
  
        mapNavigation: {
          enabled: true,
          buttonOptions: {
            verticalAlign: 'bottom'
          }
        },
  
        mapView: {
          fitToGeometry: {
            type: 'MultiPoint',
            coordinates: [
              // Alaska west
              [-164, 54],
              // Greenland north
              [-35, 84],
              // New Zealand east
              [179, -38],
              // Chile south
              [-68, -55]
            ]
          }
        },
  
        series: [{
          name: 'Countries',
          color: '#E0E0E0',
          enableMouseTracking: false
        }, {
          type: 'mapbubble',
          name: 'Total Confirmation',
          joinBy: ['iso-a2', 'code'],
          data: data,
          minSize: 4,
          maxSize: '12%',
          tooltip: {
            pointFormat: '{point.properties.name}: {point.z}'
          }
        }]
      });
    });
  
  })();

fetchRequest = async (url) => {
    const response = await fetch(url)
    return response.json()
}
const covidApi = {
    getSummary: async () => {
        return await fetchRequest(covidApiEndPoints.summary())
    }
}
const covidApibase = 'https://api.covid19api.com/'
const covidApiEndPoints = {
    summary: () => {
        return getApiPath('summary')
    }
}
getApiPath = (end_point) => {
    return covidApibase + end_point;
}
let body = document.querySelector('body')
window.onload = async () => {
    startLoading()
    console.log('Ready..')
    await GlobalfetchData()
    endLoading()
}
startLoading = () => {
    body.classList.add('loading')
}
endLoading = () => {
    body.classList.remove('loading')
}
async function countryList(){
    let summaryData = await covidApi.getSummary()
        let country_select_list = document.querySelector('#country')
        country_select_list.querySelectorAll('div').forEach(e => e.remove())
        summaryData.Countries.forEach(e => {
            let item = document.createElement('option')
            item.classList.add('country-item')
            item.textContent = e.Country
    
            country_select_list.appendChild(item)
        })
    }
async function GlobalfetchData(country) {
        const summaryData = await covidApi.getSummary()
    let Totalconfirmed = document.getElementById('confirmed-total')
let Newconfirmed = document.getElementById('new-confirmed')
let TotalDeath = document.getElementById('death-total')
let recocovered = document.getElementById('recoverd')
    let TotalDeathValue = summaryData.Global.TotalDeaths
    let NewconfirmedValue = summaryData.Global.NewConfirmed
    let TotalconfirmedValue = summaryData.Global.TotalConfirmed
    let TotalRecoveredValue = ((TotalDeathValue / TotalconfirmedValue) * 100).toFixed(2) + " %"
    TotalDeath.innerHTML = animateValue(TotalDeath, 0, TotalDeathValue, 500)
    Totalconfirmed.innerHTML = animateValue(Totalconfirmed, 0, TotalconfirmedValue, 500)
    Newconfirmed.innerHTML = animateValue(Newconfirmed, 0, NewconfirmedValue, 500)
    recocovered.innerHTML = TotalRecoveredValue
    DrawChart(TotalconfirmedValue, TotalDeathValue, NewconfirmedValue)
    //divide the numbers with world population
    fdf(TotalconfirmedValue/ 7942645086, NewconfirmedValue/7942645086, TotalDeathValue/ 7942645086, TotalRecoveredValue/7942645086)
   
}
countryList()
function DrawChart(x, y, z) {
    // Data retrieved from https://gs.statcounter.com/browser-market-share#monthly-202201-202201-bar
    // Create the chart
    Highcharts.chart('container1', {
        chart: {
            type: 'column'
        },
        title: {
            align: 'left',
            text: ''
        },
        subtitle: {
            align: 'left',
            text: ''
        },
        accessibility: {
            announceNewData: {
                enabled: true
            }
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'Total percent market share'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%'
                }
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },

        series: [
            {
                name: 'Browsers',
                colorByPoint: true,
                data: [
                    {
                        name: 'Total Confirmtion',
                        y: x,
                        drilldown: 'TotalConfirmed'
                    },
                    {
                        name: 'Total Death',
                        y: y,
                        drilldown: 'TotalDeath',
                        color: 'red'
                    },
                    {
                        name: 'New Confirmed',
                        y: z,
                        drilldown: 'New Confirmed'
                    }

                ]
            }
        ],
        drilldown: {
            breadcrumbs: {
                position: {
                    align: 'right'
                }
            }

        }
    });
}
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
async function table() {
    summaryData = await covidApi.getSummary()
    summary = summaryData.Global
   
    // Load countries table
    let casesByCountries = summaryData.Countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed)
    let table_countries_body = document.querySelector('#table-countries tbody')
    table_countries_body.innerHTML = ''

    for (let i = 0; i < 10; i++) {
        let rows = `<tr>
            <td> ${casesByCountries[i].Country}</td>
            <td> ${casesByCountries[i].TotalConfirmed}</td>
            <td> ${casesByCountries[i].NewConfirmed}</td>
            <td> ${casesByCountries[i].TotalDeaths}</td>
        </tr>`

        table_countries_body.innerHTML += rows;
    }

}
table()
async function fdf(x, y, z, v) {
    const data = await covidApi.getSummary()
    // Create the chart
    // Data retrieved from https://netmarketshare.com/
    Highcharts.chart('container2', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        title: {
            text: 'COVID-19<br><br>Global<br>2023',
            align: 'center',
            verticalAlign: 'middle',
            y: 60
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: true,
                    distance: -50,
                    style: {
                        fontWeight: 'bold',
                        color: 'white'
                    }
                },
                startAngle: -90,
                endAngle: 90,
                center: ['50%', '75%'],
                size: '110%'
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            innerSize: '50%',
            data: [
                ['Total Confirmed', x],
                ['New Confirmed', y],
                ['Total Death', z],
                ['Recovery', v],

            ]
        }]
    });
}
async function CountriesData() {
    let selected = (document.getElementById('country').value).toLowerCase()
   selected =  selected.replace(/\s/g, "-")
   let Totalconfirmed = document.getElementById('confirmed-total')
   let Newconfirmed = document.getElementById('new-confirmed')
   let TotalDeath = document.getElementById('death-total')
   let recocovered = document.getElementById('recoverd')
    const summaryData = await covidApi.getSummary()
    summaryData.Countries.forEach(e => {
        if (e.Slug == selected) {
            let cTotalDeathValue = e.TotalDeaths
            let cNewconfirmedValue = e.NewConfirmed
            let cTotalconfirmedValue = e.TotalConfirmed
            let cTotalRecoveredValue = ((cTotalDeathValue / cTotalconfirmedValue) * 100).toFixed(2) + " %"
            TotalDeath.innerHTML = animateValue(TotalDeath, 0, cTotalDeathValue, 500)
            Totalconfirmed.innerHTML = animateValue(Totalconfirmed, 0, cTotalconfirmedValue, 500)
            Newconfirmed.innerHTML = animateValue(Newconfirmed, 0, cNewconfirmedValue, 500)
            recocovered.innerHTML = cTotalRecoveredValue
            DrawChart(cTotalconfirmedValue, cTotalDeathValue, cNewconfirmedValue)

        }
    })}; 
async function toptablechart() {
    const summaryData = await covidApi.getSummary()
    // Load countries table
    let casesByCountries = summaryData.Countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed)
    let x = [], y = [], z = [], k = []
    for (let i = 0; i < 10; i++) {
        x.push(casesByCountries[i].Country)
        y.push(casesByCountries[i].TotalConfirmed)
        z.push(casesByCountries[i].NewConfirmed)
        k.push(casesByCountries[i].TotalDeaths)
    }
    Highcharts.chart('container3', {

        chart: {
            type: 'column',
            styledMode: true
        },

        title: {
            text: 'Top ten countries COVID-19 victims',
            align: 'left'
        },

        subtitle: {
            text: 'Source: ' +
                '<a href="https://api.covid19api.com/summary"' +
                'target="_blank">WorldData</a>',
            align: 'left'
        },

        xAxis: {
            categories: x
        },

        yAxis: [{ // Primary axis
            className: 'highcharts-color-2',
            title: {
                text: ''
            }
        }, { // Secondary axis
            className: 'highcharts-color-1',
            opposite: true,
            title: {
                text: ''
            }
        }],

        plotOptions: {
            column: {
                borderRadius: 5
            }
        },

        series: [{
            name: 'Total Confirmed',
            data: y,
            tooltip: {
                valueSuffix: ''
            }
        }, {
            name: 'Total Deaths',
            data: k,
            yAxis: 1,
        }]

    });
}



const logBtn1 = document.getElementById('showChart');
 logBtn1.addEventListener('click', toptablechart);

let logBtn2 = document.getElementById('log');
logBtn2.addEventListener('click', CountriesData);
