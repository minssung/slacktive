module.exports = (sequelize, DataTypes) => {
    const Slack = sequelize.define("slackchat",{
        id : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ts: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });
    Slack.associate = function(models) {
        Slack.belongsTo(models.user)
    }
    return Slack;
};