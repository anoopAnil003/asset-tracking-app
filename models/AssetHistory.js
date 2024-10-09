
module.exports = (sequelize, DataTypes) => {
    const AssetHistory = sequelize.define('AssetHistory', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      assetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      employeeId: {
        type: DataTypes.INTEGER,  // Foreign key (can be null for non-employee actions)
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING, // 'issued', 'returned', 'scrapped', etc.
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,  // Optional description (reason for action, etc.)
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,  // Automatically set the current date and time
      },
    });

    return AssetHistory;
  };
  