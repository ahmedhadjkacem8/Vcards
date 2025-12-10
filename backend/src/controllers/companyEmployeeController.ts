import { Request, Response } from "express";
import { CompanyEmployee } from "../models/CompanyEmployee";
import { User, Profile } from "../models";
import sequelize from "../config/db";

export const addEmployee = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { companyId } = req.params;
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // The beforeCreate hook on the User model will hash the password
    const newUser = await User.create(
      {
        email,
        password,
        role: "user",
      },
      { transaction: t }
    );

    const newProfile = await Profile.create(
      {
        user_id: newUser.id,
        display_name: email.split("@")[0], // Use email prefix as display name
        tier: "premium",
      },
      { transaction: t }
    );

    const newEmployee = await CompanyEmployee.create(
      {
        company_id: companyId,
        user_id: newUser.id,
        email: newUser.email,
        role: "member",
        is_active: true,
        profile_id: newProfile.id, // Link the profile
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json(newEmployee);
  } catch (error: any) {
    await t.rollback();
    //console.error("❌ ERROR ADDING EMPLOYEE:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getCompanyEmployees = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const employees = await CompanyEmployee.findAll({
      where: { company_id: companyId },
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const removeEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await CompanyEmployee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employé introuvable" });
    }

    await employee.destroy();
    res.json({ message: "Employé supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await CompanyEmployee.findByPk(id);

    if (!employee) {
      return res.status(404).json({ message: "Employé introuvable" });
    }

    await employee.update(req.body);
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

