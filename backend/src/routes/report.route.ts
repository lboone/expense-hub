import { Router } from "express";
import {
  getAllReportsController,
  getMyReportSettingController,
  updateReportSettingController,
} from "../controllers/report.controller";

const reportRoutes = Router();

reportRoutes.put("/update-setting", updateReportSettingController);
reportRoutes.get("/my-setting", getMyReportSettingController);
reportRoutes.get("/", getAllReportsController);

export default reportRoutes;
