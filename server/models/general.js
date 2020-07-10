module.exports = (sequelize, DataTypes) => {
    const General = sequelize.define("general", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
        },
        content: {
            type: DataTypes.STRING,
        },
        tag: {
            type: DataTypes.STRING(30),
        },
        partner: {
            type: DataTypes.JSON,
        },
        startDate : {
            type: DataTypes.STRING(20),
        },
        endDate : {
            type: DataTypes.STRING(20),
        },
    });
    General.associate = function(models) {
        General.belongsTo(models.user)
    }
    return General;
};