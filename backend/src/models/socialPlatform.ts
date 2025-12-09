import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

export class SocialPlatform extends Model {
  public id!: string;
  public name!: string;
  public icon_name!: string;
  public display_order!: number;
}

SocialPlatform.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    icon_name: { type: DataTypes.STRING, allowNull: false },
    display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: "social_platforms",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);
