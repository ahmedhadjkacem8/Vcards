// import { Request, Response } from "express";
// import { CompanyInvitation } from "../models/CompanyInvitation";
// import crypto from "crypto";
// import { CompanyEmployee } from "../models/CompanyEmployee";

// export const inviteEmployee = async (req: Request, res: Response) => {
//   try {
//     const { companyId } = req.params;
//     const user = (req as any).user;
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email requis" });
//     }

//     const token = crypto.randomBytes(32).toString("hex");

//     const expiresAt = new Date();
//     expiresAt.setHours(expiresAt.getHours() + 48);

//     const invitation = await CompanyInvitation.create({
//       company_id: companyId,
//       email,
//       token,
//       expires_at: expiresAt,
//       invited_by: user.id,
//     });

//     res.status(201).json(invitation);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// };

// export const acceptInvitation = async (req: Request, res: Response) => {
//   try {
//     const { token } = req.params;
//     const user = (req as any).user;

//     const invitation = await CompanyInvitation.findOne({ where: { token } });

//     if (!invitation) {
//       return res.status(404).json({ message: "Invitation invalide" });
//     }

//     if (new Date() > invitation.expires_at) {
//       return res.status(400).json({ message: "Invitation expirée" });
//     }

//     await invitation.update({ status: "accepted" });

//     await CompanyEmployee.create({
//       company_id: invitation.company_id,
//       user_id: user.id,
//       email: user.email,
//       role: "member",
//       status: "active",
//     });

//     res.json({ message: "Invitation acceptée" });
//   } catch (error) {
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// };
