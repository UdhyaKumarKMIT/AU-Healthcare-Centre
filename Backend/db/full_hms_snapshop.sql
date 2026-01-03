-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: hms
-- ------------------------------------------------------
-- Server version  8.0.44

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

-- ------------------------------------------------------
-- Drop tables (any order is fine with FOREIGN_KEY_CHECKS=0)
-- ------------------------------------------------------

DROP TABLE IF EXISTS `pharmacy_transaction`;
DROP TABLE IF EXISTS `prescription_items`;
DROP TABLE IF EXISTS `prescription`;
DROP TABLE IF EXISTS `nurse_transaction`;
DROP TABLE IF EXISTS `nurse_task_details`;
DROP TABLE IF EXISTS `nurse_task`;
DROP TABLE IF EXISTS `diagnosis`;
DROP TABLE IF EXISTS `lab_tests`;
DROP TABLE IF EXISTS `vitals`;
DROP TABLE IF EXISTS `visit`;
DROP TABLE IF EXISTS `medical_history`;
DROP TABLE IF EXISTS `medicine_batch`;
DROP TABLE IF EXISTS `medicine`;
DROP TABLE IF EXISTS `pharmacist`;
DROP TABLE IF EXISTS `patient_profile`;
DROP TABLE IF EXISTS `receptionist`;
DROP TABLE IF EXISTS `nurse`;
DROP TABLE IF EXISTS `doctor`;
DROP TABLE IF EXISTS `users`;

-- ------------------------------------------------------
-- Table structure and data for table `users`
-- ------------------------------------------------------

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

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('1060d085-daa3-11f0-a774-0a002700000d','admin@mit.edu','$2b$10$GnaMwDv0AuWdETjwjcMqMutEiRvM5/jfsYetFpPHhrChxBT9MV8J6','ADMIN'),
('26ae316b-222d-4935-8cc3-30d06643539f','doctor1@mit.edu','$2b$10$GBlmWgGXMJDoJht0.OJnDuc2ydvPR7ECK2xL1LX0U80XilATOp5vS','DOCTOR'),
('575450bd-256f-45c0-9d43-1f525925f0f1','receptionist3@mit.edu','$2b$10$C2fEAPxVn948S0GHNmEdhOW0h/5Z0kQZ/p5s/8WnfAIJSCLxvAtYe','RECEPTIONIST'),
('a2746c25-e943-4d9e-bf5c-700188a245d8','doctor2@mit.edu','$2b$10$X10tK3ZSkuurk8fCFcUDQebm8PwbwF6NyInK39cq.j88uSrusG68O','DOCTOR'),
('a87e41b4-99b4-48c8-b2a1-633b93516487','patient@mit.edu','$2b$10$2I6b0Uy.XCcJMuslOOcYAuKN86nzT13BI.J/CVhwAfOsKtMlkV4fS','PATIENT'),
('ae30e8ba-2169-40fe-8383-919b6df6aadc','123@student.annauniv.edu','$2b$10$3XCsY9GiczuQMs/IM9JT1O8ifw.mzCQJELbFtrL.0e1IX1syciGiq','PATIENT'),
('bf7ae8f4-a158-4d15-9978-06aa69be6718','receptionist1@mit.edu','$2b$10$6HXdPchK5.4.Uy.XtahOieW00FoQ9xZpDe8ccCyovqY06An1MsGkS','RECEPTIONIST'),
('c278503b-3caa-4340-99fe-1dca6a316ecd','2024503011@student.annauniv.edu','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','PATIENT'),
('ece48ad8-8911-42f7-a830-3ad0a4b1c8fe','2024503001@student.annauniv.edu','$2b$10$oaw7D/t.6VkXZxwXdLqrXeaReb1B4Z/Ulw.XETpMBHgqH7tn.v6jK','PATIENT'),
('ef0b2d9c-f56f-4af6-bf96-6deb6a4fae6d','receptionist2@mit.edu','$2b$10$UXJMdrN6Kh71ZNwp./t6GOt2s.ba4vF4LFg07BVQXMNNLBuzBZM4q','RECEPTIONIST'),
('nurse-uuid-001','nurse1@hms.com','$2b$10$3JANZjLL7latRUDM.2Kdd.QGG9Ab3qrcpEtG/s5NzF8De1GUcSrOq','NURSE'),
('nurse-uuid-002','nurse2@hms.com','$2b$10$3JANZjLL7latRUDM.2Kdd.QGG9Ab3qrcpEtG/s5NzF8De1GUcSrOq','NURSE'),
('nurse-uuid-003','nurse3@hms.com','$2b$10$3JANZjLL7latRUDM.2Kdd.QGG9Ab3qrcpEtG/s5NzF8De1GUcSrOq','NURSE'),
('nurse-uuid-004','nurse4@hms.com','$2b$10$3JANZjLL7latRUDM.2Kdd.QGG9Ab3qrcpEtG/s5NzF8De1GUcSrOq','NURSE'),
('pharma-uuid-001','pharma1@hms.com','$2a$10$8l0udMeGx9vfGYcVveX6KObsNz7vcXMQQzRTvZXtqZ7Lrw2HjwvcO','PHARMACIST');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `medicine`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine` (
  `medicine_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('Tablet','Capsule','Syrup','Injection','DRIP') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`medicine_id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `medicine` WRITE;
/*!40000 ALTER TABLE `medicine` DISABLE KEYS */;
INSERT INTO `medicine` VALUES
(1,'UNKNOWN','Tablet','2025-12-30 20:26:05'),
(27,'Paracetamol 500mg','Tablet','2025-12-30 23:47:59'),
(28,'Paracetamol 650mg','Tablet','2025-12-30 23:47:59'),
(29,'Ibuprofen 400mg','Tablet','2025-12-30 23:47:59'),
(30,'Aspirin 75mg','Tablet','2025-12-30 23:47:59'),
(31,'Cetirizine 10mg','Tablet','2025-12-30 23:47:59'),
(32,'Azithromycin 500mg','Tablet','2025-12-30 23:47:59'),
(33,'Amoxicillin 500mg','Tablet','2025-12-30 23:47:59'),
(34,'Pantoprazole 40mg','Tablet','2025-12-30 23:47:59'),
(35,'Omeprazole 20mg','Tablet','2025-12-30 23:47:59'),
(36,'Metformin 500mg','Tablet','2025-12-30 23:47:59'),
(37,'Amoxicillin 250mg','Capsule','2025-12-30 23:47:59'),
(38,'Omeprazole 40mg','Capsule','2025-12-30 23:47:59'),
(39,'Vitamin D3 1000 IU','Capsule','2025-12-30 23:47:59'),
(40,'Omega-3 Fish Oil','Capsule','2025-12-30 23:47:59'),
(41,'Cough Syrup 100ml','Syrup','2025-12-30 23:47:59'),
(42,'Paracetamol Syrup 120mg/5ml','Syrup','2025-12-30 23:47:59'),
(43,'Multivitamin Syrup','Syrup','2025-12-30 23:47:59'),
(44,'Diclofenac Injection 75mg','Injection','2025-12-30 23:47:59'),
(45,'Ceftriaxone 1g','Injection','2025-12-30 23:47:59'),
(46,'Insulin Injection','Injection','2025-12-30 23:47:59'),
(47,'Vitamin B12 Injection','Injection','2025-12-30 23:47:59'),
(48,'Normal Saline 500ml','DRIP','2025-12-30 23:47:59'),
(49,'Dextrose 5% 500ml','DRIP','2025-12-30 23:47:59'),
(50,'Ringer Lactate 500ml','DRIP','2025-12-30 23:47:59'),
(51,'Paracetamol IV 1g','DRIP','2025-12-30 23:47:59');
/*!40000 ALTER TABLE `medicine` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `pharmacist`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacist` (
  `pharmacist_id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pharmacist_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pharmacist` WRITE;
/*!40000 ALTER TABLE `pharmacist` DISABLE KEYS */;
INSERT INTO `pharmacist` VALUES
(1,'pharma-uuid-001','Pharma One','pharma1@hms.com','9000000002','$2a$10$8l0udMeGx9vfGYcVveX6KObsNz7vcXMQQzRTvZXtqZ7Lrw2HjwvcO','2025-12-30 22:09:50','2025-12-30 22:09:50');
/*!40000 ALTER TABLE `pharmacist` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `doctor`
-- ------------------------------------------------------

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

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES
('2a9163f1-e505-4199-af9b-7c6039a3840b','a2746c25-e943-4d9e-bf5c-700188a245d8','john smith','General',NULL,'AVAILABLE'),
('c78557b1-4134-43af-9a63-bc98ca896995','26ae316b-222d-4935-8cc3-30d06643539f','John','Cardiology','1111111111','AVAILABLE');
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `receptionist`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receptionist` (
  `receptionist_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `receptionist_name` varchar(255) NOT NULL,
  PRIMARY KEY (`receptionist_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `receptionist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `receptionist` WRITE;
/*!40000 ALTER TABLE `receptionist` DISABLE KEYS */;
INSERT INTO `receptionist` VALUES
('2a72bbba-2096-4cf4-baa4-7148764a3ee5','ef0b2d9c-f56f-4af6-bf96-6deb6a4fae6d','receptionist1'),
('7e392c1a-c9f6-475d-bb92-a2fe55d5291d','575450bd-256f-45c0-9d43-1f525925f0f1','receptionist');
/*!40000 ALTER TABLE `receptionist` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `patient_profile`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_profile` (
  `patient_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `roll_no` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`patient_id`),
  UNIQUE KEY `roll_no` (`roll_no`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `patient_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `patient_profile` WRITE;
/*!40000 ALTER TABLE `patient_profile` DISABLE KEYS */;
INSERT INTO `patient_profile` VALUES
('6e0602f7-ec5b-451c-93bb-c82d8d67fbc9','ae30e8ba-2169-40fe-8383-919b6df6aadc','123','vel','2025-12-16','MALE','A+','1234567890','1234567890'),
('8799eab8-b4d9-4f0b-83e5-b23502e2c8be','a87e41b4-99b4-48c8-b2a1-633b93516487','2024503001','John','2025-12-10','MALE','O+','1234567890','11111111111'),
('cde828db-8eb9-4f5b-8ddf-19a2ce7a9780','c278503b-3caa-4340-99fe-1dca6a316ecd','2024503011','patient@mit.edu','2025-12-03','MALE','O+','1234567890','1234567891'),
('f761a284-e51a-11f0-89cc-0a002700000d','ece48ad8-8911-42f7-a830-3ad0a4b1c8fe','202450301','Student 2024503001','2000-01-01','MALE','O+','1234567890','9876543210');
/*!40000 ALTER TABLE `patient_profile` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `nurse`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nurse` (
  `nurse_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `register_number` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`nurse_id`),
  UNIQUE KEY `register_number` (`register_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `nurse_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `nurse` WRITE;
/*!40000 ALTER TABLE `nurse` DISABLE KEYS */;
INSERT INTO `nurse` VALUES
('nurse-prof-001','nurse-uuid-001','RN-12345','Alice Nurse','BSc Nursing','9000000001','2025-12-30 20:33:48'),
('nurse-profile-001','nurse-uuid-001','RN-2024-001','Sarah Johnson','BSN, RN','+1-555-0101','2025-12-30 23:53:53'),
('nurse-profile-002','nurse-uuid-002','RN-2024-002','Michael Chen','BSN, RN, CCRN','+1-555-0102','2025-12-30 23:53:53'),
('nurse-profile-003','nurse-uuid-003','RN-2024-003','Emily Rodriguez','MSN, RN, FNP-C','+1-555-0103','2025-12-30 23:53:53'),
('nurse-profile-004','nurse-uuid-004','RN-2024-004','David Patel','BSN, RN, CEN','+1-555-0104','2025-12-30 23:53:53');
/*!40000 ALTER TABLE `nurse` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `medical_history`
-- ------------------------------------------------------

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

LOCK TABLES `medical_history` WRITE;
/*!40000 ALTER TABLE `medical_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `medical_history` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `visit`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit` (
  `visit_id` char(36) NOT NULL,
  `patient_id` char(36) NOT NULL,
  `doctor_id` char(36) DEFAULT NULL,
  `receptionist_id` char(36) DEFAULT NULL,
  `visit_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `visit_type` enum('OPD','IPD','EMERGENCY') DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` enum('SCHEDULED','ONGOING','DIAGNOSED','PRESCRIBED','PHARMACY','COMPLETED','CANCELLED') DEFAULT 'SCHEDULED',
  PRIMARY KEY (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `receptionist_id` (`receptionist_id`),
  CONSTRAINT `visit_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient_profile` (`patient_id`),
  CONSTRAINT `visit_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`),
  CONSTRAINT `visit_ibfk_3` FOREIGN KEY (`receptionist_id`) REFERENCES `receptionist` (`receptionist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `visit` WRITE;
/*!40000 ALTER TABLE `visit` DISABLE KEYS */;
INSERT INTO `visit` VALUES
('071b75c1-0bc5-4617-a60f-3da9c5192b95','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-22 16:25:19','OPD','fever','COMPLETED'),
('0b56c109-f40f-4e00-8d89-0a95c05148b1','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-18 23:08:15','OPD','Fever','COMPLETED'),
('0be29c6c-9390-4e64-9b5c-a31e3cfd722b','f761a284-e51a-11f0-89cc-0a002700000d','2a9163f1-e505-4199-af9b-7c6039a3840b','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-30 01:13:04','OPD','fever','SCHEDULED'),
('28f20632-bef0-45aa-9a0d-dcfb639d4a59','cde828db-8eb9-4f5b-8ddf-19a2ce7a9780','2a9163f1-e505-4199-af9b-7c6039a3840b','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-29 19:39:38','OPD','fever','ONGOING'),
('54136fb4-570b-41a5-868a-08afa1da2aff','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-22 15:17:43','OPD','f\n','COMPLETED'),
('5cd0d281-9126-4dd5-8119-72a900d39c2f','6e0602f7-ec5b-451c-93bb-c82d8d67fbc9','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-24 13:14:37','OPD','fever','COMPLETED'),
('664433a2-5d9b-4d7a-b648-3bf8e97e4bef','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-31 01:40:50','OPD','fever','COMPLETED'),
('6f013254-a76e-4522-82e3-d0e30755209b','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-19 00:31:27','OPD','1','COMPLETED'),
('7203cc02-89cb-4116-8595-fbb681b46cdb','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-18 23:45:37','OPD','headache','COMPLETED'),
('740431d2-5c6c-4b87-a637-6e9b0baea9ab','f761a284-e51a-11f0-89cc-0a002700000d','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-31 02:11:16','OPD','fever','COMPLETED'),
('76b86d51-5ff5-472d-a40b-59b942a551b4','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-19 01:41:55','OPD','1','COMPLETED'),
('805b0222-2e49-4a59-b044-999ffa1e828d','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-18 23:57:01','OPD','1','COMPLETED'),
('8229121a-dc36-11f0-a774-0a002700000d','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-18 17:25:11','OPD','fever','COMPLETED'),
('8ea78019-968b-467f-9ad8-1d863b20faa0','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-19 00:20:04','OPD','1','COMPLETED'),
('999babd8-dd72-415d-967f-daa5e7815e77','cde828db-8eb9-4f5b-8ddf-19a2ce7a9780','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-31 01:33:54','OPD','fever','COMPLETED'),
('a8944df8-461c-4813-beca-edbd9218531d','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-18 23:53:55','OPD','1','COMPLETED'),
('bdb1b9c4-4648-4923-a54e-8e2cb02d1313','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-18 23:56:12','OPD','1','COMPLETED'),
('c85e9afc-dc65-11f0-a774-0a002700000d','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-18 23:03:35','OPD','Fever','COMPLETED'),
('cd333ed6-b13a-42a8-a9d0-88a5286e15f4','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-22 15:17:57','OPD','11','COMPLETED'),
('d561ef07-f0a7-4f65-b164-5d9926509b56','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-19 00:06:41','OPD','1','COMPLETED'),
('d9b9940c-302d-4934-8140-b045d8a972fb','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-19 00:27:43','OPD','1','COMPLETED'),
('dd162c44-57b4-410a-88ff-9518ef0ca6dc','6e0602f7-ec5b-451c-93bb-c82d8d67fbc9','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-22 16:29:46','OPD','123','COMPLETED'),
('dde6fcce-bc7e-4220-ba38-0dd0c1244b19','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-18 23:45:23','OPD','fever','COMPLETED'),
('e44cefc8-743e-437c-8235-b71b9b8b32d1','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-22 15:18:09','OPD','111','COMPLETED'),
('e56bfb13-deca-4b7e-9030-e2af3493e451','cde828db-8eb9-4f5b-8ddf-19a2ce7a9780','2a9163f1-e505-4199-af9b-7c6039a3840b','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-31 01:31:42','EMERGENCY','fever','SCHEDULED'),
('f11a5aa1-b94e-494e-9aa7-6b5446d6d5dd','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-18 23:53:11','OPD','1','COMPLETED'),
('f152c79e-dc32-11f0-a774-0a002700000d','8799eab8-b4d9-4f0b-83e5-b23502e2c8be','c78557b1-4134-43af-9a63-bc98ca896995','2a72bbba-2096-4cf4-baa4-7148764a3ee5','2025-12-18 16:59:40','OPD','fever','COMPLETED');
/*!40000 ALTER TABLE `visit` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `vitals`
-- ------------------------------------------------------

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

LOCK TABLES `vitals` WRITE;
/*!40000 ALTER TABLE `vitals` DISABLE KEYS */;
INSERT INTO `vitals` VALUES
('0e623488-dc72-11f0-a774-0a002700000d','6f013254-a76e-4522-82e3-d0e30755209b',1,1,1,3),
('1cf80917-e4ee-11f0-89cc-0a002700000d','28f20632-bef0-45aa-9a0d-dcfb639d4a59',100,120,80,72),
('220145b2-dc6d-11f0-a774-0a002700000d','bdb1b9c4-4648-4923-a54e-8e2cb02d1313',1,1,1,1),
('3eca1735-dc6d-11f0-a774-0a002700000d','805b0222-2e49-4a59-b044-999ffa1e828d',1,1,1,1),
('5cedf9bf-df49-11f0-b05e-0a002700000d','54136fb4-570b-41a5-868a-08afa1da2aff',1,1,1,1),
('65423efe-df49-11f0-b05e-0a002700000d','cd333ed6-b13a-42a8-a9d0-88a5286e15f4',11,11,11,11),
('6c6fbf97-df49-11f0-b05e-0a002700000d','e44cefc8-743e-437c-8235-b71b9b8b32d1',111,111,111,111),
('6d9f169b-df53-11f0-b05e-0a002700000d','dd162c44-57b4-410a-88ff-9518ef0ca6dc',90,120,80,72),
('6f31f587-dc66-11f0-a774-0a002700000d','0b56c109-f40f-4e00-8d89-0a95c05148b1',1,1,1,1),
('766700e8-e5e8-11f0-89cc-0a002700000d','e56bfb13-deca-4b7e-9030-e2af3493e451',100,123,76,72),
('776a7ee7-dc70-11f0-a774-0a002700000d','8ea78019-968b-467f-9ad8-1d863b20faa0',1,1,1,1),
('7fbb60bf-e0ca-11f0-b05e-0a002700000d','5cd0d281-9126-4dd5-8119-72a900d39c2f',100,120,80,72),
('89127590-dc71-11f0-a774-0a002700000d','d9b9940c-302d-4934-8140-b045d8a972fb',1,1,1,1),
('98d7a9ea-dc6e-11f0-a774-0a002700000d','d561ef07-f0a7-4f65-b164-5d9926509b56',1,1,1,1),
('9f1e5b22-dc6b-11f0-a774-0a002700000d','dde6fcce-bc7e-4220-ba38-0dd0c1244b19',1,1,1,1),
('a72d4a87-dc6b-11f0-a774-0a002700000d','7203cc02-89cb-4116-8595-fbb681b46cdb',1,1,1,-1),
('b1a51e28-e51c-11f0-89cc-0a002700000d','0be29c6c-9390-4e64-9b5c-a31e3cfd722b',100,120,80,72),
('b60c2d78-dc6c-11f0-a774-0a002700000d','f11a5aa1-b94e-494e-9aa7-6b5446d6d5dd',1,1,1,1),
('bcb431e8-e5e9-11f0-89cc-0a002700000d','664433a2-5d9b-4d7a-b648-3bf8e97e4bef',100,120,80,72),
('c4df1b0f-e5e8-11f0-89cc-0a002700000d','999babd8-dd72-415d-967f-daa5e7815e77',100,123,80,72),
('d005e69b-dc6c-11f0-a774-0a002700000d','a8944df8-461c-4813-beca-edbd9218531d',1,1,1,1),
('e6c40eda-dc7b-11f0-a774-0a002700000d','76b86d51-5ff5-472d-a40b-59b942a551b4',0,1,1,1),
('fd28fe99-e5ed-11f0-89cc-0a002700000d','740431d2-5c6c-4b87-a637-6e9b0baea9ab',100,120,80,80);
/*!40000 ALTER TABLE `vitals` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `diagnosis`
-- ------------------------------------------------------

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

LOCK TABLES `diagnosis` WRITE;
/*!40000 ALTER TABLE `diagnosis` DISABLE KEYS */;
INSERT INTO `diagnosis` VALUES
('0dabe218-5ac4-49b4-b488-07e027d570d0','dd162c44-57b4-410a-88ff-9518ef0ca6dc','c78557b1-4134-43af-9a63-bc98ca896995','j00','fever','fever'),
('0fa2f01b-6b13-40ae-a7bb-48c0e5693c70','bdb1b9c4-4648-4923-a54e-8e2cb02d1313','c78557b1-4134-43af-9a63-bc98ca896995','1','1','1'),
('17821ceb-0346-4797-8fad-edf38278c096','cd333ed6-b13a-42a8-a9d0-88a5286e15f4','c78557b1-4134-43af-9a63-bc98ca896995','21','fevr','abc'),
('1c9d0f13-c3fd-4b27-86ab-1801a7de5787','5cd0d281-9126-4dd5-8119-72a900d39c2f','c78557b1-4134-43af-9a63-bc98ca896995','j00','Fever','needs further follow up'),
('1ee8efa0-5261-4df0-b18f-8cb0e72792eb','664433a2-5d9b-4d7a-b648-3bf8e97e4bef','c78557b1-4134-43af-9a63-bc98ca896995','j00','fever','abc'),
('353aff73-6de0-4d82-9dc0-1c85b9bf4c28','cd333ed6-b13a-42a8-a9d0-88a5286e15f4','c78557b1-4134-43af-9a63-bc98ca896995','J00','Fever','123'),
('449ed5a9-0d32-497c-9a37-2181f7521ada','dd162c44-57b4-410a-88ff-9518ef0ca6dc','c78557b1-4134-43af-9a63-bc98ca896995','123456','abc','none'),
('4b8c19ab-06df-43d6-83b3-4783df368694','0b56c109-f40f-4e00-8d89-0a95c05148b1','c78557b1-4134-43af-9a63-bc98ca896995','FBB','Fever','visit again after two days'),
('4eba3715-38b6-48ce-ae9b-1001a11582b8','d561ef07-f0a7-4f65-b164-5d9926509b56','c78557b1-4134-43af-9a63-bc98ca896995','1','1','1'),
('541f1c85-788f-48d7-81c0-b2e88472ac11','f152c79e-dc32-11f0-a774-0a002700000d','c78557b1-4134-43af-9a63-bc98ca896995','j00','Viral Fever','none'),
('60f8ccdb-eaed-4112-9f8b-456f10e243b9','dd162c44-57b4-410a-88ff-9518ef0ca6dc','c78557b1-4134-43af-9a63-bc98ca896995','11','fever','none'),
('62ced469-6198-4e5c-b1dc-3690685ad234','cd333ed6-b13a-42a8-a9d0-88a5286e15f4','c78557b1-4134-43af-9a63-bc98ca896995','J00','Fever','123'),
('65079446-b290-4b6d-9ed1-f76d754cc558','999babd8-dd72-415d-967f-daa5e7815e77','c78557b1-4134-43af-9a63-bc98ca896995','j00','Fever','needs another visit'),
('6b9448b9-a8ae-4c00-89d4-3e98ddbf4378','071b75c1-0bc5-4617-a60f-3da9c5192b95','c78557b1-4134-43af-9a63-bc98ca896995','J00','Fever','123'),
('6bb01db1-bc1a-44ca-87ec-db32bdbf6f85','dd162c44-57b4-410a-88ff-9518ef0ca6dc','c78557b1-4134-43af-9a63-bc98ca896995','j00','fever','a'),
('77b81963-515b-4580-8562-b73d70bb4499','740431d2-5c6c-4b87-a637-6e9b0baea9ab','c78557b1-4134-43af-9a63-bc98ca896995','11','Fever','abc'),
('7f40be7f-dd17-400d-bd73-60091c26542e','6f013254-a76e-4522-82e3-d0e30755209b','c78557b1-4134-43af-9a63-bc98ca896995','1','1','1'),
('813d0d70-09b8-4f77-9a11-7c4e2e1987b0','a8944df8-461c-4813-beca-edbd9218531d','c78557b1-4134-43af-9a63-bc98ca896995','1','1','1'),
('82fe5aea-2272-4513-b371-acb4909b7af9','cd333ed6-b13a-42a8-a9d0-88a5286e15f4','c78557b1-4134-43af-9a63-bc98ca896995','j00','fever','adc'),
('8cf5c931-3c60-4bae-8bbe-dd2ff565252c','7203cc02-89cb-4116-8595-fbb681b46cdb','c78557b1-4134-43af-9a63-bc98ca896995','1','abc','1'),
('a9318080-38c5-42fa-ac22-18bea0fbaf8f','8229121a-dc36-11f0-a774-0a002700000d','c78557b1-4134-43af-9a63-bc98ca896995',NULL,'viral fever',NULL),
('af853052-caba-45dd-86e6-c5500d20f22c','dd162c44-57b4-410a-88ff-9518ef0ca6dc','c78557b1-4134-43af-9a63-bc98ca896995','j00','fever','1'),
('b4348801-b14d-4859-bf1d-8e7800997cc6','dd162c44-57b4-410a-88ff-9518ef0ca6dc','c78557b1-4134-43af-9a63-bc98ca896995','j00','fever','123'),
('b9830b17-2a74-4b57-aead-777325f5d86f','cd333ed6-b13a-42a8-a9d0-88a5286e15f4','c78557b1-4134-43af-9a63-bc98ca896995','J00','Fever','123'),
('bb1a88f4-d7f4-41f8-9588-5be01de21b3c','e44cefc8-743e-437c-8235-b71b9b8b32d1','c78557b1-4134-43af-9a63-bc98ca896995','11','fever','abc'),
('bc1dd25d-980d-45e6-ab1c-471c583844e5','f11a5aa1-b94e-494e-9aa7-6b5446d6d5dd','c78557b1-4134-43af-9a63-bc98ca896995','1','1','1'),
('bdaeeed1-78ce-4e7f-88bb-bba79488836f','d9b9940c-302d-4934-8140-b045d8a972fb','c78557b1-4134-43af-9a63-bc98ca896995','1','1','1'),
('c35cdd1c-5582-46b6-8b5e-a494a07d113b','cd333ed6-b13a-42a8-a9d0-88a5286e15f4','c78557b1-4134-43af-9a63-bc98ca896995','J00','Fever','ABC'),
('c37e056a-46ef-424c-b417-cc3e0902159e','76b86d51-5ff5-472d-a40b-59b942a551b4','c78557b1-4134-43af-9a63-bc98ca896995','j00','fever','abc'),
('c38545e8-f07a-40ad-9426-f4d2e01daa74','dd162c44-57b4-410a-88ff-9518ef0ca6dc','c78557b1-4134-43af-9a63-bc98ca896995','j00','Fever','123'),
('d2ca5828-5030-4377-b6ea-cffa34a0b2fd','c85e9afc-dc65-11f0-a774-0a002700000d','c78557b1-4134-43af-9a63-bc98ca896995','123','abc','ab'),
('de2086fa-a824-4002-bbcb-e524c0ab2504','dd162c44-57b4-410a-88ff-9518ef0ca6dc','c78557b1-4134-43af-9a63-bc98ca896995','12','fever','abc'),
('e72f6b24-55a3-49bb-87c1-7230faa16e2b','cd333ed6-b13a-42a8-a9d0-88a5286e15f4','c78557b1-4134-43af-9a63-bc98ca896995','J00','fever','123'),
('e740a2ca-2c0f-45b7-bca8-634fb513f024','805b0222-2e49-4a59-b044-999ffa1e828d','c78557b1-4134-43af-9a63-bc98ca896995','1','1','1'),
('f09e1944-db04-48d3-b8d6-f3905e304459','dd162c44-57b4-410a-88ff-9518ef0ca6dc','c78557b1-4134-43af-9a63-bc98ca896995','j00','fever','B'),
('f6c2051c-7cc7-443f-b528-7ef11ce4b37b','dde6fcce-bc7e-4220-ba38-0dd0c1244b19','c78557b1-4134-43af-9a63-bc98ca896995','1','1','1'),
('f72e55ab-1c92-45ec-ac66-91a31b557cf8','f152c79e-dc32-11f0-a774-0a002700000d','c78557b1-4134-43af-9a63-bc98ca896995','j00','Viral Fever','none'),
('f81636d4-eae3-4d7b-88a3-8d2bf05e96a6','54136fb4-570b-41a5-868a-08afa1da2aff','c78557b1-4134-43af-9a63-bc98ca896995','j00','fever','needs further attention'),
('fcaa2f02-60e7-4583-ac07-bc885a434c8b','8ea78019-968b-467f-9ad8-1d863b20faa0','c78557b1-4134-43af-9a63-bc98ca896995','1','1','1');
/*!40000 ALTER TABLE `diagnosis` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `lab_tests`
-- ------------------------------------------------------

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

LOCK TABLES `lab_tests` WRITE;
/*!40000 ALTER TABLE `lab_tests` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_tests` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `nurse_task`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nurse_task` (
  `task_id` char(36) NOT NULL,
  `visit_id` char(36) NOT NULL,
  `doctor_id` char(36) DEFAULT NULL,
  `nurse_id` char(36) NOT NULL,
  `task_type` varchar(255) NOT NULL,
  `status` enum('PENDING','COMPLETED') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`task_id`),
  KEY `visit_id` (`visit_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `nurse_id` (`nurse_id`),
  CONSTRAINT `nurse_task_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`),
  CONSTRAINT `nurse_task_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`),
  CONSTRAINT `nurse_task_ibfk_3` FOREIGN KEY (`nurse_id`) REFERENCES `nurse` (`nurse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `nurse_task` WRITE;
/*!40000 ALTER TABLE `nurse_task` DISABLE KEYS */;
INSERT INTO `nurse_task` VALUES
('1ec88a80-c392-4e03-92f1-96721847b685','740431d2-5c6c-4b87-a637-6e9b0baea9ab','c78557b1-4134-43af-9a63-bc98ca896995','nurse-prof-001','INJECTION_ADMINISTRATION','COMPLETED','2025-12-31 02:12:12'),
('37090615-9a0c-4167-b33f-05bda8274467','664433a2-5d9b-4d7a-b648-3bf8e97e4bef','c78557b1-4134-43af-9a63-bc98ca896995','nurse-prof-001','INJECTION_ADMINISTRATION','COMPLETED','2025-12-31 01:41:46'),
('bf725dcd-9747-4170-83a1-3eac3c779476','071b75c1-0bc5-4617-a60f-3da9c5192b95','c78557b1-4134-43af-9a63-bc98ca896995','nurse-profile-004','INJECTION_ADMINISTRATION','COMPLETED','2025-12-31 00:05:47'),
('cbba3b1e-52f6-4632-be03-59007fbe2b41','dd162c44-57b4-410a-88ff-9518ef0ca6dc','c78557b1-4134-43af-9a63-bc98ca896995','nurse-profile-004','INJECTION_ADMINISTRATION','PENDING','2025-12-31 00:56:28'),
('d1d71e9f-9bf8-44ff-9502-0260a5192aed','cd333ed6-b13a-42a8-a9d0-88a5286e15f4','c78557b1-4134-43af-9a63-bc98ca896995','nurse-profile-004','INJECTION_ADMINISTRATION','COMPLETED','2025-12-31 00:04:17'),
('efd2689b-463f-41ac-b2a0-a216b26a2e54','999babd8-dd72-415d-967f-daa5e7815e77','c78557b1-4134-43af-9a63-bc98ca896995','nurse-profile-004','INJECTION_ADMINISTRATION','PENDING','2025-12-31 01:34:57');
/*!40000 ALTER TABLE `nurse_task` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `nurse_task_details`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nurse_task_details` (
  `detail_id` char(36) NOT NULL,
  `task_id` char(36) NOT NULL,
  `medicine_id` int DEFAULT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `route` enum('ORAL','IV','IM','SUBCUTANEOUS') DEFAULT NULL,
  `remarks` text,
  PRIMARY KEY (`detail_id`),
  KEY `task_id` (`task_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `nurse_task_details_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `nurse_task` (`task_id`),
  CONSTRAINT `nurse_task_details_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `nurse_task_details` WRITE;
/*!40000 ALTER TABLE `nurse_task_details` DISABLE KEYS */;
INSERT INTO `nurse_task_details` VALUES
('3e59b2f8-ce7e-4778-b702-96f7f55b307a','37090615-9a0c-4167-b33f-05bda8274467',51,'12 minutes','IV','Infusion duration: 12 mins'),
('3f532191-5c2c-46fc-a624-931c2d42ddc1','cbba3b1e-52f6-4632-be03-59007fbe2b41',51,'30 minutes','IV','Infusion duration: 30 mins'),
('4db055fa-ae8e-41e5-9149-77ad0d2b4d52','1ec88a80-c392-4e03-92f1-96721847b685',51,'11 minutes','IV','Infusion duration: 11 mins'),
('92146b47-da9b-4977-a206-52f01a9912ae','bf725dcd-9747-4170-83a1-3eac3c779476',44,NULL,'IM',NULL),
('b21da9d6-e9a1-452b-b2aa-5d562fb4804e','d1d71e9f-9bf8-44ff-9502-0260a5192aed',51,'10 minutes','IV','Infusion duration: 10 mins'),
('c3473d53-33f2-4ef5-90bc-b5cd4c8d71ef','efd2689b-463f-41ac-b2a0-a216b26a2e54',51,'12 minutes','IV','Infusion duration: 12 mins');
/*!40000 ALTER TABLE `nurse_task_details` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `nurse_transaction`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nurse_transaction` (
  `nurse_txn_id` char(36) NOT NULL,
  `task_id` char(36) NOT NULL,
  `nurse_id` char(36) NOT NULL,
  `status` enum('COMPLETED') NOT NULL,
  `performed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observation` text,
  PRIMARY KEY (`nurse_txn_id`),
  KEY `task_id` (`task_id`),
  KEY `nurse_id` (`nurse_id`),
  CONSTRAINT `nurse_transaction_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `nurse_task` (`task_id`),
  CONSTRAINT `nurse_transaction_ibfk_2` FOREIGN KEY (`nurse_id`) REFERENCES `nurse` (`nurse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `nurse_transaction` WRITE;
/*!40000 ALTER TABLE `nurse_transaction` DISABLE KEYS */;
INSERT INTO `nurse_transaction` VALUES
('2b5e5673-e5ee-11f0-89cc-0a002700000d','1ec88a80-c392-4e03-92f1-96721847b685','nurse-prof-001','COMPLETED','2025-12-31 02:12:34','Task completed'),
('37d30a03-e5df-11f0-89cc-0a002700000d','d1d71e9f-9bf8-44ff-9502-0260a5192aed','nurse-profile-004','COMPLETED','2025-12-31 00:25:32','Task completed'),
('61f24952-e5de-11f0-89cc-0a002700000d','bf725dcd-9747-4170-83a1-3eac3c779476','nurse-profile-004','COMPLETED','2025-12-31 00:19:33','Task completed'),
('ec97d309-e5e9-11f0-89cc-0a002700000d','37090615-9a0c-4167-b33f-05bda8274467','nurse-prof-001','COMPLETED','2025-12-31 01:42:10','Task completed');
/*!40000 ALTER TABLE `nurse_transaction` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `prescription`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription` (
  `prescription_id` char(36) NOT NULL,
  `visit_id` char(36) NOT NULL,
  `doctor_id` char(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','ISSUED','CANCELLED') DEFAULT NULL,
  PRIMARY KEY (`prescription_id`),
  KEY `visit_id` (`visit_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `prescription_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`visit_id`),
  CONSTRAINT `prescription_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
INSERT INTO `prescription` VALUES
('29ce9fa3-a5da-45c4-8dac-4e15a408a6ee','740431d2-5c6c-4b87-a637-6e9b0baea9ab','c78557b1-4134-43af-9a63-bc98ca896995','2025-12-31 02:12:12','ISSUED'),
('584d14cf-3f51-4092-ba63-0135ce6b0061','664433a2-5d9b-4d7a-b648-3bf8e97e4bef','c78557b1-4134-43af-9a63-bc98ca896995','2025-12-31 01:41:46','ISSUED'),
('b9dababe-a117-4b38-acb1-e947aaa76572','999babd8-dd72-415d-967f-daa5e7815e77','c78557b1-4134-43af-9a63-bc98ca896995','2025-12-31 01:34:57','ISSUED');
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `prescription_items`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `item_id` char(36) NOT NULL,
  `prescription_id` char(36) NOT NULL,
  `medicine_id` int NOT NULL,
  `total_days` int NOT NULL,
  `food` enum('BEFORE','AFTER','WITH') DEFAULT 'AFTER',
  `morning` tinyint(1) DEFAULT '0',
  `afternoon` tinyint(1) DEFAULT '0',
  `night` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`item_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`prescription_id`),
  CONSTRAINT `prescription_items_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
INSERT INTO `prescription_items` VALUES
('3e91901e-d79d-4cea-9a45-3c2f040cc3a2','584d14cf-3f51-4092-ba63-0135ce6b0061',27,1,'AFTER',1,0,0),
('7b6da926-d89f-489e-8ce1-9ad0bddd58cb','b9dababe-a117-4b38-acb1-e947aaa76572',27,1,'AFTER',1,0,0),
('bb914173-7aa1-4715-8d91-fda850becafa','29ce9fa3-a5da-45c4-8dac-4e15a408a6ee',27,1,'AFTER',1,0,0);
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `medicine_batch`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_batch` (
  `batch_id` varchar(50) NOT NULL,
  `medicine_id` int NOT NULL,
  `expiry_date` date NOT NULL,
  `in_stock` int NOT NULL,
  `status` enum('ACTIVE','EXPIRED','DISPOSED') DEFAULT 'ACTIVE',
  `pharmacist_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`batch_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `medicine_batch_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `medicine_batch` WRITE;
/*!40000 ALTER TABLE `medicine_batch` DISABLE KEYS */;
INSERT INTO `medicine_batch` VALUES
('123',27,'2026-02-04',0,'ACTIVE',1,'2025-12-31 00:35:22'),
('BATCH-PARA-001',27,'2026-12-31',486,'ACTIVE',1,'2025-12-30 22:18:59');
/*!40000 ALTER TABLE `medicine_batch` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------
-- Table structure and data for table `pharmacy_transaction`
-- ------------------------------------------------------

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_transaction` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` char(36) NOT NULL,
  `pharmacist_id` int NOT NULL,
  `issued_days` int NOT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `fk_pt_prescription` (`prescription_id`),
  KEY `fk_pt_pharmacist` (`pharmacist_id`),
  CONSTRAINT `fk_pt_pharmacist` FOREIGN KEY (`pharmacist_id`) REFERENCES `pharmacist` (`pharmacist_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pt_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`prescription_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pharmacy_transaction` WRITE;
/*!40000 ALTER TABLE `pharmacy_transaction` DISABLE KEYS */;
INSERT INTO `pharmacy_transaction` VALUES
(7,'584d14cf-3f51-4092-ba63-0135ce6b0061',1,1,'2025-12-31 01:42:50'),
(11,'b9dababe-a117-4b38-acb1-e947aaa76572',1,1,'2025-12-31 02:08:17'),
(12,'29ce9fa3-a5da-45c4-8dac-4e15a408a6ee',1,1,'2025-12-31 02:13:18');
/*!40000 ALTER TABLE `pharmacy_transaction` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed (re-ordered) for dependency-safe restore