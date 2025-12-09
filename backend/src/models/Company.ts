import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { User } from "./user";
import { Profile } from "./profile";

export class Company extends Model {
  public id!: string;
  public name!: string;
  public description?: string;
  public logo?: string;
  public website?: string;
  public created_by!: string;
}

Company.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: DataTypes.TEXT,
    logo: DataTypes.STRING,
    website: DataTypes.STRING,
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "companies",
    timestamps: true,
    underscored: true,
  }
);

/* ==================== Relations ==================== */

// Creator
Company.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// Optional link if you want company profile
Company.hasOne(Profile, { foreignKey: "company_id", as: "profile" });
