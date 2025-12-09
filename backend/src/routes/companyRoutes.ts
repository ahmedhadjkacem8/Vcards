import { Router } from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getMyCompanies,
  updateCompany,
  deleteCompany,
} from "../controllers/companyController";

import {
  addEmployee,
  getCompanyEmployees,
  removeEmployee,
  updateEmployee,
} from "../controllers/companyEmployeeController";

import { authenticate } from "../middlewares/authMiddleware";
import { requireCompanyRole } from "../middlewares/companyRoleMiddleware";
const router = Router();

router.use(authenticate);
router.get("/", getAllCompanies); // Company
router.post("/", createCompany);
router.get("/me", getMyCompanies);
router.get("/:id", getCompanyById);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

// Employees
router.post(
  "/:companyId/employees",
  requireCompanyRole(["owner", "admin"]),
  addEmployee
);
router.get(
  "/:companyId/employees",
  getCompanyEmployees
);

router.put(
  "/:companyId/employees/:id",
  requireCompanyRole(["owner", "admin"]),
  updateEmployee
);

router.delete(
  "/:companyId/employees/:id",
  requireCompanyRole(["owner"]),
  removeEmployee
);

export default router;
