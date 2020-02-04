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
        },
        userphone: {
            type: DataTypes.STRING,
        },
        state : {
            type: DataTypes.STRING,
        },
        p_token : {
            type: DataTypes.STRING,
        },
        b_p_token : {
            type: DataTypes.STRING,
        },
    });
    return User;
};