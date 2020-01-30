module.exports = (sequelize, DataTypes) => {
 
    const Slack = sequelize.define("slackchat", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // state: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValues: '지각'
        // }
    });

    //Slack.associate = function(models) {
        //models.board.hasMany(models.group);
        //models.slack.belongsTo(models.group);
    //};
 
    return Slack;
};