import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { Profile } from "./profile";

export class ProfileEmail extends Model {
  public id!: string;
  public profile_id!: string;
  public email!: string;
  public label?: string;
  public display_order!: number;
}

ProfileEmail.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    label: DataTypes.STRING,
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "profile_emails",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

ProfileEmail.belongsTo(Profile, { foreignKey: "profile_id" });
Profile.hasMany(ProfileEmail, { foreignKey: "profile_id" });
