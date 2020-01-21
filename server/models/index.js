const fs = require("fs");
const path = require("path");
const basename  = path.basename(__filename);
const Sequelize = require("sequelize");
 
const db = {};
 
const sequelize = new Sequelize("node_example", "root", "multi1004", { host: "docker.for.mac.host.internal", dialect: "mysql" });
 
sequelize.authenticate().then(() => {
    console.log("연결 성공");
}).catch(err => {
    console.log("연결 실패: ", err);
});
 
fs.readdirSync(__dirname).filter(file => {
    return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js");
}).forEach(file => {
    let model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
    console.log(db);
});

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
 
db.sequelize = sequelize;
db.Sequelize = Sequelize;
 
module.exports = db;