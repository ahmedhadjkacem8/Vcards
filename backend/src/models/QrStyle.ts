import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import { Profile } from "./profile"; // Assuming Profile model exists

interface QrStyleAttributes {
  id: string;
  profile_id: string;
  name: string;
  options: object; // JSON type
}

interface QrStyleCreationAttributes extends Optional<QrStyleAttributes, "id"> {}

export class QrStyle
  extends Model<QrStyleAttributes, QrStyleCreationAttributes>
  implements QrStyleAttributes {
  public id!: string;
  public profile_id!: string;
  public name!: string;
  public options!: object;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

QrStyle.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Profile,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON, // Use JSONB for PostgreSQL, JSON for others
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: "qr_styles",
    timestamps: true,
  }
);

// Association
QrStyle.belongsTo(Profile, { foreignKey: "profile_id", as: "profile" });
Profile.hasMany(QrStyle, { foreignKey: "profile_id", as: "qrStyles" });
