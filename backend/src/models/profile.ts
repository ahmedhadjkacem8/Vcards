import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { User } from "./user";

export class Profile extends Model {
  public id!: string;
  public user_id!: string;
  public display_name!: string;
  public bio?: string;
  public avatar_url?: string;
  public cover_url?: string;
  public primary_color?: string;
  public secondary_color?: string;
  public tier!: "free" | "premium";
  public visibility!: "public" | "private" | "floux";
  public is_banned!: boolean;
}

Profile.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: DataTypes.TEXT,
    avatar_url: DataTypes.STRING,
    cover_url: DataTypes.STRING,
    primary_color: {
      type: DataTypes.STRING,
      defaultValue: "#4F46E5",
    },
    secondary_color: {
      type: DataTypes.STRING,
      defaultValue: "#EC4899",
    },
    tier: {
      type: DataTypes.ENUM("free", "premium"),
      defaultValue: "free",
    },
    visibility: {
      type: DataTypes.ENUM("public", "private", "floux"),
      defaultValue: "private",
    },
    is_banned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "profiles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// ========================
// Relations Sequelize
// ========================
User.hasOne(Profile, { foreignKey: "user_id", as: "profile" });
Profile.belongsTo(User, { foreignKey: "user_id", as: "user" });

