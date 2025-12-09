import sequelize from "../config/db";
import { User } from "./user";
import { Profile } from "./profile";
import { ProfileEmail } from "./profileEmail";
import { ProfilePhone } from "./profilePhone";
import { ProfileAddress } from "./profileAddress";
import { SocialPlatform } from "./socialPlatform";
import { ProfileSocialLink } from "./profileSocialLink";
import { ProfileFavorite } from "./profileFavorite";
import { ProfileGallery } from "./profileGallery";
import { Company } from "./Company";
import { CompanyEmployee } from "./CompanyEmployee";
import { QrStyle } from "./QrStyle";
// Relations already defined in individual models

export {
  sequelize,
  User,
  Profile,
  ProfileEmail,
  ProfilePhone,
  ProfileAddress,
  SocialPlatform,
  ProfileSocialLink,
  ProfileFavorite,
  ProfileGallery,
  Company,
  CompanyEmployee,
  QrStyle,
};
