import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { Profile } from "./profile";

export class ProfileFavorite extends Model {
  public id!: string;
  public user_id!: string;
  public profile_id!: string;
  public Profile?: Profile; 
}

ProfileFavorite.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: { type: DataTypes.UUID, allowNull: false },
    profile_id: { type: DataTypes.UUID, allowNull: false },
  },
  {
    sequelize,
    tableName: "profile_favorites",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["user_id", "profile_id"] }],
  }
);
ProfileFavorite.belongsTo(Profile, { foreignKey: "profile_id" });
Profile.hasMany(ProfileFavorite, { foreignKey: "profile_id" });

