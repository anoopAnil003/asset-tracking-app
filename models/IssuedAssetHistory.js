module.exports = (sequelize, DataTypes) => {
  const IssuedAssetHistory = sequelize.define('IssuedAssetHistory', {
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Assets',
        key: 'id',
      },
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    issuedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    returnedDate: {
      type: DataTypes.DATE,
      allowNull: true,  // can be null if the asset is not returned yet
    },
    employeeName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    returnReason: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });
  
  IssuedAssetHistory.associate = (models) => {
    IssuedAssetHistory.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee',
    });
    
    IssuedAssetHistory.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      as: 'asset',
    });
  };

  return IssuedAssetHistory;
};
