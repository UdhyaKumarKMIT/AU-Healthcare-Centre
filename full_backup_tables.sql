-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: au_hc
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
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
  CONSTRAINT `diagnosis_ibfk_103` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `diagnosis_ibfk_104` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnosis`
--

LOCK TABLES `diagnosis` WRITE;
/*!40000 ALTER TABLE `diagnosis` DISABLE KEYS */;
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
INSERT INTO `dressing_stock` VALUES ('1d555ae3-f3c7-11f0-993a-9165452c0bb3','c311e72a-ef07-11f0-9eae-00155d7f9d8b','DFG-B002','2027-04-10 00:00:00',180,'ACTIVE'),('aebe840d-f461-11f0-993a-9165452c0bb3','c310c4d7-ef07-11f0-9eae-00155d7f9d8b','PCM-B002','2027-02-01 00:00:00',100,'ACTIVE'),('d23b1096-f3c5-11f0-993a-9165452c0bb3','c311e45a-ef07-11f0-9eae-00155d7f9d8b','INS-B002','2026-03-01 00:00:00',80,'ACTIVE'),('d23c1cea-f3c5-11f0-993a-9165452c0bb3','c311e45a-ef07-11f0-9eae-00155d7f9d8b','INS-101','2026-12-31 00:00:00',20,'ACTIVE'),('eb55a02f-f3bd-11f0-993a-9165452c0bb3','c310c4d7-ef07-11f0-9eae-00155d7f9d8b','PCM-B001','2027-01-01 00:00:00',495,'ACTIVE');
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
INSERT INTO `labtech_stock` VALUES ('15680253-f3c9-11f0-993a-9165452c0bb3','c311eacf-ef07-11f0-9eae-00155d7f9d8b','ORS-B002','2026-11-20 00:00:00',100,'ACTIVE'),('23e95357-f3c5-11f0-993a-9165452c0bb3','c311df38-ef07-11f0-9eae-00155d7f9d8b','VD-B001','2027-02-01 00:00:00',180,'ACTIVE'),('2bf321b4-f3c7-11f0-993a-9165452c0bb3','c311ec75-ef07-11f0-9eae-00155d7f9d8b','EDC-B002','2026-04-01 00:00:00',60,'ACTIVE'),('6f15b30f-f46d-11f0-993a-9165452c0bb3','c310c4d7-ef07-11f0-9eae-00155d7f9d8b','PCM-B002','2027-02-01 00:00:00',50,'ACTIVE'),('a2a96bb8-f3c5-11f0-993a-9165452c0bb3','c311dd6f-ef07-11f0-9eae-00155d7f9d8b','CSY-B001','2026-06-30 00:00:00',150,'ACTIVE'),('a2aa8f70-f3c5-11f0-993a-9165452c0bb3','c311dd6f-ef07-11f0-9eae-00155d7f9d8b','CSY-B002','2026-09-30 00:00:00',20,'ACTIVE'),('c914e199-f460-11f0-993a-9165452c0bb3','c311ec75-ef07-11f0-9eae-00155d7f9d8b','EDC-101','2030-12-31 00:00:00',75,'ACTIVE'),('ee037484-f460-11f0-993a-9165452c0bb3','c311df38-ef07-11f0-9eae-00155d7f9d8b','VD-B002','2027-05-01 00:00:00',80,'ACTIVE');
/*!40000 ALTER TABLE `labtech_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `main_medicine_log`
--

DROP TABLE IF EXISTS `main_medicine_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `main_medicine_log` (
  `batch_no` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `main_stock_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expiry` date NOT NULL,
  `quantity` int NOT NULL,
  `cleared_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `medicine_log_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `main_medicine_log`
--

LOCK TABLES `main_medicine_log` WRITE;
/*!40000 ALTER TABLE `main_medicine_log` DISABLE KEYS */;
INSERT INTO `main_medicine_log` VALUES ('INS-B001','c311e45a-ef07-11f0-9eae-00155d7f9d8b','0b399b8c-efc5-11f0-9eae-00155d7f9d8b','2026-01-01',90,'2026-01-13 07:44:42'),('AMX-B001','c311d4a8-ef07-11f0-9eae-00155d7f9d8b','0b3962ac-efc5-11f0-9eae-00155d7f9d8b','2026-12-31',400,'2026-01-15 11:41:07'),('EDC-B001','c311ec75-ef07-11f0-9eae-00155d7f9d8b','0b39b09b-efc5-11f0-9eae-00155d7f9d8b','2026-01-01',140,'2026-01-17 17:09:55'),('AZT-B001','c311e8cd-ef07-11f0-9eae-00155d7f9d8b','dfc82b40-f45d-11f0-993a-9165452c0bb3','2027-12-31',100,'2026-01-18 12:00:12'),('MTF-001','fe43e857-4023-4bec-b7e6-0289aae4b16d','98dea0bd-f04e-11f0-9eae-00155d7f9d8b','2026-02-13',20,'2026-01-18 12:02:41');
/*!40000 ALTER TABLE `main_medicine_log` ENABLE KEYS */;
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
  `type` enum('TABLET','SYRUP','OINTMENT','INJECTION','DROPS') NOT NULL,
  PRIMARY KEY (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine`
--

LOCK TABLES `medicine` WRITE;
/*!40000 ALTER TABLE `medicine` DISABLE KEYS */;
INSERT INTO `medicine` VALUES ('c310c4d7-ef07-11f0-9eae-00155d7f9d8b','Paracetamol','TABLET'),('c311d4a8-ef07-11f0-9eae-00155d7f9d8b','Amoxicillin','TABLET'),('c311db49-ef07-11f0-9eae-00155d7f9d8b','Cetirizine','TABLET'),('c311dd6f-ef07-11f0-9eae-00155d7f9d8b','Cough Syrup DX','SYRUP'),('c311df38-ef07-11f0-9eae-00155d7f9d8b','Vitamin D Drops','DROPS'),('c311e45a-ef07-11f0-9eae-00155d7f9d8b','Insulin','INJECTION'),('c311e72a-ef07-11f0-9eae-00155d7f9d8b','Diclofenac Gel','OINTMENT'),('c311e8cd-ef07-11f0-9eae-00155d7f9d8b','Azithromycin','TABLET'),('c311eacf-ef07-11f0-9eae-00155d7f9d8b','ORS Solution','SYRUP'),('c311ec75-ef07-11f0-9eae-00155d7f9d8b','Eye Drops Ciprofloxacin','DROPS'),('d42a377f-86eb-4eff-87ba-d81e114544eb','Omeprazole','TABLET'),('fe43e857-4023-4bec-b7e6-0289aae4b16d','Metformin','DROPS');
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
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `medicine_main_stock_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine_main_stock`
--

LOCK TABLES `medicine_main_stock` WRITE;
/*!40000 ALTER TABLE `medicine_main_stock` DISABLE KEYS */;
INSERT INTO `medicine_main_stock` VALUES ('06357c37-f438-11f0-993a-9165452c0bb3','fe43e857-4023-4bec-b7e6-0289aae4b16d','MTF-B003','2026-01-18 12:06:30','2027-12-31 00:00:00',200,'active'),('0b395b45-efc5-11f0-9eae-00155d7f9d8b','c310c4d7-ef07-11f0-9eae-00155d7f9d8b','PCM-B002','2025-02-01 00:00:00','2027-02-01 00:00:00',50,'active'),('0b397b52-efc5-11f0-9eae-00155d7f9d8b','c311dd6f-ef07-11f0-9eae-00155d7f9d8b','CSY-B002','2025-04-01 00:00:00','2026-09-30 00:00:00',100,'active'),('0b3997f9-efc5-11f0-9eae-00155d7f9d8b','c311df38-ef07-11f0-9eae-00155d7f9d8b','VD-B002','2025-05-01 00:00:00','2027-05-01 00:00:00',80,'active'),('0b39a997-efc5-11f0-9eae-00155d7f9d8b','c311e8cd-ef07-11f0-9eae-00155d7f9d8b','AZM-B002','2025-06-01 00:00:00','2027-06-01 00:00:00',110,'active'),('0b39ae74-efc5-11f0-9eae-00155d7f9d8b','c311eacf-ef07-11f0-9eae-00155d7f9d8b','ORS-B002','2025-05-20 00:00:00','2026-11-20 00:00:00',50,'active'),('6905fc5f-f45d-11f0-993a-9165452c0bb3','c311d4a8-ef07-11f0-9eae-00155d7f9d8b','AMX-B002','2026-01-18 16:34:07','2028-12-31 00:00:00',50,'active'),('736ac007-f441-11f0-993a-9165452c0bb3','c311df38-ef07-11f0-9eae-00155d7f9d8b','VDD-B002','2026-01-18 13:13:59','2028-12-31 00:00:00',200,'active'),('853af6ca-f45d-11f0-993a-9165452c0bb3','c311e45a-ef07-11f0-9eae-00155d7f9d8b','INS-B001','2026-01-18 16:34:55','2027-12-31 00:00:00',100,'active'),('bba93074-f43e-11f0-993a-9165452c0bb3','c311db49-ef07-11f0-9eae-00155d7f9d8b','CTZ-B001','2026-01-18 12:54:32','2027-12-31 00:00:00',100,'active'),('cac9014a-f437-11f0-993a-9165452c0bb3','c311ec75-ef07-11f0-9eae-00155d7f9d8b','EDC-101','2026-01-18 12:04:51','2030-12-31 00:00:00',25,'active'),('cfbfc2f4-f04b-11f0-9eae-00155d7f9d8b','d42a377f-86eb-4eff-87ba-d81e114544eb','OMP-001','2026-01-13 12:18:04','2027-12-31 00:00:00',100,'expired'),('ebc60d98-f45d-11f0-993a-9165452c0bb3','d42a377f-86eb-4eff-87ba-d81e114544eb','OMP-B001','2026-01-18 16:37:47','2029-12-31 00:00:00',100,'active');
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
  `status` enum('ACTIVE','EXPIRED') NOT NULL,
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
INSERT INTO `nurse_stock` VALUES ('082e7aa6-f3c4-11f0-993a-9165452c0bb3','c310c4d7-ef07-11f0-9eae-00155d7f9d8b','PCM-B001','2027-01-01 00:00:00',5,'ACTIVE'),('10b91b96-f3c9-11f0-993a-9165452c0bb3','c311eacf-ef07-11f0-9eae-00155d7f9d8b','ORS-B001','2026-07-20 00:00:00',300,'ACTIVE'),('3f94782d-f3c6-11f0-993a-9165452c0bb3','c311e45a-ef07-11f0-9eae-00155d7f9d8b','INS-101','2026-12-31 00:00:00',15,'ACTIVE'),('4e5a08ad-f463-11f0-993a-9165452c0bb3','c311eacf-ef07-11f0-9eae-00155d7f9d8b','ORS-B002','2026-11-20 00:00:00',100,'ACTIVE'),('63ce37e0-f3c5-11f0-993a-9165452c0bb3','c311e8cd-ef07-11f0-9eae-00155d7f9d8b','AZM-B001','2027-02-01 00:00:00',260,'ACTIVE'),('63cfa825-f3c5-11f0-993a-9165452c0bb3','c311e8cd-ef07-11f0-9eae-00155d7f9d8b','AZM-B002','2027-06-01 00:00:00',100,'ACTIVE'),('ee01856c-f3c5-11f0-993a-9165452c0bb3','c311d4a8-ef07-11f0-9eae-00155d7f9d8b','AMX-B002','2027-03-01 00:00:00',250,'ACTIVE'),('ee02a6aa-f3c5-11f0-993a-9165452c0bb3','c311d4a8-ef07-11f0-9eae-00155d7f9d8b','AM-001','2027-12-31 00:00:00',100,'ACTIVE');
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
  CONSTRAINT `nurse_task_ibfk_154` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `nurse_task_ibfk_155` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `nurse_task_ibfk_156` FOREIGN KEY (`task_type_id`) REFERENCES `nurse_task_master` (`task_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nurse_task`
--

LOCK TABLES `nurse_task` WRITE;
/*!40000 ALTER TABLE `nurse_task` DISABLE KEYS */;
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
  UNIQUE KEY `task_name` (`task_name`),
  UNIQUE KEY `task_name_2` (`task_name`),
  UNIQUE KEY `task_name_3` (`task_name`),
  UNIQUE KEY `task_name_4` (`task_name`),
  UNIQUE KEY `task_name_5` (`task_name`),
  UNIQUE KEY `task_name_6` (`task_name`),
  UNIQUE KEY `task_name_7` (`task_name`),
  UNIQUE KEY `task_name_8` (`task_name`),
  UNIQUE KEY `task_name_9` (`task_name`),
  UNIQUE KEY `task_name_10` (`task_name`),
  UNIQUE KEY `task_name_11` (`task_name`),
  UNIQUE KEY `task_name_12` (`task_name`),
  UNIQUE KEY `task_name_13` (`task_name`),
  UNIQUE KEY `task_name_14` (`task_name`),
  UNIQUE KEY `task_name_15` (`task_name`),
  UNIQUE KEY `task_name_16` (`task_name`),
  UNIQUE KEY `task_name_17` (`task_name`),
  UNIQUE KEY `task_name_18` (`task_name`),
  UNIQUE KEY `task_name_19` (`task_name`),
  UNIQUE KEY `task_name_20` (`task_name`),
  UNIQUE KEY `task_name_21` (`task_name`),
  UNIQUE KEY `task_name_22` (`task_name`),
  UNIQUE KEY `task_name_23` (`task_name`),
  UNIQUE KEY `task_name_24` (`task_name`),
  UNIQUE KEY `task_name_25` (`task_name`),
  UNIQUE KEY `task_name_26` (`task_name`),
  UNIQUE KEY `task_name_27` (`task_name`),
  UNIQUE KEY `task_name_28` (`task_name`),
  UNIQUE KEY `task_name_29` (`task_name`),
  UNIQUE KEY `task_name_30` (`task_name`),
  UNIQUE KEY `task_name_31` (`task_name`),
  UNIQUE KEY `task_name_32` (`task_name`),
  UNIQUE KEY `task_name_33` (`task_name`),
  UNIQUE KEY `task_name_34` (`task_name`),
  UNIQUE KEY `task_name_35` (`task_name`),
  UNIQUE KEY `task_name_36` (`task_name`),
  UNIQUE KEY `task_name_37` (`task_name`),
  UNIQUE KEY `task_name_38` (`task_name`),
  UNIQUE KEY `task_name_39` (`task_name`),
  UNIQUE KEY `task_name_40` (`task_name`),
  UNIQUE KEY `task_name_41` (`task_name`),
  UNIQUE KEY `task_name_42` (`task_name`),
  UNIQUE KEY `task_name_43` (`task_name`),
  UNIQUE KEY `task_name_44` (`task_name`),
  UNIQUE KEY `task_name_45` (`task_name`),
  UNIQUE KEY `task_name_46` (`task_name`),
  UNIQUE KEY `task_name_47` (`task_name`),
  UNIQUE KEY `task_name_48` (`task_name`),
  UNIQUE KEY `task_name_49` (`task_name`),
  UNIQUE KEY `task_name_50` (`task_name`),
  UNIQUE KEY `task_name_51` (`task_name`),
  UNIQUE KEY `task_name_52` (`task_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nurse_task_master`
--

LOCK TABLES `nurse_task_master` WRITE;
/*!40000 ALTER TABLE `nurse_task_master` DISABLE KEYS */;
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
  `email` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `patient_type` enum('STUDENT','TEMP_STAFF','PERMANENT_STAFF') NOT NULL,
  `allergic_to` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES ('4e12f239-ef89-11f0-9eae-00155d7f9d8b','John Doe','john.doe@example.com','1998-05-12','Male','555-1001','STUDENT','Penicillin','2026-01-12 13:05:44'),('4e155a9f-ef89-11f0-9eae-00155d7f9d8b','Jane Smith','jane.smith@example.com','1985-09-23','Female','555-1002','PERMANENT_STAFF','None','2026-01-12 13:05:44'),('4e1588d8-ef89-11f0-9eae-00155d7f9d8b','Michael Brown','michael.brown@example.com','1992-02-10','Male','555-1003','TEMP_STAFF','Peanuts','2026-01-12 13:05:44'),('4e158f7c-ef89-11f0-9eae-00155d7f9d8b','Emily Davis','emily.davis@example.com','2000-11-30','Female','555-1004','STUDENT','Seafood','2026-01-12 13:05:44'),('4e159143-ef89-11f0-9eae-00155d7f9d8b','Daniel Wilson','daniel.wilson@example.com','1979-07-18','Male','555-1005','PERMANENT_STAFF',NULL,'2026-01-12 13:05:44'),('4e15d095-ef89-11f0-9eae-00155d7f9d8b','Sophia Taylor','sophia.taylor@example.com','1995-03-05','Female','555-1006','TEMP_STAFF','Dust','2026-01-12 13:05:44'),('4e15d5b6-ef89-11f0-9eae-00155d7f9d8b','James Anderson','james.anderson@example.com','1988-12-14','Male','555-1007','PERMANENT_STAFF','Latex','2026-01-12 13:05:44'),('4e15d744-ef89-11f0-9eae-00155d7f9d8b','Olivia Martinez','olivia.martinez@example.com','2001-06-21','Female','555-1008','STUDENT',NULL,'2026-01-12 13:05:44'),('4e15d8af-ef89-11f0-9eae-00155d7f9d8b','William Thomas','william.thomas@example.com','1990-01-09','Male','555-1009','TEMP_STAFF','Aspirin','2026-01-12 13:05:44'),('4e15d9e2-ef89-11f0-9eae-00155d7f9d8b','Ava Johnson','ava.johnson@example.com','1997-08-27','Female','555-1010','STUDENT','Pollen','2026-01-12 13:05:44');
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
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `username_16` (`username`),
  UNIQUE KEY `username_17` (`username`),
  UNIQUE KEY `username_18` (`username`),
  UNIQUE KEY `username_19` (`username`),
  UNIQUE KEY `username_20` (`username`),
  UNIQUE KEY `username_21` (`username`),
  UNIQUE KEY `username_22` (`username`),
  UNIQUE KEY `username_23` (`username`),
  UNIQUE KEY `username_24` (`username`),
  UNIQUE KEY `username_25` (`username`),
  UNIQUE KEY `username_26` (`username`),
  UNIQUE KEY `username_27` (`username`),
  UNIQUE KEY `username_28` (`username`),
  UNIQUE KEY `username_29` (`username`),
  UNIQUE KEY `username_30` (`username`),
  UNIQUE KEY `username_31` (`username`),
  UNIQUE KEY `username_32` (`username`),
  UNIQUE KEY `username_33` (`username`),
  UNIQUE KEY `username_34` (`username`),
  UNIQUE KEY `username_35` (`username`),
  UNIQUE KEY `username_36` (`username`),
  UNIQUE KEY `username_37` (`username`),
  UNIQUE KEY `username_38` (`username`),
  UNIQUE KEY `username_39` (`username`),
  UNIQUE KEY `username_40` (`username`),
  UNIQUE KEY `username_41` (`username`),
  UNIQUE KEY `username_42` (`username`),
  UNIQUE KEY `username_43` (`username`),
  UNIQUE KEY `username_44` (`username`),
  UNIQUE KEY `username_45` (`username`),
  UNIQUE KEY `username_46` (`username`),
  UNIQUE KEY `username_47` (`username`),
  UNIQUE KEY `username_48` (`username`),
  UNIQUE KEY `username_49` (`username`),
  UNIQUE KEY `username_50` (`username`),
  UNIQUE KEY `username_51` (`username`),
  UNIQUE KEY `username_52` (`username`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `patient_users_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_users`
--

LOCK TABLES `patient_users` WRITE;
/*!40000 ALTER TABLE `patient_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_expired_medicine_log`
--

DROP TABLE IF EXISTS `pharmacy_expired_medicine_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_expired_medicine_log` (
  `batch_no` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `sub_stock_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expiry` date NOT NULL,
  `quantity` int NOT NULL,
  `cleared_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cleared_by_code` varchar(50) DEFAULT NULL,
  CONSTRAINT `pharmacy_expired_medicine_log_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_expired_medicine_log`
--

LOCK TABLES `pharmacy_expired_medicine_log` WRITE;
/*!40000 ALTER TABLE `pharmacy_expired_medicine_log` DISABLE KEYS */;
INSERT INTO `pharmacy_expired_medicine_log` VALUES ('AMOX-B002','c311d4a8-ef07-11f0-9eae-00155d7f9d8b','002505a6-ef09-11f0-9eae-00155d7f9d8b','2025-12-15',80,'2026-01-12 13:42:19','7890'),('AZI-B008','c311e8cd-ef07-11f0-9eae-00155d7f9d8b','00251383-ef09-11f0-9eae-00155d7f9d8b','2025-07-18',30,'2026-01-12 13:40:34','7890'),('EYE-B010','c311ec75-ef07-11f0-9eae-00155d7f9d8b','00251789-ef09-11f0-9eae-00155d7f9d8b','2025-06-01',25,'2026-01-12 13:36:57','bec3cdb4-f6e3-4e92-9c7e-248c4ee38efd');
/*!40000 ALTER TABLE `pharmacy_expired_medicine_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_stock`
--

DROP TABLE IF EXISTS `pharmacy_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_stock` (
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `batch_no` varchar(50) NOT NULL,
  `expiry` datetime DEFAULT NULL,
  `quantity` int NOT NULL,
  `status` enum('ACTIVE','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `sub_stock_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `pharmacy_stock_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_stock`
--

LOCK TABLES `pharmacy_stock` WRITE;
/*!40000 ALTER TABLE `pharmacy_stock` DISABLE KEYS */;
INSERT INTO `pharmacy_stock` VALUES ('c311e45a-ef07-11f0-9eae-00155d7f9d8b','INS-101','2026-12-31 00:00:00',15,'EXPIRED','cd28f14a-f3c6-11f0-993a-9165452c0bb3'),('c311e72a-ef07-11f0-9eae-00155d7f9d8b','DFG-B001','2027-01-10 00:00:00',220,'ACTIVE','d3803fdb-f3c6-11f0-993a-9165452c0bb3'),('c311ec75-ef07-11f0-9eae-00155d7f9d8b','EDC-B002','2026-04-01 00:00:00',60,'ACTIVE','287a7de5-f3c7-11f0-993a-9165452c0bb3'),('c311d4a8-ef07-11f0-9eae-00155d7f9d8b','AM-001','2027-12-31 00:00:00',100,'ACTIVE','9981528e-f43e-11f0-993a-9165452c0bb3'),('c311d4a8-ef07-11f0-9eae-00155d7f9d8b','AMX-B002','2028-12-31 00:00:00',50,'ACTIVE','63a44a93-f460-11f0-993a-9165452c0bb3'),('c310c4d7-ef07-11f0-9eae-00155d7f9d8b','PCM-B002','2027-02-01 00:00:00',100,'ACTIVE','4c206d2d-f46d-11f0-993a-9165452c0bb3');
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
  CONSTRAINT `prescription_ibfk_121` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prescription_ibfk_122` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
INSERT INTO `prescription` VALUES ('151a97c0-ef8a-11f0-9eae-00155d7f9d8b','9bb3a212-ef89-11f0-9eae-00155d7f9d8b','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-12 13:11:18','2026-01-12 13:11:18','issued'),('151ab191-ef8a-11f0-9eae-00155d7f9d8b','9bb4233d-ef89-11f0-9eae-00155d7f9d8b','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-12 13:11:18','2026-01-12 13:11:18','active'),('151ab46e-ef8a-11f0-9eae-00155d7f9d8b','9bb428a4-ef89-11f0-9eae-00155d7f9d8b','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-12 13:11:18','2026-01-12 13:11:18','issued'),('151ab5b8-ef8a-11f0-9eae-00155d7f9d8b','9bb42b78-ef89-11f0-9eae-00155d7f9d8b','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-12 13:11:18','2026-01-12 13:11:18','active'),('151ab844-ef8a-11f0-9eae-00155d7f9d8b','9bb43087-ef89-11f0-9eae-00155d7f9d8b','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-12 13:11:18','2026-01-12 13:11:18','active'),('151ab977-ef8a-11f0-9eae-00155d7f9d8b','9bb4323b-ef89-11f0-9eae-00155d7f9d8b','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-12 13:11:18','2026-01-12 13:11:18','active'),('151aba9b-ef8a-11f0-9eae-00155d7f9d8b','9bb441ea-ef89-11f0-9eae-00155d7f9d8b','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-12 13:11:18','2026-01-12 13:11:18','active'),('151abc14-ef8a-11f0-9eae-00155d7f9d8b','9bb452ad-ef89-11f0-9eae-00155d7f9d8b','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-12 13:11:18','2026-01-12 13:11:18','active'),('151abfa2-ef8a-11f0-9eae-00155d7f9d8b','9bb463bd-ef89-11f0-9eae-00155d7f9d8b','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-12 13:11:18','2026-01-12 13:11:18','issued');
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
  PRIMARY KEY (`item_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `prescription_items_ibfk_103` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`prescription_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prescription_items_ibfk_104` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
INSERT INTO `prescription_items` VALUES ('4fbcb5eb-ef8a-11f0-9eae-00155d7f9d8b','151a97c0-ef8a-11f0-9eae-00155d7f9d8b','c310c4d7-ef07-11f0-9eae-00155d7f9d8b',2,5,10,0,NULL),('4fbd4ba7-ef8a-11f0-9eae-00155d7f9d8b','151ab191-ef8a-11f0-9eae-00155d7f9d8b','c311d4a8-ef07-11f0-9eae-00155d7f9d8b',1,7,7,0,NULL),('4fbd5008-ef8a-11f0-9eae-00155d7f9d8b','151ab46e-ef8a-11f0-9eae-00155d7f9d8b','c311db49-ef07-11f0-9eae-00155d7f9d8b',1,5,5,0,NULL),('4fbd5865-ef8a-11f0-9eae-00155d7f9d8b','151ab5b8-ef8a-11f0-9eae-00155d7f9d8b','c311dd6f-ef07-11f0-9eae-00155d7f9d8b',10,5,50,0,NULL),('4fbd6103-ef8a-11f0-9eae-00155d7f9d8b','151ab844-ef8a-11f0-9eae-00155d7f9d8b','c311e45a-ef07-11f0-9eae-00155d7f9d8b',1,1,1,0,NULL),('4fbd6309-ef8a-11f0-9eae-00155d7f9d8b','151ab977-ef8a-11f0-9eae-00155d7f9d8b','c311e72a-ef07-11f0-9eae-00155d7f9d8b',2,5,10,0,NULL),('4fbd64df-ef8a-11f0-9eae-00155d7f9d8b','151aba9b-ef8a-11f0-9eae-00155d7f9d8b','c311e8cd-ef07-11f0-9eae-00155d7f9d8b',1,3,3,0,NULL),('4fbd66fe-ef8a-11f0-9eae-00155d7f9d8b','151abc14-ef8a-11f0-9eae-00155d7f9d8b','c311eacf-ef07-11f0-9eae-00155d7f9d8b',15,2,30,1,'External pharmacy'),('4fbd6988-ef8a-11f0-9eae-00155d7f9d8b','151abfa2-ef8a-11f0-9eae-00155d7f9d8b','c310c4d7-ef07-11f0-9eae-00155d7f9d8b',3,7,21,0,NULL);
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
INSERT INTO `prescription_transaction` VALUES ('681e337e-efbc-11f0-9eae-00155d7f9d8b','151a97c0-ef8a-11f0-9eae-00155d7f9d8b','7890','2026-01-12 19:11:32',5),('d873a727-efa9-11f0-9eae-00155d7f9d8b','151abfa2-ef8a-11f0-9eae-00155d7f9d8b','7890','2026-01-12 16:58:40',6),('edc1525f-efa8-11f0-9eae-00155d7f9d8b','151ab46e-ef8a-11f0-9eae-00155d7f9d8b','7890',NULL,5);
/*!40000 ALTER TABLE `prescription_transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receptionist`
--

DROP TABLE IF EXISTS `receptionist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receptionist` (
  `receptionist_id` char(36) NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `receptionist_name` varchar(255) NOT NULL,
  PRIMARY KEY (`receptionist_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `receptionist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receptionist`
--

LOCK TABLES `receptionist` WRITE;
/*!40000 ALTER TABLE `receptionist` DISABLE KEYS */;
/*!40000 ALTER TABLE `receptionist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_details`
--

DROP TABLE IF EXISTS `staff_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_details` (
  `staff_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('NURSE_RECEPTIONIST','PHARMACIST','CLERICAL_ASSISTANT') NOT NULL,
  `code` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
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
INSERT INTO `staff_details` VALUES ('625d56b3-4288-4679-9fee-3e070fbcf727','a78db729-e92d-11fb-b270-00155d788f6a','P. Sundarammal','NURSE_RECEPTIONIST','1234','9876543210','staff@nursingcollege.edu','ACTIVE'),('7824b522-0146-41b2-957a-d9872b1dd5dc','a78db729-e92d-11fb-b270-00155d788f6a','G.Praba','NURSE_RECEPTIONIST','4567','9876543210','staff@nursingcollege1.edu','ACTIVE'),('bec3cdb4-f6e3-4e92-9c7e-248c4ee38efd','b89ec83a-e92d-11fb-b270-00155d788f6b','K.Jency','PHARMACIST','7890','9876543120','staff@pharmacy.edu','ACTIVE');
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
-- Table structure for table `stock_request`
--

DROP TABLE IF EXISTS `stock_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_request` (
  `medicine_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `dressing_substock` tinyint(1) NOT NULL DEFAULT '0',
  `labtech_substock` tinyint(1) NOT NULL DEFAULT '0',
  `nurse_substock` tinyint(1) NOT NULL DEFAULT '0',
  `pharmacy_substock` tinyint(1) NOT NULL DEFAULT '0',
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `medicine_stock_log_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`),
  CONSTRAINT `stock_request_chk_1` CHECK ((`dressing_substock` in (0,1))),
  CONSTRAINT `stock_request_chk_2` CHECK ((`labtech_substock` in (0,1))),
  CONSTRAINT `stock_request_chk_3` CHECK ((`nurse_substock` in (0,1))),
  CONSTRAINT `stock_request_chk_4` CHECK ((`pharmacy_substock` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_request`
--

LOCK TABLES `stock_request` WRITE;
/*!40000 ALTER TABLE `stock_request` DISABLE KEYS */;
INSERT INTO `stock_request` VALUES ('c310c4d7-ef07-11f0-9eae-00155d7f9d8b',0,0,0,0),('c311d4a8-ef07-11f0-9eae-00155d7f9d8b',0,0,0,0),('c311db49-ef07-11f0-9eae-00155d7f9d8b',0,0,0,0),('c311dd6f-ef07-11f0-9eae-00155d7f9d8b',0,0,0,1),('c311df38-ef07-11f0-9eae-00155d7f9d8b',0,0,0,0),('c311e45a-ef07-11f0-9eae-00155d7f9d8b',0,0,0,0),('c311e72a-ef07-11f0-9eae-00155d7f9d8b',0,0,0,0),('c311e8cd-ef07-11f0-9eae-00155d7f9d8b',0,0,0,0),('c311eacf-ef07-11f0-9eae-00155d7f9d8b',0,0,0,0),('c311ec75-ef07-11f0-9eae-00155d7f9d8b',0,0,0,0);
/*!40000 ALTER TABLE `stock_request` ENABLE KEYS */;
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
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','DOCTOR','NURSE_RECEPTIONIST','PHARMACIST','CLERICAL_ASSISTANT','LAB_TECHNICIAN') NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `is_role_specific` tinyint(1) DEFAULT '0' COMMENT 'True for role-specific accounts (NURSE, PHARMACIST), False for user-specific accounts',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `username_16` (`username`),
  UNIQUE KEY `username_17` (`username`),
  UNIQUE KEY `username_18` (`username`),
  UNIQUE KEY `username_19` (`username`),
  UNIQUE KEY `username_20` (`username`),
  UNIQUE KEY `username_21` (`username`),
  UNIQUE KEY `username_22` (`username`),
  UNIQUE KEY `username_23` (`username`),
  UNIQUE KEY `username_24` (`username`),
  UNIQUE KEY `username_25` (`username`),
  UNIQUE KEY `username_26` (`username`),
  UNIQUE KEY `username_27` (`username`),
  UNIQUE KEY `username_28` (`username`),
  UNIQUE KEY `username_29` (`username`),
  UNIQUE KEY `username_30` (`username`),
  UNIQUE KEY `username_31` (`username`),
  UNIQUE KEY `username_32` (`username`),
  UNIQUE KEY `username_33` (`username`),
  UNIQUE KEY `username_34` (`username`),
  UNIQUE KEY `username_35` (`username`),
  UNIQUE KEY `username_36` (`username`),
  UNIQUE KEY `username_37` (`username`),
  UNIQUE KEY `username_38` (`username`),
  UNIQUE KEY `username_39` (`username`),
  UNIQUE KEY `username_40` (`username`),
  UNIQUE KEY `username_41` (`username`),
  UNIQUE KEY `username_42` (`username`),
  UNIQUE KEY `username_43` (`username`),
  UNIQUE KEY `username_44` (`username`),
  UNIQUE KEY `username_45` (`username`),
  UNIQUE KEY `username_46` (`username`),
  UNIQUE KEY `username_47` (`username`),
  UNIQUE KEY `username_48` (`username`),
  UNIQUE KEY `username_49` (`username`),
  UNIQUE KEY `username_50` (`username`),
  UNIQUE KEY `username_51` (`username`),
  UNIQUE KEY `username_52` (`username`),
  UNIQUE KEY `username_53` (`username`),
  UNIQUE KEY `username_54` (`username`),
  UNIQUE KEY `username_55` (`username`),
  UNIQUE KEY `username_56` (`username`),
  UNIQUE KEY `username_57` (`username`),
  UNIQUE KEY `username_58` (`username`),
  UNIQUE KEY `username_59` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('2154d7be-eee9-11f0-9eae-00155d7f9d8b','clerical_assistant','$2b$10$ThoCHDgmcmEtSwqMO2wZ1exB/J2.jph3tqA1eilxt762hl3JErfXy','CLERICAL_ASSISTANT','ACTIVE','2026-01-11 17:59:10',0),('71b8e3f2-e92d-11fb-b270-00155d788f6b','admin','$2b$10$XITrgZBpvl9YCXj75RZe2eLFpXrzrSi0oQI1CVtjk6PCZESh1xmem','ADMIN','ACTIVE','2026-01-10 13:38:10',0),('72c9f4g3-e92d-11fb-b270-00155d788f6c','dr.smith','$2b$10$eXawjAXesnmwOMN4f5lsbeBfWWB9qi9yxiygm7zIL2FEKXkl6CtEK','DOCTOR','ACTIVE','2026-01-10 13:38:10',0),('73dah5h4-e92d-11fb-b270-00155d788f6d','dr.jones','$2b$10$yQ2Kh9ko4DEBZX/nbGi00OljgM0/IMhrK.ggOun1MGxjfg3DtTJ0G','DOCTOR','ACTIVE','2026-01-10 13:38:10',0),('74ebi6i5-e92d-11fb-b270-00155d788f6e','labtech','$2b$10$G/JORbldk5IiLuo9OhqIouCx5m4lVwLu5hn/yHVh4nzcCiMk9EUjq','LAB_TECHNICIAN','ACTIVE','2026-01-10 13:38:10',0),('a78db729-e92d-11fb-b270-00155d788f6a','nurse_receptionist','$2b$10$SHLxU.5Qp9Zth1JcH1dDYexYoo01CCTXagYU40dfz23J9Ra6LeZQq','NURSE_RECEPTIONIST','ACTIVE','2026-01-10 13:38:10',1),('b89ec83a-e92d-11fb-b270-00155d788f6b','pharmacist','$2b$10$ThoCHDgmcmEtSwqMO2wZ1exB/J2.jph3tqA1eilxt762hl3JErfXy','PHARMACIST','ACTIVE','2026-01-10 13:38:10',1);
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
  CONSTRAINT `visit_ibfk_103` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visit_ibfk_104` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit`
--

LOCK TABLES `visit` WRITE;
/*!40000 ALTER TABLE `visit` DISABLE KEYS */;
INSERT INTO `visit` VALUES ('9bb3a212-ef89-11f0-9eae-00155d7f9d8b','4e12f239-ef89-11f0-9eae-00155d7f9d8b','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-10 09:00:00','Fever and cough','SCHEDULED','DOC001'),('9bb4233d-ef89-11f0-9eae-00155d7f9d8b','4e155a9f-ef89-11f0-9eae-00155d7f9d8b','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-11 10:30:00','Annual checkup','ONGOING','DOC002'),('9bb428a4-ef89-11f0-9eae-00155d7f9d8b','4e1588d8-ef89-11f0-9eae-00155d7f9d8b','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-11 14:00:00','Skin rash','DIAGNOSED','DOC001'),('9bb42b78-ef89-11f0-9eae-00155d7f9d8b','4e158f7c-ef89-11f0-9eae-00155d7f9d8b','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-12 09:15:00','Back pain','PRESCRIBED','DOC002'),('9bb42de4-ef89-11f0-9eae-00155d7f9d8b','4e159143-ef89-11f0-9eae-00155d7f9d8b','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-12 11:00:00','Headache','NURSING','DOC001'),('9bb43087-ef89-11f0-9eae-00155d7f9d8b','4e15d095-ef89-11f0-9eae-00155d7f9d8b','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-12 13:30:00','Flu symptoms','PHARMACY','DOC002'),('9bb4323b-ef89-11f0-9eae-00155d7f9d8b','4e15d5b6-ef89-11f0-9eae-00155d7f9d8b','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-12 15:00:00','Follow-up visit','COMPLETED','DOC001'),('9bb441ea-ef89-11f0-9eae-00155d7f9d8b','4e15d744-ef89-11f0-9eae-00155d7f9d8b','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-12 16:45:00','Stomach ache','CANCELLED','DOC002'),('9bb452ad-ef89-11f0-9eae-00155d7f9d8b','4e15d8af-ef89-11f0-9eae-00155d7f9d8b','d1a2b3c4-e92d-11fb-b270-00155d788f7a','2026-01-13 09:00:00','Routine blood test','SCHEDULED','DOC001'),('9bb463bd-ef89-11f0-9eae-00155d7f9d8b','4e15d9e2-ef89-11f0-9eae-00155d7f9d8b','d2b3c4d5-e92d-11fb-b270-00155d788f7b','2026-01-13 10:30:00','Allergy consultation','ONGOING','DOC002');
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
  `temperature` float DEFAULT NULL,
  `bp_systolic` int DEFAULT NULL,
  `bp_diastolic` int DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `cbg` float DEFAULT NULL,
  `spo2` float DEFAULT NULL,
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
/*!40000 ALTER TABLE `vitals` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-18 20:29:50
