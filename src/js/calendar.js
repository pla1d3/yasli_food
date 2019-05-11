define(['js/connect', 'jquery'], function (Connect) {

    var cnct = new Connect();
    var eated = cnct.eated;
    var stepMonth = new Date().getMonth() + 1;
    var stepYear = new Date().getFullYear();
    var caseHint = document.getElementsByClassName('hint_case')[0];
    var hints = null;

    var Calendar = function(){};
    Calendar.prototype.create = async function create(month, year) {
        var profile = JSON.parse(localStorage.getItem('profile')) || null;
        var now = new Date();

        var days_labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            months_labels = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      
        // fix
        this.month = (isNaN(month) || month == null) ? now.getMonth() + 1 : month;
        this.year = (isNaN(year) || year == null) ? now.getFullYear() : year;
        var logical_month = this.month - 1;
      
        // first number day and number weekday
        var first_day = new Date(this.year, logical_month, 1),
            first_day_weekday = first_day.getDay() == 0 ? 7 : first_day.getDay();
      
        // find number of days in month
        var month_length = new Date(this.year, this.month, 0).getDate(),
            previous_month_length = new Date(this.year, logical_month, 0).getDate();
      
        // calendar header
        var html = `<div class="ccc_head">
            <div class="ccch_item ccch_arrow cccha_left"></div>
            <div class="ccch_item ccch_title">` +months_labels[logical_month] + `, ` + this.year + `</div>
            <div class="ccch_item ccch_arrow cccha_right"></div>
        </div>`;

        html += `<div class="ccc_days">`;
        for(var i = 0; i <= 6; i++) html += '<div class="cccd_item">' +days_labels[i] + '</div>';
        html += `</div>`;

        // define default day variables
        var day  = 1, // current month days
            prev = 1, // previous month days
            next = 1; // next month days

        var nowDate = new Date();
        var startDate = profile && new Date(profile.now_date) || 0;
        var endDate = profile && new Date(profile.date) || 0;
        if(profile) {
            startDate.setHours(0);
            endDate.setHours(0);
        }
        nowDate.setHours(0, 0, 0, 0);

        html += '<div class="ccc_number">';
        for(var i = 0; i < 9; i++) {
            if(i==0 && !profile) html += '<a href="/profile" class="link cccp_item">Заполните форму</a>';
            for (var j = 1; j <= 7; j++) {
                if(day <= month_length && (i > 0 || j >= first_day_weekday)) {
                    // current month
                    var currDate = new Date(this.year, this.month-1, day);
                    var data = await eated.done(data => data);
                    var oldDate = findDate(currDate, data);
                    var classes = 'cccn_item';
                    genHint(day, currDate);

                    if(startDate <= currDate && endDate >= currDate) classes += ' cccn_itemActive';
                    if(Date.parse(currDate) == Date.parse(nowDate)) classes += ' cccn_itemNow';
                    if(oldDate.length && Date.parse(currDate) != Date.parse(nowDate)) classes += ' cccn_itemActive cccn_itemOld';

                    html += '<div class="'+classes+'" data-id="'+day+'">' + day + '</div>';
                    day++;
                } else {
                    if (day <= month_length) {
                        // previous month
                        html += '<div class="cccn_item other-month">' + (previous_month_length - first_day_weekday + prev + 1) + '</div>';
                        prev++;
                    } else {
                        // next month
                        html += '<div class="cccn_item other-month">' + next + '</div>';
                        next++;
                    }
                }
            }
      
            // stop making rows if it's the end of month
            if(day > month_length) {
                html += '</div>';
                break;
            }
        }

        html += '</div>';

        return html;
    }

    var calendar = new Calendar();
    var c_content = document.getElementsByClassName('cc_content')[0];
    calendar.create(stepMonth, stepYear).then(html => {
        c_content.innerHTML = html;
        calendar.setEventActiveDay();
    });

    c_content.addEventListener('click', function(e) {
        if(e.target.classList[2] == 'cccha_left') {
            if(stepMonth == 1) {
                stepYear--;
                stepMonth = 12;
            } else {
                stepMonth--;
            }
            calendar.create(stepMonth, stepYear).then(html => {
                c_content.innerHTML = html;
                calendar.setEventActiveDay();
            });
        } 
        if(e.target.classList[2] == 'cccha_right') {
            if(stepMonth == 12) {
                stepYear++;
                stepMonth = 1;
            } else {
                stepMonth++;
            }
            calendar.create(stepMonth, stepYear).then(html => {
                c_content.innerHTML = html;
                calendar.setEventActiveDay();
            });
        }
    });

    function genHint(id, date) {
        eated.done(async data => {
            var info = getInfoOneDay(date, data);

            var hint = document.createElement('div');
                hint.classList.add('hint_item');
                hint.dataset.id = id;

            if(info) {
                hint.innerHTML = `<div>Съедино блюд: `+info.foods.length+`</div>
                    <div class="hintImageCase">`+await getMealsEaten(info.foods)+`</div>
                    <div>Съедино калл: `+info.sumCaloriesDone+`</div>
                    <div>Нужное кол-во: `+info.fullCalories+`</div>
                    <div>Статус: `+ getStatusHint(info, date)+ `<div>`;
            } else {
                hint.innerHTML = 'Нет данных';
            }

            caseHint.appendChild(hint);
        });
    }

    function getMealsEaten(foods) {
        return new Promise(resolve => cnct.foods.done((data) => {
            var images = data.filter(i => foods.indexOf(i.id) != -1);
            resolve(images.reduce((a,i) => {
                return a += '<i style="background-image: url(/src/res/foods/'+i.image+')"></i>';
            }, ''));
        }));
    }

    function getStatusHint(info, date) {
        var nowDate = new Date();
        nowDate.setHours(0, 0, 0);
        if(Date.parse(nowDate) == Date.parse(date)) {
            return 'Выполняется ⏱️';
        } else {
            if(info.complete) return 'Выполнено ✔️';
            else return 'Провалено ❌';
        }
    }

    function getInfoOneDay(itemDate, data) {
        var validData = findDate(itemDate, data);

        if(validData.length) {
            validData = validData.reduce((a, i) => {
                a.foods = a.foods.concat(i.eated.filter(item => a.foods.indexOf(item) == -1));
                a.method = i.method;
                a.sumCaloriesDone += i.done;
                a.fullCalories = i.full;
                return a;
            }, {sumCaloriesDone: 0, foods: []});

            var a = validData.method == 1 && validData.fullCalories - 50 <= validData.sumCaloriesDone;
            var b = validData.method == 2 && validData.fullCalories >= validData.sumCaloriesDone + 50;
            validData.complete = a || b;
          
            return validData;
        } else {
            return '';
        }
    }

    function findDate(date, data) {
        return data.filter(i => {
            var fixDate = new Date(i.date);
            fixDate.setHours(0, 0, 0);
            return Date.parse(fixDate) == Date.parse(date);
        });
    }

    Calendar.prototype.setEventActiveDay = function setEventActiveDay() {
        var items = document.getElementsByClassName('cccn_itemActive');
        var hints = document.getElementsByClassName('hint_item');
        var caseHint = document.getElementsByClassName('hint_case')[0];

        [].forEach.call(items, e => {
            e.onmousemove = function(e) {
                e.target.classList.add('cccn_itemMouse');
                hints[e.target.dataset.id-1].classList.add('hint_itemShow');

                var tmpScrollTop = document.getElementsByTagName('body')[0].scrollTop;
                caseHint.style = 'opacity:1;transition:0.7s opacity;top:'+(e.clientY+tmpScrollTop-50)+'px;left:'+(e.clientX)+'px';

            };
            e.onmouseleave = function(e) {
                e.target.classList.remove('cccn_itemMouse');
                hints[e.target.dataset.id-1].classList.remove('hint_itemShow');
                caseHint.style = 'opacity:0;transition:0s opacity;top:-1000px;left:-1000px';
            };
        });
    }

    return Calendar;

});