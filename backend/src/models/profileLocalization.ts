import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import { Profile } from './profile';

interface ProfileLocalizationAttributes {
  id: string;
  profile_id: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  is_primary: boolean;
  maps_link?: string | null;
}

interface ProfileLocalizationCreationAttributes extends Optional<ProfileLocalizationAttributes, 'id' | 'is_primary' | 'maps_link' | 'latitude' | 'longitude'> {}

class ProfileLocalization extends Model<ProfileLocalizationAttributes, ProfileLocalizationCreationAttributes> implements ProfileLocalizationAttributes {
  public id!: string;
  public profile_id!: string;
  public address!: string;
  public latitude?: number | null;
  public longitude?: number | null;
  public is_primary!: boolean;
  public maps_link?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProfileLocalization.init(
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
        model: 'profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    maps_link: {
      type: DataTypes.STRING(512),
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: 'profile_localizations',
    timestamps: true,
  }
);

Profile.hasMany(ProfileLocalization, { foreignKey: 'profile_id', as: 'localizations' });
ProfileLocalization.belongsTo(Profile, { foreignKey: 'profile_id', as: 'profile' });

export default ProfileLocalization;
