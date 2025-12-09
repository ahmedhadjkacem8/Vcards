import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { Profile } from "./profile";

export class ProfileAddress extends Model {
  public id!: string;
  public profile_id!: string;
  public address!: string;
  public label?: string;
  public display_order!: number;
}

ProfileAddress.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    profile_id: { type: DataTypes.UUID, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    label: DataTypes.STRING,
    display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: "profile_addresses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

ProfileAddress.belongsTo(Profile, { foreignKey: "profile_id" });
Profile.hasMany(ProfileAddress, { foreignKey: "profile_id" });
