import { Request, Response, NextFunction } from "express";
import { CompanyEmployee } from "../models/CompanyEmployee";

export const requireCompanyRole = (roles: ("owner" | "admin" | "member")[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const companyId = req.params.companyId;

      const employee = await CompanyEmployee.findOne({
        where: {
          company_id: companyId,
          user_id: user.id,
          is_active: true,
        },
      });

      if (!employee || !roles.includes(employee.role)) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Erreur authorization" });
    }
  };
};
