import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { User } from "./user";
import { Profile } from "./profile";
import { Company } from "./Company";

export class CompanyEmployee extends Model {
  public id!: string;
  public company_id!: string;
  public user_id?: string;
  public email!: string;
  public role!: "owner" | "admin" | "member";
  public profile_id?: string;
  public is_active!: boolean;
}

CompanyEmployee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("owner", "admin", "member"),
      defaultValue: "member",
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_active: {               // <-- ici on remplace "status" par "is_active"
      type: DataTypes.BOOLEAN,
      defaultValue: true,      // correspond à actif
    },
  },
  {
    sequelize,
    tableName: "company_employees",
    timestamps: true,
    underscored: true,
  }
);

/* ==================== Relations ==================== */

CompanyEmployee.belongsTo(Company, { foreignKey: "company_id" });
Company.hasMany(CompanyEmployee, {
  foreignKey: "company_id",
  as: "employees",
});

CompanyEmployee.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(CompanyEmployee, { foreignKey: "user_id" });

CompanyEmployee.belongsTo(Profile, { foreignKey: "profile_id" });
Profile.hasOne(CompanyEmployee, { foreignKey: "profile_id" });
