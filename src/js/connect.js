define(['jquery'], function () {

    var Connect = function(){};
    Connect.prototype.token = localStorage.getItem('token');

    if(!Connect.prototype.token) {
        Connect.prototype.token = generateToken(30);
        localStorage.setItem('token', Connect.prototype.token);
    }

    function generateToken(length){
        var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
        var b = [];  
        for(var i=0; i<length; i++) {
            var j = (Math.random() * (a.length-1)).toFixed(0);
            b[i] = a[j];
        }
        return b.join("");
    }

    Connect.prototype.eated = $.ajax({
        url: '/api/eated', 
        method: 'POST', 
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify({'token': Connect.prototype.token}),
    });

    Connect.prototype.foods = $.ajax({url: '/api/food', method: 'POST', dataType: 'json'});

    return Connect;

});