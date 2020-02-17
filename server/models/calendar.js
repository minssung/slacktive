module.exports = (sequelize, DataTypes) => {
    const Calendar = sequelize.define("calendar", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ts: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cate : {
            type : DataTypes.STRING,
            allowNull: false,
        },
        textTime : {
            type : DataTypes.STRING,
            allowNull: false,
        },
        textTitle : {
            type : DataTypes.STRING,
            allowNull: false,
        }
    });
    Calendar.associate = function(models) {
        Calendar.belongsTo(models.user)
    }
    return Calendar;
};