import { Router } from "express";
import { addAddress, getAddresses, updateAddress, deleteAddress } from "../controllers/profileAddressController";

const router = Router();


router.get("/:profile_id", getAddresses);
router.post("/", addAddress);

// RESTful PATCH/DELETE for addresses by id
router.patch("/:id", updateAddress);
router.delete("/:id", deleteAddress);



export default router;
