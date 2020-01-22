module.exports = (sequelize, DataTypes) => {
 
    const User = sequelize.define("user", {
        userid : {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        useremail: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userphone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        totalcount : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        state : {
            type: DataTypes.STRING,
            allowNull: false
        },
    });

    //User.associate = function(models) {
        //models.user.hasMany(models.group);
        //models.user.belongsTo(models.group);
    //};
 
    return User;
};