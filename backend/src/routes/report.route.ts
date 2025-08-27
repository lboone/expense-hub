import { Router } from "express";
import {
  generateReportController,
  getAllReportsController,
  getMyReportSettingController,
  updateReportSettingController,
} from "../controllers/report.controller";

const reportRoutes = Router();

reportRoutes.put("/update-setting", updateReportSettingController);
reportRoutes.get("/my-setting", getMyReportSettingController);
reportRoutes.get("/", getAllReportsController);
reportRoutes.get("/generate-report", generateReportController);

export default reportRoutes;
