module.exports = (sequelize, DataTypes) => {
    const Slack = sequelize.define("slackchat", {
        chat_userid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
        },
    });
    return Slack;
};