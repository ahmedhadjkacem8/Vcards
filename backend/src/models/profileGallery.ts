import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { Profile } from "./profile";

export class ProfileGallery extends Model {
  public id!: string;
  public profile_id!: string;
  public image_url!: string;
  public display_order!: number;
}

ProfileGallery.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    profile_id: { type: DataTypes.UUID, allowNull: false },
    image_url: { type: DataTypes.STRING, allowNull: false },
    display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: "profile_gallery",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

ProfileGallery.belongsTo(Profile, { foreignKey: "profile_id" });
Profile.hasMany(ProfileGallery, { foreignKey: "profile_id" });
