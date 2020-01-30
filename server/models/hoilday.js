module.exports = (sequelize, DataTypes) => {
    const Hoilday = sequelize.define("hoilday", {
        userid: {
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
    return Hoilday;
};