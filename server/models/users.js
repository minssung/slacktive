module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
        id : {
            type: DataTypes.STRING,
            primaryKey : true,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        useremail: {
            type: DataTypes.STRING,
        },
        userphone: {
            type: DataTypes.STRING,
        },
        state : {
            type: DataTypes.STRING,
        },
        holidaycount : {
            type: DataTypes.INTEGER,
        },
        p_token : {
            type: DataTypes.STRING,
        },
    });
    User.associate = function(models) {
        User.hasMany(models.slackchat)
    }
    return User;
};