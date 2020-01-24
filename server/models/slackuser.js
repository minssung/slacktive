module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define("slackuser", {      // "slackuser" = 생설할 테이블 이름
        name: {
            type: DataTypes.STRING,
            //allowNull: false
        },

        onWork: {
            type: DataTypes.STRING,
            defaultValue: "미출근"
            //allowNull: false
        }
    });

    // User.associate = function(models) {
    //     //models.user.hasOne(models.group);
    //     models.user.belongsTo(models.group);
    // };
     
    return User;
};