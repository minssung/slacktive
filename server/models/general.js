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
            allowNull: false
        },
        tag: {
            type: DataTypes.STRING,
        },
        partner: {
            type: DataTypes.STRING,
        },
        textTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state : {
            type : DataTypes.STRING,
        },
    });
    General.associate = function(models) {
        General.belongsTo(models.user)
    }
    return General;
};