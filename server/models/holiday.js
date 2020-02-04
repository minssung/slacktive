module.exports = (sequelize, DataTypes) => {
    const Holiday = sequelize.define("holiday", {
        holiday_userid: {
            type: DataTypes.STRING,
            allowNull: false
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
    return Holiday;
};