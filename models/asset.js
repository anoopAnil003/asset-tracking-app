module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define('Asset', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    serialNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    uniqueId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    assetType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    employeeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Employees',
        key: 'id',
      }
    },
    isScrapped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
  return Asset;
};
