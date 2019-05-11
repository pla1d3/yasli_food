requirejs.config({
    paths: {
        jquery: '/build/lib/jquery/jquery.min',
        select2: '/build/lib/select2/select2.min',
        datepicker: '/build/lib/datepicker/datepicker.min',
        mask: '/build/lib/mask/jquery.mask.min',
        chart: '/build/lib/chart/chart.min',
        js: '/src/js/',
    },
    shim: {
        datepicker: {
            deps: ['jquery']
        },
        mask: {
            deps: ['jquery']
        }
    }
});

require(['js/connect', 'jquery', 'select2', 'datepicker', 'mask', 'chart', 'js/home', 'js/profile', 'js/calendar', 'js/stat'], function(Connect) {

    $(document).ready(function(){

        var cnct = new Connect();

        // tabs
        var indexActive = 0;
        var linksId = {'/': 0, '/profile': 1, '/calendar': 2, '/stat': 3};
        var pages = document.getElementsByClassName('page');
        var links = document.getElementsByClassName('link');

        [].forEach.call(links, i => {
            i.addEventListener('click', function(e) {
                e.preventDefault();
                history.pushState('link', null, this.getAttribute('href'));
                swapActiveClass(this.getAttribute('href'));
                [].forEach.call(pages, e => e.style.transform = 'translateX(-'+indexActive*100+'%)');
            });
        });

        // drop
        swapActiveClass(window.location.pathname);
        [].forEach.call(pages, e => e.style.cssText = 'transition: none;transform: translateX(-'+indexActive*100+'%)');
        setTimeout(function() {
            [].forEach.call(pages, e => e.style.cssText = 'transform: translateX(-'+indexActive*100+'%)');
        }, 400);

        function swapActiveClass(link) {
            pages[indexActive].classList.remove('activePage');
            links[indexActive].classList.remove('linkActive');
            
            indexActive = linksId[link];
            pages[indexActive].classList.add('activePage');
            links[indexActive].classList.add('linkActive');
        }

        var profile = JSON.parse(localStorage.getItem('profile')) || null;
        if(profile) {
            var disable = document.getElementsByClassName('hc_formDisable')[0];
            var disable2 = document.getElementsByClassName('cc_contentDisable')[0];
            var disable3 = document.getElementsByClassName('hcfd_item')[0];
            disable.classList.remove('hc_formDisable');
            disable2.classList.remove('cc_contentDisable');
            disable3.remove();
        }
        
    });

});
