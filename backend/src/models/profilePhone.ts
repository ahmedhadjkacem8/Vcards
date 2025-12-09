import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { Profile } from "./profile";

export class ProfilePhone extends Model {
  public id!: string;
  public profile_id!: string;
  public phone!: string;
  public label?: string;
  public display_order!: number;
}

ProfilePhone.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    profile_id: { type: DataTypes.UUID, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    label: DataTypes.STRING,
    display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: "profile_phones",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

ProfilePhone.belongsTo(Profile, { foreignKey: "profile_id" });
Profile.hasMany(ProfilePhone, { foreignKey: "profile_id" });
