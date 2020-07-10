module.exports = (sequelize, DataTypes) => {
    const Slack = sequelize.define("slackchat",{
        id : {
            type: DataTypes.INTEGER,    // 구분 값
            primaryKey: true,
            autoIncrement: true
        },
        text: {
            type: DataTypes.STRING,     // 필터없는 텍스트
        },
        time: {
            type: DataTypes.STRING,     // 타임스탬프를 시각화
        },
        ts: {
            type: DataTypes.STRING,     // 타임스탬프
        },
        state: {
            type: DataTypes.STRING,     // 출근인지 지각인지 등 여부
        },
        textTime : {
            type: DataTypes.STRING,     // 필터 변환된 시간
        }
    });
    Slack.associate = function(models) {
        Slack.belongsTo(models.user)    // 유저 아이디 추가
    }
    return Slack;
};