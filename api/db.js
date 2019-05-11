const fs = require('fs');

function DataBase(){};
DataBase.prototype.getFood = ()=> new Promise(resolve => fs.readFile('db/food.json', (_, data) => resolve(JSON.parse(data))));
DataBase.prototype.getEated = (token)=> new Promise(resolve => fs.readFile('db/eated.json', (_, data) => {
    var data = JSON.parse(data);
    resolve(data.filter(i => i.token == token));
}));
DataBase.prototype.pushEated = (data)=> fs.readFile('db/eated.json', (_, eated) => {
    var eated = JSON.parse(eated);
    eated.push(data);
    fs.writeFileSync('db/eated.json', JSON.stringify(eated), 'utf8');
});

module.exports = DataBase;