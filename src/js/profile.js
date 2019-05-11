define(['js/calendar', 'js/home', 'jquery', 'select2', 'datepicker', 'mask'], function (Calendar, Home) {

    var calendar = new Calendar();
    var home = new Home();

    //check profile
    var profile = JSON.parse(localStorage.getItem('profile')) || null;
    var caseForm = document.getElementsByClassName('pc_form')[0];
    caseForm.innerHTML = `<form onsubmit="return false;" autocomplete="off">
        <input name="now_date" type="hidden" value="` + getNowDate() + `" />
        <div class="pcf_item"><label><input name="name" value="`+(profile && profile.name || '')+`"/><span>Имя</span></label></div>
        <div class="pcf_item"><label><input name="weight" value="`+(profile && profile.weight || '')+`"/><span>Вес (кг)</span></label></div>
        <div class="pcf_item pcfi_select"><select name="method" id="method_need_select">`+getFormMethod(profile)+`</select></div>
        <div class="pcf_item"><label><input name="need" value="`+(profile && profile.need || '')+`"/><span>Сколько нужно (кг)</span></label></div>
        <div class="pcf_item"><label><input name="date" value="`+(profile && profile.date.split('-').reverse().join('.') || '')+`" id="need_date" /><span>До какого числа</span></label></div>
        <div class="pcf_item"><input type="submit" value="Сохранить" class="clicKFormProfile"/></div>
    </form>`;

    function getNowDate() {
        let dn = new Date();
        let d = ('0' + dn.getDate()).slice(-2);
        let m = ('0' + (dn.getMonth()+1)).slice(-2);
        let y = dn.getFullYear();
        return y + '-' + m + '-' + d;
    }

    //fix input html
    var inputs = document.getElementsByTagName('input');
    [].forEach.call(inputs, i => {
        i.addEventListener('change', function() {
            this.setAttribute('value', this.value);
        });
    });

    function getFormMethod(profile) {
        var str = '';

        if(!profile) str += '<option selected disabled>Мне нужно</option>';
        else str += '<option disabled>Мне нужно</option>';

        if(profile && profile.method == 1) str += '<option value="1" selected>Набрать массу</option>';
        else str +=  '<option value="1">Набрать массу</option>';

        if(profile && profile.method == 2) str += '<option value="1" selected>Похудеть</option>';
        else str += '<option value="1">Похудеть</option>';

        return str;
    }

    $('#method_need_select').select2({minimumResultsForSearch: -1, width: '100%',});
    $('#need_date').mask('00.00.0000');
    $('#need_date').datepicker({onSelect: function(df, d, i) {i.el.setAttribute('value', i.el.value)}});
    
    //valid form
    var clicKFormProfile = document.querySelector('.pc_form form');
    clicKFormProfile.addEventListener('submit', function(e) {
        var err = 0;

        [].forEach.call(this, i => {
            if(i.type != 'submit' && i.type != 'select-one') {
                if(i.value == '') {
                    err = 1;
                    i.classList.add('inputError');
                } else {
                    i.classList.remove('inputError');
                }          
            }
            if(i.type == 'select-one') {
                if(i.value == 'Мне нужно') {
                    err = 1;
                    i.nextSibling.classList.add('selectError');
                } else {
                    i.nextSibling.classList.remove('selectError');
                }
            }
        });

        if(!err) {
            showModal();
            var disable = document.getElementsByClassName('hc_formDisable')[0];
            var disable2 = document.getElementsByClassName('cc_contentDisable')[0];
            var disable3 = document.getElementsByClassName('hcfd_item')[0];
            var disable4 = document.getElementsByClassName('cccp_item')[0];
            if(disable) {
                disable.classList.remove('hc_formDisable');
                disable2.classList.remove('cc_contentDisable');
                disable3.remove();
                disable4.remove();
            }

            var profile = formToJson(this);
            profile.date = profile.date.split('.').reverse().join('-');

            var meal_select = document.getElementById('meal_select');
            meal_select.innerHTML = getOptionSelect(profile.method);
            
            var needSum = document.getElementsByClassName('needSum')[0];
            needSum.innerHTML = getNeedCalories(profile);
            localStorage.setItem('profile', JSON.stringify(profile));

            var stepMonth = new Date().getMonth() + 1;
            var stepYear = new Date().getFullYear();
            
            var c_content = document.getElementsByClassName('cc_content')[0];
            calendar.create(stepMonth, stepYear).then(html => {
                c_content.innerHTML = html;
                calendar.setEventActiveDay();
            });

            home.getOptionSelect(profile.method);
            var needSum = document.getElementsByClassName('needSum')[0];
            needSum.innerHTML = home.getNeedCalories(profile);
        }
    });

    function getNeedCalories(profile) {
        var parseDate = profile.date.split('.');
        var countDay = Math.ceil((new Date(parseDate[2], +parseDate[1]-1, parseDate[0]) - new Date()) / 8.64e7);
        var coef = 900 / countDay;

        if(profile.method == 'Похудеть') {
            result = ((+profile.weight - +profile.need) * coef)/3;
            if(result > 500) result = 500;
        } else {
            result = ((+profile.weight + +profile.need) * coef)/5;
        }

        return result.toFixed(0);
    }

    function getOptionSelect(method) {
        if(method == 'Похудеть') {
            return `<option selected disabled>Прием пищи</option>
            <option value="Завтрак">Завтрак</option>
            <option value="Обед">Обед</option>
            <option value="Ужин">Ужин</option>`;
        } else {
            return `<option selected disabled>Прием пищи</option><option value="Завтрак">Завтрак</option>
            <option value="Второй завтрак">Второй завтрак</option><option value="Обед">Обед</option>
            <option value="Полдник">Полдник</option><option value="Ужин">Ужин</option>`;
        }
    }

    function showModal() {
        var elModal = document.createElement('div');
            elModal.classList.add('modal');
            elModal.innerHTML = `<div class="modalExitIcon modalExit"></div>
                <p class="modalSaveText">Данные успешно сохранены!</p>
                <div class="modalExitBtn modalExit">Ок</div>`;
        document.body.appendChild(elModal);

        var modalExit = document.getElementsByClassName('modalExit');
        [].forEach.call(modalExit, i => i.addEventListener('click', function() {
                this.parentElement.remove();
            })
        );
    }

    function formToJson(form) {
        const values = {};
        const inputs = form.elements;
          
        for(let i=0; i<inputs.length; i++) {
            if(inputs[i].type != 'submit') {
                values[inputs[i].name] = inputs[i].value;
            }
        }

        return values;
    }

});