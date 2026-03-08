CREATE DATABASE  IF NOT EXISTS `health_center` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `health_center`;
-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: health_center
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `diagnosis`
--

DROP TABLE IF EXISTS `diagnosis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnosis` (
  `diagnosis_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `visit_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `doctor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `complaints` text,
  `diagnosis_name` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`diagnosis_id`),
  KEY `visit_id` (`visit_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `diagnosis_ibfk_161` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `diagnosis_ibfk_162` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnosis`
--

LOCK TABLES `diagnosis` WRITE;
/*!40000 ALTER TABLE `diagnosis` DISABLE KEYS */;
INSERT INTO `diagnosis` VALUES ('6676beb2-3c8b-4f90-9563-47118056ca80','3c285c86-0c9b-4131-a1e5-60f0317d3f99','d1a2b3c4-e92d-11fb-b270-00155d788f7a','headache,body pain,fever,cough','Fever,common cold','Take tablets for 3 days','2026-01-15 04:01:27'),('b6575ddb-8ef9-465d-b7ae-e81ffc93c3b6','4e0eec11-15c0-4601-b0f7-0094fb3b9e8a','d1a2b3c4-e92d-11fb-b270-00155d788f7a','headache,fever,cold','common cold,fever',NULL,'2026-01-29 10:34:18');
/*!40000 ALTER TABLE `diagnosis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor` (
  `doctor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `availability_status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`doctor_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `doctor_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES ('d1a2b3c4-e92d-11fb-b270-00155d788f7a','72c9f4g3-e92d-11fb-b270-00155d788f6c','Dr. John Smith','General Medicine','1234567890','AVAILABLE'),('d2b3c4d5-e92d-11fb-b270-00155d788f7b','73dah5h4-e92d-11fb-b270-00155d788f6d','Dr. Sarah Jones','Pediatrics','0987654321','AVAILABLE');
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dressing_stock`
--

DROP TABLE IF EXISTS `dressing_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dressing_stock` (
  `sub_stock_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `batch_no` varchar(50) NOT NULL,
  `expiry` datetime DEFAULT NULL,
  `quantity` int NOT NULL,
  `status` enum('ACTIVE','EXPIRED') NOT NULL,
  `verification` enum('done','waiting') NOT NULL DEFAULT 'waiting',
  PRIMARY KEY (`sub_stock_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `dressing_stock_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dressing_stock`
--

LOCK TABLES `dressing_stock` WRITE;
/*!40000 ALTER TABLE `dressing_stock` DISABLE KEYS */;
INSERT INTO `dressing_stock` VALUES ('ff6366e5-f9a7-4901-8e93-e985566f36de','f26fde7c-e09d-4a83-b871-25dc29959e68','OINT-001','2027-01-15 00:00:00',19,'ACTIVE','waiting');
/*!40000 ALTER TABLE `dressing_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `family_details`
--

DROP TABLE IF EXISTS `family_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `family_details` (
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `patient_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `relation` varchar(50) NOT NULL,
  `dob` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`family_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `family_details_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `family_details`
--

LOCK TABLES `family_details` WRITE;
/*!40000 ALTER TABLE `family_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `family_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labtech_stock`
--

DROP TABLE IF EXISTS `labtech_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labtech_stock` (
  `sub_stock_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `batch_no` varchar(50) NOT NULL,
  `expiry` datetime DEFAULT NULL,
  `quantity` int NOT NULL,
  `status` enum('ACTIVE','EXPIRED') NOT NULL,
  `verification` enum('done','waiting') NOT NULL DEFAULT 'waiting',
  PRIMARY KEY (`sub_stock_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `labtech_stock_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labtech_stock`
--

LOCK TABLES `labtech_stock` WRITE;
/*!40000 ALTER TABLE `labtech_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `labtech_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests` (
  `lab_test_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `test_name` varchar(150) NOT NULL,
  `test_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`lab_test_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_tests`
--

LOCK TABLES `lab_tests` WRITE;
/*!40000 ALTER TABLE `lab_tests` DISABLE KEYS */;
/* MIT Campus Health Centre Lab Tests - 23 Tests */
INSERT INTO `lab_tests` VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d479','GCT','Bio Chemistry'),
('e8b3f21c-69dd-4283-b678-1f13c3e4e5a0','GIT','Bio Chemistry'),
('d9c4e32d-7aee-4394-c789-2e24d4f5f6b1','FBS - FASTING','Sugar'),
('c0d5f43e-8bff-4405-d890-3f35e5a61c2e','PPBS - POSTPRANDIAL','Sugar'),
('b1e6054f-9c00-4516-e901-4036161a2d3f','UREA','RFT - Renal Function Test'),
('a2f71650-ad11-4627-f012-514727b83e40','CREATININE','RFT - Renal Function Test'),
('93082761-be22-4738-0123-625838c94f51','BILIRUBIN','LFT - Liver Function Test'),
('84193872-cf33-4849-1234-7369494a5062','TOTAL','LFT - Liver Function Test'),
('752a4983-d044-4950-2345-847a5a5b6173','DIRECT','LFT - Liver Function Test'),
('663b5a94-e155-4a61-3456-958b6b6c7284','SGOT','LFT - Liver Function Test'),
('574c6ba5-f266-4b72-4567-a69c7c7d8395','SGPT','LFT - Liver Function Test'),
('485d7cb6-0377-4c83-5678-b7ad8d8e94a6','ALP','LFT - Liver Function Test'),
('396e8dc7-1488-4d94-6789-c8be9e9fa5b7','PROTEIN','LFT - Liver Function Test'),
('2a7f9ed8-2599-4ea5-789a-d9cfafa0b6c8','ALBUMIN','LFT - Liver Function Test'),
('1b80afe9-36aa-4fb6-890b-ead0b0c1c7d9','WIDAL','Serological Test'),
('0c91b0ff-47bb-40c7-901c-fbe1c1d2d8ea','MALARIAL MP/MF','Serological Test'),
('fda2c100-58cc-41d8-a12d-0cf2d2e3e9fb','DENGUE','Serological Test'),
('eeb3d211-69dd-42e9-b23e-1d03e3f4fa0c','BLOOD GROUPING TYPING','Serological Test'),
('dfc4e322-7aee-43fa-c34f-2e14f4a51b1d','CBC - COMPLETE BLOOD COUNT','Haematology'),
('c0d5f433-8bff-4405-d450-3f25056b2c2e','ESR','Haematology'),
('b1e60544-9c00-4516-e561-4036167c3d3f','PERIPHERAL SMEAR','Haematology'),
('a2f71655-ad11-4627-f672-5147278d4e40','STOOL EXAMINATION','Clinical Pathology'),
('93082766-be22-4738-0783-6258389e5f51','URINE COMPLETE EXAMINATION','Clinical Pathology');
/*!40000 ALTER TABLE `lab_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_tasks`
--

DROP TABLE IF EXISTS `lab_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tasks` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `visit_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `lab_test_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `assigned_by_doctor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `result` text DEFAULT NULL,
  `normal_range` varchar(255) DEFAULT NULL,
  `completed_by_user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `priority` varchar(50) DEFAULT 'normal',
  PRIMARY KEY (`id`),
  KEY `idx_lab_tasks_visit_id` (`visit_id`),
  KEY `idx_lab_tasks_lab_test_id` (`lab_test_id`),
  KEY `idx_lab_tasks_assigned_by_doctor_id` (`assigned_by_doctor_id`),
  KEY `idx_lab_tasks_status` (`status`),
  KEY `idx_lab_tasks_completed_by_user_id` (`completed_by_user_id`),
  CONSTRAINT `lab_tasks_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lab_tasks_ibfk_2` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests` (`lab_test_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lab_tasks_ibfk_3` FOREIGN KEY (`assigned_by_doctor_id`) REFERENCES `doctor` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lab_tasks_ibfk_4` FOREIGN KEY (`completed_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_tasks`
--

LOCK TABLES `lab_tasks` WRITE;
/*!40000 ALTER TABLE `lab_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine`
--

DROP TABLE IF EXISTS `medicine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine` (
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('TABLET','SYRUP','OINTMENT','INJECTION','DROPS','EXTERNAL') NOT NULL,
  PRIMARY KEY (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine`
--

LOCK TABLES `medicine` WRITE;
/*!40000 ALTER TABLE `medicine` DISABLE KEYS */;
INSERT INTO `medicine` VALUES ('04bee7aa-a8dd-47a0-aa71-d7f1821d4569','Cough Syrup','SYRUP'),('34c551f0-72e1-413c-8fdf-d8cf44cb647f','Insulin Injection','INJECTION'),('34eaeb91-474a-402b-8b41-3ecc43b55652','Vitamin D Drops','DROPS'),('a1b2c3d4-e5f6-7890-abcd-ef1234567890','Others','EXTERNAL'),('be2bc994-3e3d-4bbe-8df1-822ff3b96473','Paracetamol 500mg','TABLET'),('f26fde7c-e09d-4a83-b871-25dc29959e68','Skin Ointment','OINTMENT'),('fcddd7d8-5fdb-4ff2-8b48-93cb16879097','Ibuprofen 400mg','TABLET');
/*!40000 ALTER TABLE `medicine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine_main_stock`
--

DROP TABLE IF EXISTS `medicine_main_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_main_stock` (
  `main_stock_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `batch_no` varchar(50) NOT NULL,
  `mfd` datetime DEFAULT NULL,
  `expiry` datetime DEFAULT NULL,
  `quantity` int NOT NULL,
  `status` enum('active','expired') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`main_stock_id`),
  UNIQUE KEY `batch_no` (`batch_no`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `medicine_main_stock_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine_main_stock`
--

LOCK TABLES `medicine_main_stock` WRITE;
/*!40000 ALTER TABLE `medicine_main_stock` DISABLE KEYS */;
INSERT INTO `medicine_main_stock` VALUES ('0e6ef1f5-6466-4df5-b830-46ae6da5c060','be2bc994-3e3d-4bbe-8df1-822ff3b96473','PCT-001','2025-01-01 00:00:00','2027-01-01 00:00:00',1000,'active'),('0fb3a075-fe9a-479d-abab-1bedf0abc243','34eaeb91-474a-402b-8b41-3ecc43b55652','VITD-001','2025-04-01 00:00:00','2027-04-01 00:00:00',150,'active'),('751387c4-a1ae-4e22-a4bc-abca72b80a33','be2bc994-3e3d-4bbe-8df1-822ff3b96473','PCT-002','2025-06-01 00:00:00','2027-06-01 00:00:00',500,'active'),('a653a9c4-d49d-43fa-88d4-6dd1bfd3da24','34c551f0-72e1-413c-8fdf-d8cf44cb647f','INS-001','2025-05-01 00:00:00','2026-05-01 00:00:00',400,'active'),('bfe1808b-b7f2-4956-8d6f-4e72091756be','04bee7aa-a8dd-47a0-aa71-d7f1821d4569','COU-001','2025-03-01 00:00:00','2026-03-01 00:00:00',300,'active'),('dee0dd96-a7fb-4eef-8ebd-f4878e267061','fcddd7d8-5fdb-4ff2-8b48-93cb16879097','IBU-001','2025-02-01 00:00:00','2027-02-01 00:00:00',800,'active'),('ff6366e5-f9a7-4901-8e93-e985566f36dc','f26fde7c-e09d-4a83-b871-25dc29959e68','OINT-001','2025-01-15 00:00:00','2027-01-15 00:00:00',200,'active');
/*!40000 ALTER TABLE `medicine_main_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nurse_stock`
--

DROP TABLE IF EXISTS `nurse_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nurse_stock` (
  `sub_stock_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `batch_no` varchar(50) NOT NULL,
  `expiry` datetime DEFAULT NULL,
  `quantity` int NOT NULL,
  `status` enum('ACTIVE','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `verification` enum('done','waiting') NOT NULL DEFAULT 'waiting',
  PRIMARY KEY (`sub_stock_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `nurse_stock_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nurse_stock`
--

LOCK TABLES `nurse_stock` WRITE;
/*!40000 ALTER TABLE `nurse_stock` DISABLE KEYS */;
INSERT INTO `nurse_stock` VALUES ('ff6366e5-f9a7-4901-8e93-e985566f36dd','f26fde7c-e09d-4a83-b871-25dc29959e68','OINT-001','2027-01-15 00:00:00',18,'ACTIVE','waiting');
/*!40000 ALTER TABLE `nurse_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nurse_task`
--

DROP TABLE IF EXISTS `nurse_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nurse_task` (
  `task_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `visit_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `doctor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `task_type_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `instructions` text,
  `status` varchar(50) DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  PRIMARY KEY (`task_id`),
  KEY `visit_id` (`visit_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `task_type_id` (`task_type_id`),
  CONSTRAINT `nurse_task_ibfk_241` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `nurse_task_ibfk_242` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `nurse_task_ibfk_243` FOREIGN KEY (`task_type_id`) REFERENCES `nurse_task_master` (`task_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nurse_task`
--

LOCK TABLES `nurse_task` WRITE;
/*!40000 ALTER TABLE `nurse_task` DISABLE KEYS */;
INSERT INTO `nurse_task` VALUES ('489bd2fd-2df1-4ec0-9207-0fd46608b289','1f899563-0527-45b6-9354-6c67be78a9eb','d1a2b3c4-e92d-11fb-b270-00155d788f7a','e17ef7d4-09a9-4780-a42c-48ae8ce5bc9d','sdfbdb','COMPLETED','2026-02-02 15:30:09'),('4e7a9f59-eaa7-4a70-9b45-419748081f5b','1faebe73-5cb7-40f8-b0f7-f52362cceead','d1a2b3c4-e92d-11fb-b270-00155d788f7a','11b2f70e-f413-462b-bddf-33dac4c9315f','Clean the wound,and teach him how to use it','COMPLETED','2026-02-02 10:43:24'),('62ff7445-c654-4e46-823f-1b4e2e068585','a6de0f73-9150-412f-a3b5-6f0a470aec02','d2b3c4d5-e92d-11fb-b270-00155d788f7b','e2c24532-bc56-4ff7-8ea9-f7f2ded62301','Take the meds','COMPLETED','2026-01-15 04:50:03'),('86fc83d1-ed01-4e37-a606-462d64937bc1','4e0eec11-15c0-4601-b0f7-0094fb3b9e8a','d1a2b3c4-e92d-11fb-b270-00155d788f7a','8dd68d78-4bad-4a56-9e9a-7d4fee8ab622','proper treatment','COMPLETED','2026-01-29 10:37:01'),('9d811f8c-845b-4fec-abe7-0e1c2196b7b3','a494de93-76fd-49b4-bafb-26ca03bc265a','d1a2b3c4-e92d-11fb-b270-00155d788f7a','e2c24532-bc56-4ff7-8ea9-f7f2ded62301','kjvaiudfvia','COMPLETED','2026-02-02 13:43:04'),('b12679d6-7ad7-413d-a8c6-9c8f0044ac46','e46d087a-cf18-4ad4-a15a-22a1a7fb4c1c','d1a2b3c4-e92d-11fb-b270-00155d788f7a','da40ac6d-d272-4488-af81-fdf926dd33a5','Clean the wound,put plaster','COMPLETED','2026-01-16 09:52:23');
/*!40000 ALTER TABLE `nurse_task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nurse_task_master`
--

DROP TABLE IF EXISTS `nurse_task_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nurse_task_master` (
  `task_type_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `task_name` varchar(100) NOT NULL,
  PRIMARY KEY (`task_type_id`),
  UNIQUE KEY `task_name` (`task_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nurse_task_master`
--

LOCK TABLES `nurse_task_master` WRITE;
/*!40000 ALTER TABLE `nurse_task_master` DISABLE KEYS */;
INSERT INTO `nurse_task_master` VALUES ('e2c24532-bc56-4ff7-8ea9-f7f2ded62301','Administer Medication'),('e17ef7d4-09a9-4780-a42c-48ae8ce5bc9d','Blood Sample Collection'),('da40ac6d-d272-4488-af81-fdf926dd33a5','Change Dressing'),('8dd68d78-4bad-4a56-9e9a-7d4fee8ab622','IV Line Management'),('bdf46475-20e3-4dfe-b219-e78c90e2abbd','Monitor Vital Signs'),('11b2f70e-f413-462b-bddf-33dac4c9315f','Patient Education');
/*!40000 ALTER TABLE `nurse_task_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nurse_transaction`
--

DROP TABLE IF EXISTS `nurse_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nurse_transaction` (
  `nurse_txn_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `task_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `performed_by_code` varchar(50) DEFAULT NULL,
  `performed_at` datetime DEFAULT NULL,
  `remarks` text,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`nurse_txn_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `nurse_transaction_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `nurse_task` (`task_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nurse_transaction`
--

LOCK TABLES `nurse_transaction` WRITE;
/*!40000 ALTER TABLE `nurse_transaction` DISABLE KEYS */;
INSERT INTO `nurse_transaction` VALUES ('044dfe3d-4173-493e-95aa-3fbb738903cd','4e7a9f59-eaa7-4a70-9b45-419748081f5b','1234','2026-02-02 10:44:11','All ok','COMPLETED'),('34a1428c-495a-44cc-aa84-8fad2afe8a87','86fc83d1-ed01-4e37-a606-462d64937bc1','1234','2026-01-29 10:39:34','ok ','COMPLETED'),('8ee68179-597b-49ea-b9f1-0d5d45c29381','62ff7445-c654-4e46-823f-1b4e2e068585','1234','2026-01-15 04:50:46','All ok','COMPLETED'),('b3477e5f-c80e-4b94-afb7-b8f6ff9e0878','b12679d6-7ad7-413d-a8c6-9c8f0044ac46','1234','2026-01-16 10:00:12','Experienced pain.','COMPLETED'),('be5c53c5-a286-4b39-ab5c-eafb73cf5bb4','9d811f8c-845b-4fec-abe7-0e1c2196b7b3','1234','2026-02-02 13:44:15','All ok','COMPLETED'),('e9eab8d5-944e-449d-a439-dbe4a19a0dbb','489bd2fd-2df1-4ec0-9207-0fd46608b289','4567','2026-02-02 15:30:38','dfbsdf','COMPLETED');
/*!40000 ALTER TABLE `nurse_transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `patient_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `patient_type` enum('STUDENT','TEMP_STAFF','PERMANENT_STAFF') NOT NULL,
  `allergic_to` text,
  `created_at` datetime NOT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `reg_number` varchar(15) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `year` varchar(20) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES ('46edea98-84ad-4df2-ad90-468f678f33dd','Sara','2004-11-17','MALE','8148408801','STUDENT','None','2026-01-15 03:51:44','B+ve','2022503030','rockyrv584@gmail.com','Computer Science','4',NULL,NULL),('cf343494-93b1-4c4a-8e83-1435418f0b08','Ragavan','2005-11-13','MALE','8667282882','STUDENT','None','2026-01-15 03:45:00','O+ve','2022503010','ragavanr738@gmail.com','Computer Science','3',NULL,NULL),('d76dbf1f-37c7-4456-834d-c5b71e20c6bd','Aswin','2005-03-10','MALE','8220069638','STUDENT','None','2026-02-02 15:27:49','B+ve','2022503506','thunderthorbreaker@gmail.com','Computer Science','4',NULL,NULL),('dcf62a87-3ce8-4d7a-91ea-627fa502ab85','Ragul','2003-10-03','MALE','6374554600','STUDENT','None','2026-01-16 09:45:11','O+ve','2022503001','imagesteganographyyy3@gmail.com','Information Technology','4',NULL,NULL);
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_users`
--

DROP TABLE IF EXISTS `patient_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_users` (
  `patient_user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `patient_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`patient_user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `patient_users_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_users`
--

LOCK TABLES `patient_users` WRITE;
/*!40000 ALTER TABLE `patient_users` DISABLE KEYS */;
INSERT INTO `patient_users` VALUES ('1126ea70-24d5-4c55-96d7-501e4fc6e083','cf343494-93b1-4c4a-8e83-1435418f0b08','ragavanr738@gmail.com','$2b$10$OykdH6MKuwis5tAr7oQvJujXMNmyq7RyJe87SI.v4IhT/hfASifda','ACTIVE','2026-01-15 03:45:00'),('4714fe19-00e1-4d0d-ae0d-765a68e9592b','d76dbf1f-37c7-4456-834d-c5b71e20c6bd','mahaswinganesan@gmail.com','$2b$10$BBLVLXt9eubTLbF46FVx..l25w6KkdJrFHl8yS8i/gAD3y.sADKZi','ACTIVE','2026-02-02 15:27:49'),('bc4084fc-171a-4ca4-a170-c169c3c8e3b2','dcf62a87-3ce8-4d7a-91ea-627fa502ab85','ragulrv@gmail.com','$2b$10$jH01co5Wzmsxr0Jh2Kr/qOuU8IE4Y1n39f1fM5wSKljrxlNeu87s2','ACTIVE','2026-01-16 09:45:11'),('ff76b755-a14f-4eb6-8118-cf7db778174f','46edea98-84ad-4df2-ad90-468f678f33dd','saravanan123@gmail.com','$2b$10$Iee6kJHMogF6d0F1iJgz7OxZMUJdh1g8Oh3kDjkcrKPFxPpOW.yFe','ACTIVE','2026-01-15 03:51:44');
/*!40000 ALTER TABLE `patient_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_stock`
--

DROP TABLE IF EXISTS `pharmacy_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_stock` (
  `sub_stock_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `batch_no` varchar(50) NOT NULL,
  `expiry` datetime DEFAULT NULL,
  `quantity` int NOT NULL,
  `status` enum('ACTIVE','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `verification` enum('done','waiting') NOT NULL DEFAULT 'waiting',
  PRIMARY KEY (`sub_stock_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `pharmacy_stock_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_stock`
--

LOCK TABLES `pharmacy_stock` WRITE;
/*!40000 ALTER TABLE `pharmacy_stock` DISABLE KEYS */;
INSERT INTO `pharmacy_stock` VALUES ('267f3669-c18c-4fc0-8047-fffee4ed0ccc','34eaeb91-474a-402b-8b41-3ecc43b55652','VITD-001','2027-04-01 00:00:00',60,'ACTIVE','waiting'),('29f94956-b3db-419b-932e-8bc96573f19d','fcddd7d8-5fdb-4ff2-8b48-93cb16879097','IBU-001','2027-02-01 00:00:00',200,'ACTIVE','waiting'),('750b37f2-a36b-4791-a1a1-0d1fb0d578c7','be2bc994-3e3d-4bbe-8df1-822ff3b96473','PCT-001','2027-01-01 00:00:00',288,'ACTIVE','waiting'),('b413fb18-b545-4a32-8008-12b6e1e53350','f26fde7c-e09d-4a83-b871-25dc29959e68','OINT-001','2027-01-15 00:00:00',78,'ACTIVE','waiting'),('cfc86987-6b62-4ec1-a943-ab0fc26c2a5d','34c551f0-72e1-413c-8fdf-d8cf44cb647f','INS-001','2026-05-01 00:00:00',150,'ACTIVE','waiting'),('e41b5a17-6a0d-4fab-b2b4-329c4513d8f3','04bee7aa-a8dd-47a0-aa71-d7f1821d4569','COU-001','2026-03-01 00:00:00',120,'ACTIVE','waiting');
/*!40000 ALTER TABLE `pharmacy_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription` (
  `prescription_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `visit_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `doctor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `status` enum('active','issued') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`prescription_id`),
  KEY `visit_id` (`visit_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `prescription_ibfk_151` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prescription_ibfk_152` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
INSERT INTO `prescription` VALUES ('0b37e1a1-d827-410e-8dc4-f84893da3b89','a494de93-76fd-49b4-bafb-26ca03bc265a','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-02-02 13:43:04','2026-02-02 13:43:04','issued'),('1b05e15f-09dc-4ffc-94a9-f905b486b5c0','e46d087a-cf18-4ad4-a15a-22a1a7fb4c1c','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-16 09:52:23','2026-01-16 09:52:23','issued'),('1f88e09e-087c-4d42-98cd-38838b381a12','4e0eec11-15c0-4601-b0f7-0094fb3b9e8a','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-29 10:37:01','2026-01-29 10:37:01','active'),('57781356-abd1-43bd-ab6e-a5a533600228','3c285c86-0c9b-4131-a1e5-60f0317d3f99','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-15 04:08:48','2026-01-15 04:08:48','active'),('7b6166ce-3c84-42cf-a859-a4a071e7c6be','a6de0f73-9150-412f-a3b5-6f0a470aec02','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-15 04:50:03','2026-01-15 04:50:03','issued'),('986315f1-4636-434b-a192-a21346204a1c','1faebe73-5cb7-40f8-b0f7-f52362cceead','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-02-02 10:43:24','2026-02-02 10:43:24','issued'),('9fcfaa96-15d8-4035-a997-3dc834fe6ec0','1f899563-0527-45b6-9354-6c67be78a9eb','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-02-02 15:30:09','2026-02-02 15:30:09','issued');
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `item_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `prescription_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `dosage_per_day` int NOT NULL,
  `duration_days` int NOT NULL,
  `quantity` int NOT NULL,
  `is_external` tinyint(1) NOT NULL,
  `external_notes` text,
  `food_timing` enum('BEFORE','AFTER','WITH','EMPTY_STOMACH') DEFAULT NULL,
  `morning` tinyint(1) DEFAULT NULL,
  `afternoon` tinyint(1) DEFAULT NULL,
  `night` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `prescription_items_ibfk_151` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`prescription_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prescription_items_ibfk_152` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
INSERT INTO `prescription_items` VALUES ('0e6308f1-7894-4071-ab82-b11ef5e3ba78','1f88e09e-087c-4d42-98cd-38838b381a12','a1b2c3d4-e5f6-7890-abcd-ef1234567890',1,2,0,1,'ABC','AFTER',1,0,0),('18a48446-4394-420e-b7e9-3eb9c41188b8','1b05e15f-09dc-4ffc-94a9-f905b486b5c0','f26fde7c-e09d-4a83-b871-25dc29959e68',1,3,3,0,NULL,'BEFORE',0,0,1),('47dc2e8b-65eb-4e81-87ac-d09f3654fb45','57781356-abd1-43bd-ab6e-a5a533600228','a1b2c3d4-e5f6-7890-abcd-ef1234567890',2,3,0,1,'Paracetamol','AFTER',1,0,1),('4e083ace-abdc-415d-9228-c8b4ebc4b17e','7b6166ce-3c84-42cf-a859-a4a071e7c6be','be2bc994-3e3d-4bbe-8df1-822ff3b96473',2,2,4,0,NULL,'AFTER',1,0,1),('4f7bfd18-bf2d-4062-8fa0-a01b4aeb017d','986315f1-4636-434b-a192-a21346204a1c','f26fde7c-e09d-4a83-b871-25dc29959e68',1,1,1,0,NULL,'AFTER',0,0,1),('b9be7bc3-bfa6-4e92-bd2d-9e02a83d5183','9fcfaa96-15d8-4035-a997-3dc834fe6ec0','be2bc994-3e3d-4bbe-8df1-822ff3b96473',2,2,4,0,NULL,'AFTER',1,0,1),('eaa522f7-fda1-4d3e-96f1-506bfc07c78f','0b37e1a1-d827-410e-8dc4-f84893da3b89','be2bc994-3e3d-4bbe-8df1-822ff3b96473',2,2,4,0,NULL,'AFTER',1,0,1);
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_transaction`
--

DROP TABLE IF EXISTS `prescription_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_transaction` (
  `txn_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `prescription_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `issued_by_code` varchar(50) DEFAULT NULL,
  `issued_at` datetime DEFAULT NULL,
  `issued_days` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`txn_id`),
  KEY `prescription_id` (`prescription_id`),
  CONSTRAINT `prescription_transaction_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`prescription_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_transaction`
--

LOCK TABLES `prescription_transaction` WRITE;
/*!40000 ALTER TABLE `prescription_transaction` DISABLE KEYS */;
INSERT INTO `prescription_transaction` VALUES ('11a09ba9-001e-11f1-a968-00e04c553908','9fcfaa96-15d8-4035-a997-3dc834fe6ec0','7890','2026-02-02 15:30:56',2),('5e165d9b-0010-11f1-a968-00e04c553908','1b05e15f-09dc-4ffc-94a9-f905b486b5c0','7890','2026-02-02 13:52:52',1),('8b21f651-000d-11f1-a968-00e04c553908','7b6166ce-3c84-42cf-a859-a4a071e7c6be','7890','2026-02-02 13:32:39',2),('ad6105bc-001a-11f1-a968-00e04c553908','0b37e1a1-d827-410e-8dc4-f84893da3b89','7890','2026-02-02 15:06:40',2),('cf7bf4b5-000f-11f1-a968-00e04c553908','986315f1-4636-434b-a192-a21346204a1c','7890','2026-02-02 13:48:53',1);
/*!40000 ALTER TABLE `prescription_transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_details`
--

DROP TABLE IF EXISTS `staff_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_details` (
  `staff_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('NURSE_RECEPTIONIST','PHARMACIST','CLERICAL_ASSISTANT') NOT NULL,
  `code` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `code` (`code`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `staff_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_details`
--

LOCK TABLES `staff_details` WRITE;
/*!40000 ALTER TABLE `staff_details` DISABLE KEYS */;
INSERT INTO `staff_details` VALUES ('625d56b3-4288-4679-9fee-3e070fbcf727','P. Sundarammal','NURSE_RECEPTIONIST','1234','9876543210','staff@nursingcollege.edu','ACTIVE','a78db729-e92d-11fb-b270-00155d788f6a'),('7824b522-0146-41b2-957a-d9872b1dd5dc','G.Praba','NURSE_RECEPTIONIST','4567','9876543210','staff@nursingcollege1.edu','ACTIVE','a78db729-e92d-11fb-b270-00155d788f6a'),('bec3cdb4-f6e3-4e92-9c7e-248c4ee38efd','K.Jency','PHARMACIST','7890','9876543120','staff@pharmacy.edu','ACTIVE','b89ec83a-e92d-11fb-b270-00155d788f6b');
/*!40000 ALTER TABLE `staff_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_assignment_log`
--

DROP TABLE IF EXISTS `stock_assignment_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_assignment_log` (
  `log_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `batch_no` varchar(50) NOT NULL,
  `to_stock` enum('PHARMACY','NURSE','DRESSING') NOT NULL,
  `quantity` int NOT NULL,
  `assigned_by_code` varchar(50) DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `stock_assignment_log_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_assignment_log`
--

LOCK TABLES `stock_assignment_log` WRITE;
/*!40000 ALTER TABLE `stock_assignment_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_assignment_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_audit_log`
--

DROP TABLE IF EXISTS `system_audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_audit_log` (
  `log_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `actor_user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `actor_code` varchar(50) DEFAULT NULL,
  `actor_role` varchar(50) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `remarks` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `actor_user_id` (`actor_user_id`),
  CONSTRAINT `system_audit_log_ibfk_1` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_audit_log`
--

LOCK TABLES `system_audit_log` WRITE;
/*!40000 ALTER TABLE `system_audit_log` DISABLE KEYS */;
INSERT INTO `system_audit_log` VALUES ('09df990a-26be-4a70-8a73-427608fcc88a',NULL,'1234','NURSE_RECEPTIONIST','CREATE_VISIT','VISIT','e46d087a-cf18-4ad4-a15a-22a1a7fb4c1c',NULL,'{\"reason\": \"Leg injury\", \"doctor_id\": \"d1a2b3c4-e92d-11fb-b270-00155d788f7a\", \"patient_id\": \"dcf62a87-3ce8-4d7a-91ea-627fa502ab85\", \"visit_type\": \"OPD\"}','Visit created for patient Ragul',NULL,NULL,'2026-01-16 09:45:59'),('119b9560-e256-4f4d-86fe-a0e149c42aa5','72c9f4g3-e92d-11fb-b270-00155d788f6c',NULL,'DOCTOR','CREATE_PRESCRIPTION_WITH_TASKS','PRESCRIPTION','986315f1-4636-434b-a192-a21346204a1c',NULL,'{\"nurse_tasks\": 0, \"regular_medicines\": 1, \"injectable_medicines\": 0}','Prescription with 0 nurse tasks created for visit 1faebe73-5cb7-40f8-b0f7-f52362cceead',NULL,NULL,'2026-02-02 10:43:24'),('1be01057-a1d2-4845-b090-79e775ec2871',NULL,'1234','NURSE_RECEPTIONIST','CREATE_VISIT','VISIT','1f899563-0527-45b6-9354-6c67be78a9eb',NULL,'{\"reason\": \"Fever\", \"doctor_id\": \"d1a2b3c4-e92d-11fb-b270-00155d788f7a\", \"patient_id\": \"d76dbf1f-37c7-4456-834d-c5b71e20c6bd\", \"visit_type\": \"OPD\"}','Visit created for patient Aswin',NULL,NULL,'2026-02-02 15:29:03'),('1d1b1064-6d7b-455e-8a1d-99b55771fc93',NULL,'1234','NURSE_RECEPTIONIST','CREATE_VISIT','VISIT','4e0eec11-15c0-4601-b0f7-0094fb3b9e8a',NULL,'{\"reason\": \"fever\", \"doctor_id\": \"d1a2b3c4-e92d-11fb-b270-00155d788f7a\", \"patient_id\": \"46edea98-84ad-4df2-ad90-468f678f33dd\", \"visit_type\": \"OPD\"}','Visit created for patient Sara',NULL,NULL,'2026-01-29 10:31:07'),('23c6e370-86a8-426e-8ff5-39e3ece718a7','72c9f4g3-e92d-11fb-b270-00155d788f6c',NULL,'DOCTOR','CREATE_PRESCRIPTION_WITH_TASKS','PRESCRIPTION','57781356-abd1-43bd-ab6e-a5a533600228',NULL,'{\"nurse_tasks\": 0, \"regular_medicines\": 1, \"injectable_medicines\": 0}','Prescription with 0 nurse tasks created for visit 3c285c86-0c9b-4131-a1e5-60f0317d3f99',NULL,NULL,'2026-01-15 04:08:48'),('547e24b6-93e7-4a81-be1b-fea4a0b6f012',NULL,'1234','NURSE_RECEPTIONIST','COMPLETE_TASK','NURSE_TASK','62ff7445-c654-4e46-823f-1b4e2e068585',NULL,'{\"observation\": \"All ok\", \"medications_used\": []}','Task completed: Administer Medication',NULL,NULL,'2026-01-15 04:50:46'),('59effb11-22a8-4f2a-9220-64990ed9244e','72c9f4g3-e92d-11fb-b270-00155d788f6c',NULL,'DOCTOR','ADD_MULTIPLE_DIAGNOSES','DIAGNOSIS','b6575ddb-8ef9-465d-b7ae-e81ffc93c3b6',NULL,'{\"count\": 1, \"diagnoses\": [{\"remarks\": null, \"complaints\": \"headache,fever,cold\", \"diagnosis_code\": null, \"diagnosis_name\": \"common cold,fever\"}]}','1 diagnoses added for visit 4e0eec11-15c0-4601-b0f7-0094fb3b9e8a',NULL,NULL,'2026-01-29 10:34:18'),('640b17d9-53f8-4579-9384-6e7855dda977','72c9f4g3-e92d-11fb-b270-00155d788f6c',NULL,'DOCTOR','CREATE_PRESCRIPTION_WITH_TASKS','PRESCRIPTION','1b05e15f-09dc-4ffc-94a9-f905b486b5c0',NULL,'{\"nurse_tasks\": 0, \"regular_medicines\": 1, \"injectable_medicines\": 0}','Prescription with 0 nurse tasks created for visit e46d087a-cf18-4ad4-a15a-22a1a7fb4c1c',NULL,NULL,'2026-01-16 09:52:23'),('6be74ac4-5699-446c-9ec1-36879df8e292',NULL,'1234','NURSE_RECEPTIONIST','CREATE_VISIT','VISIT','8118b746-0717-45ea-9393-6ba267717f92',NULL,'{\"reason\": \"Cold\", \"doctor_id\": \"d1a2b3c4-e92d-11fb-b270-00155d788f7a\", \"patient_id\": \"46edea98-84ad-4df2-ad90-468f678f33dd\", \"visit_type\": \"OPD\"}','Visit created for patient Sara',NULL,NULL,'2026-02-03 23:33:47'),('93be377d-04d1-4411-bd98-0af376482616',NULL,'4567','NURSE_RECEPTIONIST','CREATE_VISIT','VISIT','a494de93-76fd-49b4-bafb-26ca03bc265a',NULL,'{\"reason\": \"cold\", \"doctor_id\": \"d1a2b3c4-e92d-11fb-b270-00155d788f7a\", \"patient_id\": \"cf343494-93b1-4c4a-8e83-1435418f0b08\", \"visit_type\": \"OPD\"}','Visit created for patient Ragavan',NULL,NULL,'2026-02-02 13:34:43'),('96ce24fa-252b-4a7f-bdcf-a17109bacf55',NULL,'4567','NURSE_RECEPTIONIST','CREATE_VISIT','VISIT','2cabbce3-217d-47ef-a81d-3d85a54e936a',NULL,'{\"reason\": \"fever\", \"doctor_id\": \"d1a2b3c4-e92d-11fb-b270-00155d788f7a\", \"patient_id\": \"cf343494-93b1-4c4a-8e83-1435418f0b08\", \"visit_type\": \"OPD\"}','Visit created for patient Ragavan',NULL,NULL,'2026-02-03 23:31:44'),('97b23b8a-a04c-4f76-905b-ab375947b031',NULL,'1234','NURSE_RECEPTIONIST','CREATE_VISIT','VISIT','1faebe73-5cb7-40f8-b0f7-f52362cceead',NULL,'{\"reason\": \"leg pain\", \"doctor_id\": \"d1a2b3c4-e92d-11fb-b270-00155d788f7a\", \"patient_id\": \"dcf62a87-3ce8-4d7a-91ea-627fa502ab85\", \"visit_type\": \"OPD\"}','Visit created for patient Ragul',NULL,NULL,'2026-02-02 10:36:20'),('9f966257-b301-4a01-b889-a1956b282bf4','72c9f4g3-e92d-11fb-b270-00155d788f6c',NULL,'DOCTOR','CREATE_PRESCRIPTION_WITH_TASKS','PRESCRIPTION','9fcfaa96-15d8-4035-a997-3dc834fe6ec0',NULL,'{\"nurse_tasks\": 0, \"regular_medicines\": 1, \"injectable_medicines\": 0}','Prescription with 0 nurse tasks created for visit 1f899563-0527-45b6-9354-6c67be78a9eb',NULL,NULL,'2026-02-02 15:30:09'),('a4d0212b-4d63-40de-b1ff-942468b4d0a1',NULL,'1234','NURSE_RECEPTIONIST','COMPLETE_TASK','NURSE_TASK','9d811f8c-845b-4fec-abe7-0e1c2196b7b3',NULL,'{\"observation\": \"All ok\", \"medications_used\": []}','Task completed: Administer Medication',NULL,NULL,'2026-02-02 13:44:15'),('a950b36e-5658-4722-92b4-56c582bae4aa',NULL,'1234','NURSE_RECEPTIONIST','COMPLETE_TASK','NURSE_TASK','86fc83d1-ed01-4e37-a606-462d64937bc1',NULL,'{\"observation\": \"ok \", \"medications_used\": [{\"batch_no\": \"OINT-001\", \"quantity\": 1, \"medicine_id\": \"f26fde7c-e09d-4a83-b871-25dc29959e68\"}]}','Task completed: IV Line Management',NULL,NULL,'2026-01-29 10:39:34'),('b2f31b61-ed56-42d4-9547-41995ad6bb71',NULL,'1234','NURSE_RECEPTIONIST','COMPLETE_TASK','NURSE_TASK','b12679d6-7ad7-413d-a8c6-9c8f0044ac46',NULL,'{\"observation\": \"Experienced pain.\", \"medications_used\": [{\"batch_no\": \"OINT-001\", \"quantity\": 1, \"medicine_id\": \"f26fde7c-e09d-4a83-b871-25dc29959e68\"}]}','Task completed: Change Dressing',NULL,NULL,'2026-01-16 10:00:12'),('c52a1c48-86e6-4035-8382-4e54e769f1ff',NULL,'1234','NURSE_RECEPTIONIST','REGISTER_PATIENT','PATIENT','d76dbf1f-37c7-4456-834d-c5b71e20c6bd',NULL,'{\"name\": \"Aswin\", \"year\": \"4\", \"department\": \"Computer Science\", \"employeeId\": null, \"designation\": null, \"patient_type\": \"STUDENT\", \"family_members_count\": 0}','Patient registered: Aswin (STUDENT)',NULL,NULL,'2026-02-02 15:27:49'),('c7ee59c5-977e-482e-a1c9-415c7ed01e56',NULL,'4567','NURSE_RECEPTIONIST','COMPLETE_TASK','NURSE_TASK','489bd2fd-2df1-4ec0-9207-0fd46608b289',NULL,'{\"observation\": \"dfbsdf\", \"medications_used\": []}','Task completed: Blood Sample Collection',NULL,NULL,'2026-02-02 15:30:38'),('cca40883-9963-402c-99ee-47c7490f042c',NULL,'1234','NURSE_RECEPTIONIST','REGISTER_PATIENT','PATIENT','dcf62a87-3ce8-4d7a-91ea-627fa502ab85',NULL,'{\"name\": \"Ragul\", \"year\": \"4\", \"department\": \"CT\", \"employeeId\": null, \"designation\": null, \"patient_type\": \"STUDENT\", \"family_members_count\": 0}','Patient registered: Ragul (STUDENT)',NULL,NULL,'2026-01-16 09:45:11'),('d6bff525-a454-45d6-9ebe-46f735c56b96',NULL,'1234','NURSE_RECEPTIONIST','COMPLETE_TASK','NURSE_TASK','4e7a9f59-eaa7-4a70-9b45-419748081f5b',NULL,'{\"observation\": \"All ok\", \"medications_used\": [{\"batch_no\": \"OINT-001\", \"quantity\": 1, \"medicine_id\": \"f26fde7c-e09d-4a83-b871-25dc29959e68\"}]}','Task completed: Patient Education',NULL,NULL,'2026-02-02 10:44:11'),('db997150-abf4-42dc-8231-1d4e79b87b35',NULL,'4567','NURSE_RECEPTIONIST','CREATE_VISIT','VISIT','ffc83cc5-a9d8-40fc-9145-116aa07ac547',NULL,'{\"reason\": \"fever\", \"doctor_id\": \"d1a2b3c4-e92d-11fb-b270-00155d788f7a\", \"patient_id\": \"cf343494-93b1-4c4a-8e83-1435418f0b08\", \"visit_type\": \"OPD\"}','Visit created for patient Ragavan',NULL,NULL,'2026-02-03 23:31:44'),('e836d0f1-09cb-483c-805c-cc0a131e603b','73dah5h4-e92d-11fb-b270-00155d788f6d',NULL,'DOCTOR','CREATE_PRESCRIPTION_WITH_TASKS','PRESCRIPTION','7b6166ce-3c84-42cf-a859-a4a071e7c6be',NULL,'{\"nurse_tasks\": 0, \"regular_medicines\": 1, \"injectable_medicines\": 0}','Prescription with 0 nurse tasks created for visit a6de0f73-9150-412f-a3b5-6f0a470aec02',NULL,NULL,'2026-01-15 04:50:03'),('f6a40415-28e7-4f5d-bb08-50370444dc51','72c9f4g3-e92d-11fb-b270-00155d788f6c',NULL,'DOCTOR','ADD_MULTIPLE_DIAGNOSES','DIAGNOSIS','6676beb2-3c8b-4f90-9563-47118056ca80',NULL,'{\"count\": 1, \"diagnoses\": [{\"remarks\": \"Take tablets for 3 days\", \"complaints\": \"headache,body pain,fever,cough\", \"diagnosis_code\": \"J00\", \"diagnosis_name\": \"Fever,common cold\"}]}','1 diagnoses added for visit 3c285c86-0c9b-4131-a1e5-60f0317d3f99',NULL,NULL,'2026-01-15 04:01:27'),('f79e5470-3287-4b8b-b285-747f5fa44773','72c9f4g3-e92d-11fb-b270-00155d788f6c',NULL,'DOCTOR','CREATE_PRESCRIPTION_WITH_TASKS','PRESCRIPTION','0b37e1a1-d827-410e-8dc4-f84893da3b89',NULL,'{\"nurse_tasks\": 0, \"regular_medicines\": 1, \"injectable_medicines\": 0}','Prescription with 0 nurse tasks created for visit a494de93-76fd-49b4-bafb-26ca03bc265a',NULL,NULL,'2026-02-02 13:43:04'),('f8d31e66-3aea-4362-8bb4-d52228cbc977','72c9f4g3-e92d-11fb-b270-00155d788f6c',NULL,'DOCTOR','CREATE_PRESCRIPTION_WITH_TASKS','PRESCRIPTION','1f88e09e-087c-4d42-98cd-38838b381a12',NULL,'{\"nurse_tasks\": 0, \"regular_medicines\": 1, \"injectable_medicines\": 0}','Prescription with 0 nurse tasks created for visit 4e0eec11-15c0-4601-b0f7-0094fb3b9e8a',NULL,NULL,'2026-01-29 10:37:01');
/*!40000 ALTER TABLE `system_audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(100) NOT NULL,
  `role` enum('ADMIN','DOCTOR','NURSE_RECEPTIONIST','PHARMACIST','CLERICAL_ASSISTANT','LAB_TECHNICIAN') NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_role_specific` tinyint(1) DEFAULT '0' COMMENT 'True for role-specific accounts (NURSE, PHARMACIST), False for user-specific accounts',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('71b8e3f2-e92d-11fb-b270-00155d788f6b','admin','ADMIN','ACTIVE','2026-01-10 10:48:28','$2b$10$XITrgZBpvl9YCXj75RZe2eLFpXrzrSi0oQI1CVtjk6PCZESh1xmem',0),('72c9f4g3-e92d-11fb-b270-00155d788f6c','dr.smith','DOCTOR','ACTIVE','2026-01-10 10:48:28','$2b$10$eXawjAXesnmwOMN4f5lsbeBfWWB9qi9yxiygm7zIL2FEKXkl6CtEK',0),('73dah5h4-e92d-11fb-b270-00155d788f6d','dr.jones','DOCTOR','ACTIVE','2026-01-10 10:48:28','$2b$10$yQ2Kh9ko4DEBZX/nbGi00OljgM0/IMhrK.ggOun1MGxjfg3DtTJ0G',0),('74ebi6i5-e92d-11fb-b270-00155d788f6e','labtech','LAB_TECHNICIAN','ACTIVE','2026-01-10 10:48:28','$2b$10$G/JORbldk5IiLuo9OhqIouCx5m4lVwLu5hn/yHVh4nzcCiMk9EUjq',0),('a78db729-e92d-11fb-b270-00155d788f6a','nurse_receptionist','NURSE_RECEPTIONIST','ACTIVE','2026-01-10 10:48:28','$2b$10$SHLxU.5Qp9Zth1JcH1dDYexYoo01CCTXagYU40dfz23J9Ra6LeZQq',1),('b7991f2f-1776-11f1-b724-0a0027000014','clerical_assistant','CLERICAL_ASSISTANT','ACTIVE',NOW(),'$2a$10$cRgLybGya9hXvfTYafYZQ.rX.PPQe3HBX82bvhufGnbo0KWRriGze',0),('b89ec83a-e92d-11fb-b270-00155d788f6b','pharmacist','PHARMACIST','ACTIVE','2026-01-10 10:48:28','$2b$10$ThoCHDgmcmEtSwqMO2wZ1exB/J2.jph3tqA1eilxt762hl3JErfXy',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit`
--

DROP TABLE IF EXISTS `visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit` (
  `visit_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `patient_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `doctor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `visit_date` datetime DEFAULT NULL,
  `reason` text,
  `status` enum('SCHEDULED','ONGOING','DIAGNOSED','PRESCRIBED','NURSING','PHARMACY','COMPLETED','CANCELLED') NOT NULL,
  `created_by_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `visit_ibfk_165` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visit_ibfk_166` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit`
--

LOCK TABLES `visit` WRITE;
/*!40000 ALTER TABLE `visit` DISABLE KEYS */;
INSERT INTO `visit` VALUES ('1f899563-0527-45b6-9354-6c67be78a9eb','d76dbf1f-37c7-4456-834d-c5b71e20c6bd','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-02-02 15:29:03','Fever','COMPLETED','1234'),('1faebe73-5cb7-40f8-b0f7-f52362cceead','dcf62a87-3ce8-4d7a-91ea-627fa502ab85','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-02-02 10:36:20','leg pain','COMPLETED','1234'),('2cabbce3-217d-47ef-a81d-3d85a54e936a','cf343494-93b1-4c4a-8e83-1435418f0b08','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-02-03 23:31:44','fever','ONGOING','4567'),('3c285c86-0c9b-4131-a1e5-60f0317d3f99','46edea98-84ad-4df2-ad90-468f678f33dd','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-15 03:54:43','Fever','COMPLETED','1234'),('4e0eec11-15c0-4601-b0f7-0094fb3b9e8a','46edea98-84ad-4df2-ad90-468f678f33dd','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-29 10:31:07','fever','COMPLETED','1234'),('8118b746-0717-45ea-9393-6ba267717f92','46edea98-84ad-4df2-ad90-468f678f33dd','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-02-03 23:33:47','Cold','ONGOING','1234'),('a494de93-76fd-49b4-bafb-26ca03bc265a','cf343494-93b1-4c4a-8e83-1435418f0b08','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-02-02 13:34:43','cold','COMPLETED','4567'),('a6de0f73-9150-412f-a3b5-6f0a470aec02','cf343494-93b1-4c4a-8e83-1435418f0b08','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-15 04:09:43','Fever','COMPLETED','1234'),('e46d087a-cf18-4ad4-a15a-22a1a7fb4c1c','dcf62a87-3ce8-4d7a-91ea-627fa502ab85','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-16 09:45:59','Leg injury','COMPLETED','1234');
/*!40000 ALTER TABLE `visit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vitals`
--

DROP TABLE IF EXISTS `vitals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vitals` (
  `vitals_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `visit_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `temperature` float NOT NULL,
  `bp_systolic` int DEFAULT NULL,
  `bp_diastolic` int DEFAULT NULL,
  `heart_rate` int NOT NULL,
  `cbg` varchar(20) NOT NULL,
  `spo2` float NOT NULL,
  `recorded_by_code` varchar(50) DEFAULT NULL,
  `recorded_at` datetime DEFAULT NULL,
  PRIMARY KEY (`vitals_id`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `vitals_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vitals`
--

LOCK TABLES `vitals` WRITE;
/*!40000 ALTER TABLE `vitals` DISABLE KEYS */;
INSERT INTO `vitals` VALUES ('107c70f2-6352-4867-9685-3601ca69aa50','1faebe73-5cb7-40f8-b0f7-f52362cceead',98.6,125,90,75,'100',99,NULL,'2026-02-02 10:36:20'),('57d3c29d-90b6-43b1-bc6a-b15e3c0b5d78','8118b746-0717-45ea-9393-6ba267717f92',99.5,120,90,72,'100',99,NULL,'2026-02-03 23:33:47'),('6938b2cf-017c-4e61-a7fc-247f989b7049','2cabbce3-217d-47ef-a81d-3d85a54e936a',99.6,125,95,73,'100',98,NULL,'2026-02-03 23:31:44'),('6a08d6a9-107d-4735-8083-28054a231c13','e46d087a-cf18-4ad4-a15a-22a1a7fb4c1c',98.7,120,80,73,'101',99,NULL,'2026-01-16 09:45:59'),('77937177-f6e7-4d3f-bcc8-4a305cb8e4fe','a6de0f73-9150-412f-a3b5-6f0a470aec02',98.7,125,80,73,'100',99,NULL,'2026-01-15 04:09:43'),('97191abf-1c76-4be1-93f3-c64777aa60e9','1f899563-0527-45b6-9354-6c67be78a9eb',99.6,125,90,73,'100',99,NULL,'2026-02-02 15:29:03'),('9e938412-a3fd-4cf9-aa1b-c966bc72ac65','a494de93-76fd-49b4-bafb-26ca03bc265a',99.6,125,90,74,'100',99,NULL,'2026-02-02 13:34:43'),('bff81d54-289b-49d6-8aec-5895817cebba','4e0eec11-15c0-4601-b0f7-0094fb3b9e8a',98.6,120,75,72,'99',99,NULL,'2026-01-29 10:31:07'),('ec2abf51-1888-46c0-b4f6-2215be93f969','3c285c86-0c9b-4131-a1e5-60f0317d3f99',97.8,130,90,73,'102',100,NULL,'2026-01-15 03:54:43');
/*!40000 ALTER TABLE `vitals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'health_center'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-27 19:06:56
