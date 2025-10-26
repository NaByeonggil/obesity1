-- Insert additional medication data
INSERT INTO medications (id, name, description, price) VALUES
('med_007', '타이레놀 500mg', '해열 진통제', 6000),
('med_008', '게보린', '두통 및 발열 완화제', 5500),
('med_009', '부루펜', '소염 진통제', 7000),
('med_010', '베아제정', '소화효소제', 12000),
('med_011', '훼스탈플러스', '소화제', 9000),
('med_012', '가스터정', '위산 분비 억제제', 8500),
('med_013', '오메프라졸', '위염 및 역류성 식도염 치료제', 15000),
('med_014', '지르텍', '알레르기 비염 치료제', 11000),
('med_015', '알레그라', '알레르기성 비염 및 두드러기', 13000),
('med_016', '에어탈', '진통 소염제', 8000),
('med_017', '비타민C 1000mg', '면역력 강화 비타민', 18000),
('med_018', '종합비타민', '멀티비타민 미네랄 복합제', 25000),
('med_019', '오메가3', '심혈관 건강 보조제', 30000),
('med_020', '프로바이오틱스', '장 건강 유산균', 35000)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price = VALUES(price);

SELECT COUNT(*) as total_medications FROM medications;
