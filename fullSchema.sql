-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: mit_healthcare_system
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
  `diagnosis_id` char(36) NOT NULL,
  `visit_id` char(36) NOT NULL,
  `doctor_id` char(36) NOT NULL,
  `diagnosis_code` varchar(50) DEFAULT NULL,
  `diagnosis_name` varchar(255) DEFAULT NULL,
  `diagnosis_notes` text,
  PRIMARY KEY (`diagnosis_id`),
  KEY `visit_id` (`visit_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `diagnosis_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`),
  CONSTRAINT `diagnosis_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor` (
  `doctor_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `specialization` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `availability_status` enum('AVAILABLE','UNAVAILABLE') DEFAULT 'AVAILABLE',
  PRIMARY KEY (`doctor_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `doctor_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests` (
  `lab_test_id` char(36) NOT NULL,
  `visit_id` char(36) NOT NULL,
  `test_name` varchar(255) NOT NULL,
  `ordered_date` date DEFAULT NULL,
  `result` text,
  `normal_range` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`lab_test_id`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `lab_tests_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medical_history`
--

DROP TABLE IF EXISTS `medical_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_history` (
  `history_id` char(36) NOT NULL,
  `patient_id` char(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `condition_name` varchar(255) NOT NULL,
  `since_date` date DEFAULT NULL,
  `status` enum('ACTIVE','RESOLVED','CHRONIC') DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`history_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `medical_history_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient_profile` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medicine`
--

DROP TABLE IF EXISTS `medicine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine` (
  `medicine_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('capsule','syrup','tablet','injection','ointment','drops') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`medicine_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medicine_batch`
--

DROP TABLE IF EXISTS `medicine_batch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_batch` (
  `batch_id` varchar(20) NOT NULL,
  `medicine_id` int NOT NULL,
  `expiry_date` date NOT NULL,
  `quantity` int NOT NULL,
  `status` enum('ACTIVE','EXPIRED') NOT NULL,
  `pharmacist_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`batch_id`),
  KEY `medicine_id` (`medicine_id`),
  KEY `pharmacist_id` (`pharmacist_id`),
  CONSTRAINT `medicine_batch_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`),
  CONSTRAINT `medicine_batch_ibfk_2` FOREIGN KEY (`pharmacist_id`) REFERENCES `pharmacist` (`pharmacist_id`),
  CONSTRAINT `medicine_batch_chk_1` CHECK ((`in_stock` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medicine_log`
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
  PRIMARY KEY (`batch_no`),
  CONSTRAINT `medicine_log_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `main_expired_medicine_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `main_expired_medicine_log` (
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
-- Table structure for table `medicine_stock_log`
--

DROP TABLE IF EXISTS `medicine_stock_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_stock_log` (
  `stock_log_id` int NOT NULL AUTO_INCREMENT,
  `medicine_id` int NOT NULL,
  `batch_id` varchar(20) DEFAULT NULL,
  `pharmacist_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_log_id`),
  KEY `medicine_id` (`medicine_id`),
  KEY `pharmacist_id` (`pharmacist_id`),
  CONSTRAINT `medicine_stock_log_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`),
  CONSTRAINT `medicine_stock_log_ibfk_2` FOREIGN KEY (`pharmacist_id`) REFERENCES `pharmacist` (`pharmacist_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_profile`
--

DROP TABLE IF EXISTS `patient_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_profile` (
  `patient_id` char(36) NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, 
  `roll_no` varchar(255) DEFAULT NULL, 
  `name` varchar(255) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`patient_id`),
  UNIQUE KEY `roll_no` (`roll_no`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `patient_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pharmacist`
--

DROP TABLE IF EXISTS `pharmacist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacist` (
  `pharmacist_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pharmacist_id`),
  KEY `fk_pharmacist_user` (`user_id`),
  CONSTRAINT `fk_pharmacist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prescription_transaction`
--

DROP TABLE IF EXISTS `prescription_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_transaction` (
  `pharmacy_txn_id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `pharmacist_id` int NOT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `issued_days` int NOT NULL,
  `status` enum('ISSUED') DEFAULT 'ISSUED',
  PRIMARY KEY (`pharmacy_txn_id`),
  KEY `fk_pt_prescription` (`prescription_id`),
  KEY `fk_pt_pharmacist` (`pharmacist_id`),
  CONSTRAINT `fk_pt_pharmacist` FOREIGN KEY (`pharmacist_id`) REFERENCES `pharmacist` (`pharmacist_id`),
  CONSTRAINT `fk_pt_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`prescription_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','ISSUED','CANCELLED') DEFAULT NULL,
  PRIMARY KEY (`prescription_id`),
  KEY `visit_id` (`visit_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `prescription_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prescription_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `item_id` char(36) NOT NULL,
  `prescription_id` char(36) NOT NULL,
  `medicine_id` int NOT NULL,
  `duration_days` int NOT NULL,
  `food` enum('BEFORE','AFTER') DEFAULT NULL,
  `morning` tinyint(1) DEFAULT '0',
  `afternoon` tinyint(1) DEFAULT '0',
  `night` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`item_id`),
  KEY `prescription_id` (`prescription_id`),
  CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`prescription_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','DOCTOR','NURSE','PHARMACIST','RECEPTIONIST','PATIENT') NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `visit`
--

DROP TABLE IF EXISTS `visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit` (
  `visit_id` char(36) NOT NULL,
  `patient_id` char(36) NOT NULL,
  `doctor_id` char(36) NOT NULL,
  `receptionist_id` char(36) DEFAULT NULL,
  `visit_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `visit_type` enum('OPD','IPD','EMERGENCY') DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` enum('SCHEDULED','ONGOING','COMPLETED','CANCELLED','DIAGNOSED','PRESCRIBED','NURSING','PHARMACY') DEFAULT NULL,
  PRIMARY KEY (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `receptionist_id` (`receptionist_id`),
  CONSTRAINT `visit_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient_profile` (`patient_id`),
  CONSTRAINT `visit_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`),
  CONSTRAINT `visit_ibfk_3` FOREIGN KEY (`receptionist_id`) REFERENCES `receptionist` (`receptionist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vitals`
--

DROP TABLE IF EXISTS `vitals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vitals` (
  `vitals_id` char(36) NOT NULL,
  `visit_id` char(36) NOT NULL,
  `temperature` float DEFAULT NULL,
  `bp_systolic` int DEFAULT NULL,
  `bp_diastolic` int DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  PRIMARY KEY (`vitals_id`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `vitals_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 21:31:09

CREATE TABLE `stock_request` (
  `medicine_id` CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `requested_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

  `dressing_substock` TINYINT(1) NOT NULL DEFAULT 0 CHECK (`dressing_substock` IN (0,1)),
  `labtech_substock`  TINYINT(1) NOT NULL DEFAULT 0 CHECK (`labtech_substock` IN (0,1)),
  `nurse_substock`    TINYINT(1) NOT NULL DEFAULT 0 CHECK (`nurse_substock` IN (0,1)),
  `pharmacy_substock` TINYINT(1) NOT NULL DEFAULT 0 CHECK (`pharmacy_substock` IN (0,1)),

  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `medicine_stock_log_ibfk_1`
    FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;
