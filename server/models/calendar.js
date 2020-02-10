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
        state: {
            type: DataTypes.STRING,
        },
    });
    Calendar.associate = function(models) {
        Calendar.belongsTo(models.user)
    }
    return Calendar;
};