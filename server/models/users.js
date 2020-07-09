module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
        id : {
            type: DataTypes.STRING,
            primaryKey : true,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        usertag : {
            type: DataTypes.STRING(10),
        },
        useremail: {
            type: DataTypes.STRING(50),
        },
        userphone: {
            type: DataTypes.STRING(20),
        },
        state : {
            type: DataTypes.STRING(20),
        },
        holidaycount : {
            type: DataTypes.DOUBLE,
        },
        userchannel : {
            type: DataTypes.STRING(20),
        },
        p_token : {
            type: DataTypes.STRING,
        },
    });
    User.associate = function(models) {
        User.hasMany(models.slackchat)
        User.hasMany(models.holiday)
        User.hasMany(models.general)
    }
    return User;
};