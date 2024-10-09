
module.exports = (sequelize, DataTypes) => {
  const AssetCategory = sequelize.define('AssetCategory', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  }, {
    tableName: 'AssetCategories',
    timestamps: true, //  createdAt/updatedAt
  });

  return AssetCategory;
};
