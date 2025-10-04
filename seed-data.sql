-- 진료과목 데이터
INSERT INTO departments (id, name, description, consultationType, featured) VALUES
('dept_001', '마운자로 위고비', '비만 치료 전문', 'offline', true),
('dept_002', '비만관련 처방', '비만 관련 처방 전문', 'offline', false),
('dept_003', '인공눈물', '안구건조증 치료', 'online', false),
('dept_004', '감기관련', '감기 및 호흡기 질환', 'online', false),
('dept_005', '내과', '일반 내과 진료', 'offline', true);

-- 의사 계정 생성 (비밀번호: doctor1234)
INSERT INTO users (id, email, password, name, phone, role, specialization, license, clinic, address, latitude, longitude, hasOfflineConsultation, hasOnlineConsultation, createdAt, updatedAt) VALUES
('doc_001', 'doctor1@hospital.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5gyy0M8BF0aX6', '김의사', '010-1234-5678', 'DOCTOR', '비만 치료', 'LICENSE001', '서울 비만 클리닉', '서울시 강남구', 37.4979, 127.0276, true, true, NOW(), NOW()),
('doc_002', 'doctor2@hospital.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5gyy0M8BF0aX6', '이의사', '010-2234-5678', 'DOCTOR', '내과', 'LICENSE002', '서울 내과 의원', '서울시 서초구', 37.4833, 127.0322, true, false, NOW(), NOW()),
('doc_003', 'doctor3@hospital.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5gyy0M8BF0aX6', '박의사', '010-3234-5678', 'DOCTOR', '안과', 'LICENSE003', '서울 안과 병원', '서울시 송파구', 37.5145, 127.1061, false, true, NOW(), NOW());

-- 진료비 데이터
INSERT INTO clinic_fees (id, doctorId, departmentId, consultationType, basePrice, emergencyPrice, description, isActive, createdAt, updatedAt) VALUES
('fee_001', 'doc_001', 'dept_001', 'offline', 50000, 70000, '마운자로/위고비 처방 진료', true, NOW(), NOW()),
('fee_002', 'doc_001', 'dept_002', 'offline', 30000, 50000, '비만 관련 일반 진료', true, NOW(), NOW()),
('fee_003', 'doc_002', 'dept_005', 'offline', 20000, 40000, '내과 일반 진료', true, NOW(), NOW()),
('fee_004', 'doc_003', 'dept_003', 'online', 15000, NULL, '온라인 안구건조증 상담', true, NOW(), NOW()),
('fee_005', 'doc_003', 'dept_004', 'online', 15000, NULL, '온라인 감기 상담', true, NOW(), NOW());

-- 약국 계정 생성 (비밀번호: pharmacy1234)
INSERT INTO users (id, email, password, name, phone, role, pharmacyName, pharmacyAddress, pharmacyPhone, latitude, longitude, createdAt, updatedAt) VALUES
('pharm_001', 'pharmacy1@pharmacy.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5gyy0M8BF0aX6', '약사1', '010-4234-5678', 'PHARMACY', '서울 약국', '서울시 강남구 테헤란로 123', '02-1234-5678', 37.4979, 127.0276, NOW(), NOW()),
('pharm_002', 'pharmacy2@pharmacy.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5gyy0M8BF0aX6', '약사2', '010-5234-5678', 'PHARMACY', '강남 약국', '서울시 강남구 역삼동 456', '02-2234-5678', 37.5007, 127.0365, NOW(), NOW());

-- 약품 데이터
INSERT INTO medications (id, name, description, price) VALUES
('med_001', '마운자로 2.5mg', '비만 치료제', 150000),
('med_002', '위고비 0.25mg', '비만 치료제', 180000),
('med_003', '인공눈물', '안구건조증 치료', 5000),
('med_004', '타이레놀', '해열진통제', 3000),
('med_005', '코데인', '기침 억제제', 8000);

-- 약국 재고
INSERT INTO pharmacy_inventory (id, pharmacyId, medicationId, currentStock, minStock, maxStock, supplier) VALUES
('inv_001', 'pharm_001', 'med_001', 50, 10, 100, '제약회사A'),
('inv_002', 'pharm_001', 'med_002', 30, 10, 100, '제약회사B'),
('inv_003', 'pharm_001', 'med_003', 100, 20, 200, '제약회사C'),
('inv_004', 'pharm_002', 'med_004', 200, 50, 300, '제약회사D'),
('inv_005', 'pharm_002', 'med_005', 80, 20, 150, '제약회사E');
