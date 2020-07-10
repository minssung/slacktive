module.exports = (sequelize, DataTypes) => {
    const Holiday = sequelize.define("holiday", {
        id: {
            type: DataTypes.INTEGER,            // 구분 값
            primaryKey: true,
            autoIncrement: true
        },
        text: {
            type: DataTypes.STRING,             // 필터없는 텍스트
            allowNull: false
        },
        time: {
            type: DataTypes.STRING(50),         // 타임스탬프를 시각화
            allowNull: false
        },
        ts: {
            type: DataTypes.STRING(30),         // 타임스탬프
            allowNull: false,
        },
        cate : {
            type : DataTypes.STRING(30),        // 어떤 내용인지
        },
        textTime : {
            type : DataTypes.JSON,            // 텍스트에 입력된 날짜 { startDate, endDate ... }
            allowNull: false,
        },
    });
    Holiday.associate = function(models) {
        Holiday.belongsTo(models.user)          // 유저 아이디 추가
    }
    return Holiday;
};