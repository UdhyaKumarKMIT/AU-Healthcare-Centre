CREATE TABLE users (
  user_id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM(
    'ADMIN',
    'DOCTOR',
    'NURSE',
    'PHARMACIST',
    'RECEPTIONIST',
    'PATIENT'
  ) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE doctor (
  doctor_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  availability_status ENUM('AVAILABLE','UNAVAILABLE') DEFAULT 'AVAILABLE',
  FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE receptionist (
  receptionist_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  receptionist_name VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE patient_profile (
  patient_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  roll_no VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  dob DATE,
  gender ENUM('MALE','FEMALE','OTHER'),
  blood_group ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
  phone VARCHAR(20),
  emergency_contact VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE medical_history (
  history_id CHAR(36) PRIMARY KEY,
  patient_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  condition_name VARCHAR(255) NOT NULL,
  since_date DATE,
  status ENUM('ACTIVE','RESOLVED','CHRONIC'),
  notes TEXT,
  FOREIGN KEY (patient_id) REFERENCES patient_profile(patient_id)
) ENGINE=InnoDB;

CREATE TABLE visit (
  visit_id CHAR(36) PRIMARY KEY,
  patient_id CHAR(36) NOT NULL,
  doctor_id CHAR(36) NOT NULL,
  receptionist_id CHAR(36),
  visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  visit_type ENUM('OPD','IPD','EMERGENCY'),
  reason VARCHAR(255),
  status ENUM('SCHEDULED','ONGOING','COMPLETED','CANCELLED','DIAGNOSED','PRESCRIBED','NURSING','PHARMACY'),
  FOREIGN KEY (patient_id) REFERENCES patient_profile(patient_id),
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id),
  FOREIGN KEY (receptionist_id) REFERENCES receptionist(receptionist_id)
) ENGINE=InnoDB;

CREATE TABLE vitals (
  vitals_id CHAR(36) PRIMARY KEY,
  visit_id CHAR(36) NOT NULL,
  temperature FLOAT,
  bp_systolic INT,
  bp_diastolic INT,
  heart_rate INT,
  FOREIGN KEY (visit_id) REFERENCES visit(visit_id)
) ENGINE=InnoDB;

CREATE TABLE diagnosis (
  diagnosis_id CHAR(36) PRIMARY KEY,
  visit_id CHAR(36) NOT NULL,
  doctor_id CHAR(36) NOT NULL,
  diagnosis_code VARCHAR(50),
  diagnosis_name VARCHAR(255),
  diagnosis_notes TEXT,
  FOREIGN KEY (visit_id) REFERENCES visit(visit_id),
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
) ENGINE=InnoDB;

CREATE TABLE lab_tests (
  lab_test_id CHAR(36) PRIMARY KEY,
  visit_id CHAR(36) NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  ordered_date DATE,
  result TEXT,
  normal_range VARCHAR(255),
  FOREIGN KEY (visit_id) REFERENCES visit(visit_id)
) ENGINE=InnoDB;

CREATE TABLE prescription (
    prescription_id CHAR(36) PRIMARY KEY,
    visit_id CHAR(36) NOT NULL,
    doctor_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING','ISSUED','CANCELLED'),
    FOREIGN KEY (visit_id) REFERENCES visit(visit_id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

CREATE TABLE prescription_items (
    item_id CHAR(36) PRIMARY KEY,
    prescription_id CHAR(36) NOT NULL,
    medicine_id INT NOT NULL,
    duration_days INT NOT NULL,
    food ENUM('BEFORE','AFTER'),
    morning BOOLEAN DEFAULT FALSE,
    afternoon BOOLEAN DEFAULT FALSE,
    night BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (prescription_id) REFERENCES prescription(prescription_id)
);