// import { DataTypes, Model } from "sequelize";
// import sequelize from "../config/db";
// import { Company } from "./Company";
// import { User } from "./user";

// export class CompanyInvitation extends Model {
//   public id!: string;
//   public company_id!: string;
//   public email!: string;
//   public token!: string;
//   public expires_at!: Date;
//   public invited_by!: string;
//   public status!: "pending" | "accepted" | "expired";
// }

// CompanyInvitation.init(
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     company_id: {
//       type: DataTypes.UUID,
//       allowNull: false,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     token: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     expires_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     invited_by: {
//       type: DataTypes.UUID,
//       allowNull: false,
//     },
//     status: {
//       type: DataTypes.ENUM("pending", "accepted", "expired"),
//       defaultValue: "pending",
//     },
//   },
//   {
//     sequelize,
//     tableName: "company_invitations",
//     timestamps: true,
//   }
// );

// /* ==================== Relations ==================== */

// CompanyInvitation.belongsTo(Company, { foreignKey: "company_id" });
// Company.hasMany(CompanyInvitation, {
//   foreignKey: "company_id",
//   as: "invitations",
// });

// CompanyInvitation.belongsTo(User, {
//   foreignKey: "invited_by",
//   as: "inviter",
// });
