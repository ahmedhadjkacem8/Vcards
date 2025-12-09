import { Request, Response } from "express";
import { Company } from "../models/Company";
import { CompanyEmployee } from "../models/CompanyEmployee";
import { randomUUID } from "crypto";
import { Profile } from "../models/profile";



export const createCompany = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, description, website } = req.body;
    const profile = await Profile.findOne({ where: { user_id: user.id } });

    // ✅ Vérifie que l'utilisateur est un compte société
    if (!user || user.role !== "company") {
      return res.status(403).json({
        message: "Accès refusé : seul un compte société peut créer une entreprise",
      });
    }

    // ✅ Vérifie que le nom est fourni
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nom requis" });
    }

    // Création de la société
    const company = await Company.create({
      id: randomUUID(),
      name: name.trim(),
      description: description?.trim() || null,
      website: website?.trim() || null,
      created_by: user.id,
    });

    console.log("Company created:", company.get({ plain: true }));

    // Création de l'employé (créateur = owner)
    const employeeData = {
      id: randomUUID(),
      company_id: company.id,
      profile_id: profile?.id || null,
      user_id: user.id,
      email: user.email,
      role: "owner" as const,
      is_active: true,
    };

    console.log("Creating CompanyEmployee:", employeeData);

    const employee = await CompanyEmployee.create(employeeData);

    return res.status(201).json({ company, employee });
  } catch (error: unknown) {
    // Gestion des erreurs
    let message = "Erreur serveur";
    if (error instanceof Error) {
      message = error.message;
      console.error("CREATE COMPANY ERROR:", error.message);
    } else {
      console.error("CREATE COMPANY ERROR:", error);
    }

    res.status(500).json({ message, error: String(error) });
  }
};
export const getMyCompanies = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const employeeLinks = await CompanyEmployee.findAll({
      where: { user_id: user.id },
    });

    const companyIds = employeeLinks.map((e) => e.company_id);

    if (companyIds.length === 0) {
      return res.json([]);
    }

    const companies = await Company.findAll({
      where: { id: companyIds },
    });

    res.json(companies);
  } catch (error) {
    console.error("getMyCompanies error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    console.log("User role:", user.role);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const companies = await Company.findAll({
      order: [["created_at", "DESC"]],
    });

    res.json(companies);
  } catch (error) {
    console.error("getAllCompanies error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: "Société introuvable" });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};



export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: "Société introuvable" });
    }
    if (user.role !== "admin" && company.created_by !== user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    await company.destroy();
    res.json({ message: "Société supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export const updateCompany = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { name, description, website } = req.body;
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: "Société introuvable" });
    }
    if (user.role !== "admin" && company.created_by !== user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    company.name = name || company.name;
    company.description = description || company.description;
    company.website = website || company.website;
    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};