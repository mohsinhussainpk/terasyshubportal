var socket = io('https://www.terasyshub.io');

tempData = [];

$(document).ready(function () {

    socket.on('connect', function(){
        console.log('Connected to terasyshub.io server.');

        prev = $('#devices option:selected').val();
        var token = $('#devices').attr('data-tok');

        $('.logout').click(function(){
            $.post('/logout').done(function(){
                location.reload();
            });
        });

        $.ajax({
            url: 'https://www.terasyshub.io/api/v1/data/temperature/'+prev+'?order=desc',
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", 'JWT '+token);
            },
            type: "GET",
            success: function(data) {
                populateTemp(data);
            }
        });

        $.ajax({
            url: 'https://www.terasyshub.io/api/v1/data/humidity/'+prev,
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", 'JWT '+token);
            },
            type: "GET",
            success: function(data) {
                populateHumidity(data)
            }
        });

        socket.emit('register', {device:prev, token:token});

        $('#devices').change(function(){

            var device = $('#devices option:selected').val();

            $.ajax({
                url: 'https://www.terasyshub.io/api/v1/data/temperature/'+device+'',
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'JWT '+token);
                },
                type: "GET",
                success: function(data) {
                    populateTemp(data);
                }
            });

            $.ajax({
                url: 'https://www.terasyshub.io/api/v1/data/humidity/'+device,
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'JWT '+token);
                },
                type: "GET",
                success: function(data) {
                    populateHumidity(data)
                }
            });

            socket.emit('unregister', prev);
            socket.emit('register', {device:device, token:token});

            prev = device;

        });

        socket.on('temperature', function(data){
            addTemp(data);
            $('.tempRow .raw .data').append('<p>'+JSON.stringify(data)+'</p>')
        });

        socket.on('humidity', function(data){
            addHumidity(data);
            $('.humRow .raw .data').append('<p>'+JSON.stringify(data)+'</p>')
        });


    });

});

function populateTempAM(data){

    tempData = [];

    data.map(function(obj){
        var x = new Date(obj.timestamp);
        tempData.push({date:x, temperature:obj.value});
    });

    var chart = AmCharts.makeChart( "chartdiv", {
        "type": "serial",
        "theme": "light",
        "zoomOutButton": {
            "backgroundColor": '#000000',
            "backgroundAlpha": 0.15
        },
        "dataProvider": tempData,
        "categoryField": "date",
        "categoryAxis": {
            "parseDates": true,
            "minPeriod": "mm",
            "dashLength": 1,
            "gridAlpha": 0.15,
            "axisColor": "#DADADA"
        },
        "graphs": [ {
            "id": "temp",
            "valueField": "temperature",
            "bullet": "round",
            "bulletBorderColor": "#FFFFFF",
            "bulletBorderThickness": 2,
            "lineThickness": 2,
            "lineColor": "#b5030d",
            "negativeLineColor": "#0352b5",
            "hideBulletsCount": 50
        } ],
        "chartCursor": {
            "cursorPosition": "mouse"
        },
        "chartScrollbar": {
            "graph": "temp",
            "scrollbarHeight": 40,
            "color": "#FFFFFF",
            "autoGridCount": true
        }
    } )

}

function populateTemp(data){

    var labels = [];
    var series = [];

    var unit = 'Temperature';

    if(data.length)
        unit += ' ('+data[0].unit+')';

    unit+=': ';


    data.map(function(obj){
        var x = moment.unix(obj.timestamp).toDate();
        labels.unshift(x);
        series.unshift({meta:moment(x).format('M/D/YYYY HH:mm:ss'),value:obj.value})
    });

    chartTemp = new Chartist.Line('.ct-chart-temp', {
        labels: labels,
        series: [series]
    }, {
        low: 0,
        axisX: {
            labelInterpolationFnc: function(value) {
                return moment(value).format('M/D HH:mm');
            }
        },
        plugins: [
            Chartist.plugins.tooltip({
                currency: unit
            })
        ]
    });
}

function populateHumidity(data){

    var labels = [];
    var series = [];

    var unit = 'Humidity';

    if(data.length)
        unit += ' ('+data[0].unit+')';

    unit+=': ';

    data.map(function(obj){
        var x = moment.unix(obj.timestamp).toDate();
        labels.unshift(x);
        series.unshift({meta:moment(x).format('M/D/YYYY HH:mm:ss'),value:obj.value})
    });

    var title = 'Temperature';
    if(data.length)
        title+=' ('+data[0].unit+')';

    chartHum = new Chartist.Bar('.ct-chart-hum', {
        labels: labels,
        series: [series]
    }, {
        high: 100,
        low: 0,
        axisX: {
            labelInterpolationFnc: function(value) {
                return moment(value).format('M/D HH:mm');
            }
        },
        plugins: [
            Chartist.plugins.tooltip({
                currency: unit
            })
        ]
    });

}

function addTemp(data){
    console.log(data);
    var labels = chartTemp.data.labels;
    var series = chartTemp.data.series[0];
    var x = moment.unix(data.timestamp).toDate();
    if(labels.length>20){
        series.shift();
        labels.shift();
    }
    labels.push(x);
    series.push({meta:moment(x).format('M/D/YYYY HH:mm:ss'),value:data.value})
    chartTemp.update({labels:labels, series:[series]})
}

function addHumidity(data){
    console.log(data);
    var labels = chartHum.data.labels;
    var series = chartHum.data.series[0];
    var x = moment.unix(data.timestamp).toDate();
    if(labels.length>20){
        series.shift();
        labels.shift();
    }
    labels.push(x);
    series.push({meta:moment(x).format('M/D/YYYY HH:mm:ss'),value:data.value})
    chartHum.update({labels:labels, series:[series]})
}
