define(['js/connect', 'jquery', 'select2'], function (Connect) {
    
    var Home = function(){};
    var home = new Home();

    Home.prototype.getNeedCalories = function getNeedCalories(profile) {
        var parseDate = profile.date.split('-').reverse();
        var countDay = Math.ceil((new Date(parseDate[2], +parseDate[1]-1, parseDate[0]) - new Date()) / 8.64e7);
        if(countDay > 30) countDay = 30;
        var coef = 0;

        if(profile.method == 2) {
            coef = 300 / countDay;
            formFull = ((+profile.weight - +profile.need) * coef);
            formDay = formFull/3;
        } else {
            coef = 900 / countDay;
            formFull = ((+profile.weight - +profile.need) * coef);
            formDay = formFull/5;
        }

        return formDay.toFixed(0);
    }

    Home.prototype.getOptionSelect = function getOptionSelect(method) {
        return cnct.eated.done(data => {
            var nowDate = new Date();
            nowDate.setHours(0,0,0,0);

            var fData = data.reduce((a,i) => {
                var pdate = new Date(i.date);
                pdate.setHours(0,0,0,0);
                if(Date.parse(nowDate) == Date.parse(pdate)) a.push(i.meal);
                return a;
            }, []);

            var selectContent = '';
            if(method == 'Похудеть') {
                selectContent = `<option selected disabled>Прием пищи</option>
                <option `+checkCompleteMeal(fData, 'Завтрак')+` value="Завтрак">Завтрак</option>
                <option `+checkCompleteMeal(fData, 'Обед')+` value="Обед">Обед</option>
                <option `+checkCompleteMeal(fData, 'Ужин')+` value="Ужин">Ужин</option>`;
            } else {
                selectContent = `<option selected disabled>Прием пищи</option>
                    <option `+checkCompleteMeal(fData, 'Завтрак')+` value="Завтрак">Завтрак</option>
                    <option `+checkCompleteMeal(fData, 'Второй завтрак')+` value="Второй завтрак">Второй завтрак</option>
                    <option `+checkCompleteMeal(fData, 'Обед')+` value="Обед">Обед</option>
                    <option `+checkCompleteMeal(fData, 'Полдник')+` value="Полдник">Полдник</option>
                    <option `+checkCompleteMeal(fData, 'Ужин')+` value="Ужин">Ужин</option>`;
            }

            var meal_select = document.getElementById('meal_select');
            meal_select.innerHTML = selectContent;
        });
    }

    // set plugin
    $('#meal_select').select2({minimumResultsForSearch: -1, width: '280px',});
    var cnct = new Connect();
    cnct.foods.done(function(data) {
        renderList(document.getElementsByClassName('hcp_case')[0], data);
    });
    
    // render
    var eaterActive = [];
    function renderList(el, data) {
        el.innerHTML = data.reduce((a, i) =>  a += createItem(i), '');
        var make_items = document.getElementsByClassName('hcpc_fix');
        [].forEach.call(make_items, i => {
            i.addEventListener('mousedown', itemMouseDown);
            i.addEventListener('mouseup', itemMouseUp);
        });
    }
    function createItem(item) {
        return `
            <div class="hcpc_item">
                <div class="hcpc_fix" data-id="`+item.id+`">
                    <i style="background-image: url(/src/res/foods/`+item.image+`);"></i>
                    <h4>`+item.name+`</h4>
                    <p><span class="calories">`+item.calories+`</span> ккал</p>
                </div>
            </div>
        `;
    }

    // start and stop event
    var move = false;
    var moveElem = null;
    function itemMouseDown() {
        move = true;
        moveElem = this;
    }
    function itemMouseUp() {
        moveElem.style = '';
        move = false;
        moveElem = null;
    }

    // events
    document.body.addEventListener('mousemove', function(e) {
        if(move && moveElem) {
            e.preventDefault();
            var tmpScrollTop = document.getElementsByTagName('body')[0].scrollTop;

            moveElem.style.position = 'absolute';
            moveElem.style.left = e.clientX-50;
            moveElem.style.top = e.clientY-150+tmpScrollTop;

            if(e.target.classList[0] == 'ec_item' && e.target.classList[1] != 'eci_add') {
                e.target.classList.add('ec_itemOver');
            } else {
                var itemOver = document.getElementsByClassName('ec_itemOver')[0];
                if(itemOver) itemOver.classList.remove('ec_itemOver');
            }
        }
    });
    document.body.addEventListener('mouseup', function(e) {
        let elClass = e.target.parentElement.classList[0];

        if(move && e.target.classList[0] == 'ec_item' && e.target.classList[1] != 'eci_add') {
            e.target.classList.remove('ec_itemOver');
            e.target.classList.add('ec_itemActive');

            if(moveElem) moveElem.style = '';
            newMoveElem = moveElem.cloneNode(true);
            eaterActive.push({
                id: +moveElem.dataset.id,
                calories: newMoveElem.getElementsByClassName('calories')[0].innerHTML
            });
            updateSum();

            newMoveElem.addEventListener('mousedown', function(me, e) {
                oldMoveElem = me;
                oldMoveElem.style = '';

                moveElem = oldMoveElem;
                moveElem.style.left = e.clientX-50;
                moveElem.style.top = e.clientY-150;
                moveElem.style.position = 'absolute';
                
                eaterActive = eaterActive.filter(i => i.id != this.dataset.id);
                updateSum();

                this.remove();
                move = true;
            }.bind(newMoveElem, moveElem));
            e.target.appendChild(newMoveElem);

            moveElem.style.display = 'none';
            move = false;
            moveElem = null;
        } else if(move && moveElem && elClass != 'hcpc_fix' && elClass != 'hcpc_item') {
            moveElem.style = '';
            move = false;
            moveElem = null;
        }
    });

    var make_item = 1;
    var maker_list = document.getElementsByClassName('eated_case')[0];
    maker_list.addEventListener('click', function(e) {
        if(e.target.classList[1] == 'eci_add' && make_item != 5) {
            var make_tamplate = document.createElement("div");
                make_tamplate.innerHTML = '<div class="eci_del"></div>';
                make_tamplate.classList.add('ec_item');

            make_item++;
            maker_list.insertBefore(make_tamplate, e.target);
            if(make_item == 5) document.getElementsByClassName('eci_add')[0].style.cssText = 'display: none';
        }
        if(e.target.classList[0] == 'eci_del') {
            if(make_item == 5) document.getElementsByClassName('eci_add')[0].style.cssText = '';
            make_item--;
            var childActive = e.target.parentElement.children[1];
            if(childActive) {
                var childId = childActive.dataset.id;
                document.querySelector('.hcpc_fix[data-id="'+childId+'"]').style = '';
                eaterActive = eaterActive.filter(i => i.id != childId);
                updateSum();
            }
            e.target.parentElement.remove();
        }
    });

    function updateSum() {
        sumEated = eaterActive.reduce((a, i) => a += +i.calories, 0);
        var nowSum = document.getElementsByClassName('nowSum')[0];
        nowSum.innerHTML = sumEated;
    }

    // form 
    var formFull = 0;
    var formDay = 0;
    var sumEated = 0;
    var profile = JSON.parse(localStorage.getItem('profile')) || null;
    if(profile) {
        home.getOptionSelect(profile.method);
        var needSum = document.getElementsByClassName('needSum')[0];
        needSum.innerHTML = home.getNeedCalories(profile);
    }                            
    var eated_click = document.getElementsByClassName('eated_click')[0];
    eated_click.addEventListener('click', function() {
        var err = 0;
        var profile = JSON.parse(localStorage.getItem('profile'));
        var token =  localStorage.getItem('token');

        var validObj = {
            token: token,
            eated: eaterActive.map(i => i.id),
            meal: $('#meal_select').val(),
            method: profile.method,
            need: Math.ceil(formDay),
            done: Math.ceil(sumEated),
            full: Math.ceil(formFull),
            date: Date.parse(new Date())
        };

        if(!validObj.meal) {
            err = 1;
            $('#meal_select').next().addClass('selectError');
        } else {
            $('#meal_select').next().removeClass('selectError');
        }

        if(!validObj.eated.length) {
            err = 1;
            $('.eated_case').addClass('eatedError');
        } else {
            $('.eated_case').removeClass('eatedError');
        }

        console.log(validObj);

        if(!err) {
            pushOnServer(validObj);
        }
    });

    function pushOnServer(obj) {

        $.ajax({
            url: '/api/push', 
            method: 'POST', 
            contentType: "application/json",
            data: JSON.stringify(obj),
            success: function() {
                window.location = window.location;  
            }
        });

    }

    function checkCompleteMeal(fData, val) {
        if(fData.indexOf(val) != -1) return 'disabled'; 
    }

    return Home;

});  