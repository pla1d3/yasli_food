define(['js/connect', 'chart', 'jquery'], function (Connect, d3) {

    var cnct = new Connect();
    
    cnct.eated.done(async function(data) {

        var statCal = sortTopSeven(data).reverse();
        var statDays = sortTopDay().reverse();
        var canvas = document.getElementById("stat_canvas");

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: statDays,
                datasets: [{
                    label: "Калорий",
                    borderColor: "#80cc29",
                    backgroundColor: "#fff",
                    pointBorderColor: "rgba(128, 204, 41, 0.5)",
                    pointBackgroundColor: "#80cc29",
                    pointHoverBackgroundColor: "#80cc29",
                    pointHoverBorderColor: "#80cc29",
                    pointBorderWidth: 10,
                    pointHoverRadius: 10,
                    pointHoverBorderWidth: 1,
                    pointRadius: 3,
                    fill: false,
                    borderWidth: 4,
                    data: statCal
                }]
            },
            options: {
                legend: {
                    display: false
                },
                elements: {
                    line: {
                        tension: 0.000001
                    }
                },
                plugins: {
                    filler: {
                        propagate: false
                    }
                },    
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: "rgba(0,0,0,0.5)",
                            fontStyle: "bold",
                            beginAtZero: true,
                            maxTicksLimit: 5,
                            padding: 20,
                            fontSize: 18
                        },
                        gridLines: {
                            drawTicks: false,
                            display: false
                        }
                    }],
                    xAxes: [{
                        gridLines: {
                            zeroLineColor: "transparent"
                        },
                        ticks: {
                            padding: 20,
                            fontColor: "rgba(0,0,0,0.5)",
                            fontStyle: "bold",
                            fontSize: 16
                        }
                    }]
                }
            }
        });

        var eatedData = await sortEatedData(data);
        var eatedCanvas = document.getElementById("eated_canvas");

        new Chart(eatedCanvas, {
            type: 'pie',
                data: {
                labels: eatedData.map(i => i.name),
                datasets: [
                    {
                        data: eatedData.map(i => i.count),
                        borderColor: 'none',
                        borderWidth: 0,
                        backgroundColor: [
                            "#FF6384",
                            "#63FF84",
                            "#84FF63",
                            "#8463FF",
                            "#6384FF"
                        ]
                    }
                ],
            },
            options: {
                legend: {
                    position: 'right',
                    labels: {
                        fontSize: 16,
                        fontFamily: 'Roboto',
                        fontColor: '#fff',
                        padding: 20
                    }
                },
            }
        });
    

    });

    function sortEatedData(arr) {
        return new Promise(resolve => cnct.foods.done(function(data) {

            arr = arr.reduce((a,i) => a.concat(i.eated), []);
            var tmpObj = arr.reduce(function(acc, el) {
                acc[el] = (acc[el] || 0) + 1;
                return acc;
            }, {});

            var resData = [];
            for(key in tmpObj) {
                resData.push({name: data[key-1].name, count: tmpObj[key]});
            }

            resolve(resData.sort((a,b) => b.count - a.count).slice(0, 5));

        }));
    }

    function sortTopSeven(data) {
        var resData = [];
        var sortData = data.sort((a,b) => b.date - a.date);
        var nowDate = new Date();
        nowDate.setHours(0, 0, 0);

        for(var i=0; i<7; i++) {
            var dayData = findDate(nowDate, sortData);
            dayData = dayData.reduce((a, i) => a += i.done, 0);
            resData.push(dayData);
            nowDate.setDate(nowDate.getDate()-1);
        }

        return resData;
    }

    function sortTopDay() {
        var resData = [];
        var nowDate = new Date();

        for(var i=0; i<7; i++) {
            resData.push(nowDate.toLocaleString().slice(0, 10));
            nowDate.setDate(nowDate.getDate()-1);
        }

        return resData;
    }

    function findDate(date, data) {
        return data.filter(i => {
            var fixDate = new Date(i.date);
            fixDate.setHours(0, 0, 0);
            return Date.parse(fixDate) == Date.parse(date);
        });
    }

});