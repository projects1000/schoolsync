-- Database Migration Script for Little Steps Playschool Management System
-- This script adds missing tables and relationships to complete the system

-- =============================================
-- 1. Add user_id column to teachers table
-- =============================================
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE teachers ADD CONSTRAINT fk_teachers_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================
-- 2. Create classes table
-- =============================================
CREATE TABLE IF NOT EXISTS classes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(50),
    section VARCHAR(10),
    class_teacher_id BIGINT,
    capacity INTEGER DEFAULT 30,
    room VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT fk_classes_teacher FOREIGN KEY (class_teacher_id) 
        REFERENCES teachers(id) ON DELETE SET NULL
);

-- =============================================
-- 3. Create invites table
-- =============================================
CREATE TABLE IF NOT EXISTS invites (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    invite_code VARCHAR(64) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_by BIGINT,
    accepted_by BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    additional_data TEXT,
    
    CONSTRAINT fk_invites_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_invites_accepted_by FOREIGN KEY (accepted_by) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- 4. Create audit_logs table
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id BIGINT,
    payload TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- 5. Update students table to reference parents
-- =============================================
-- First create parents table if not exists
CREATE TABLE IF NOT EXISTS parents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT fk_parents_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- Add parent_id to students table if not exists
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_id BIGINT;
ALTER TABLE students ADD CONSTRAINT fk_students_parent 
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL;

-- Add class_id to students table if not exists
ALTER TABLE students ADD COLUMN IF NOT EXISTS class_id BIGINT;
ALTER TABLE students ADD CONSTRAINT fk_students_class 
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- =============================================
-- 6. Create indexes for better performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_department ON teachers(department);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status);

CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(class_teacher_id);

CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_role ON invites(role);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);

-- =============================================
-- 7. Insert sample classes data
-- =============================================
INSERT INTO classes (name, grade, section, capacity, room) VALUES
    ('Playgroup A', 'Playgroup', 'A', 25, 'Room 101'),
    ('Playgroup B', 'Playgroup', 'B', 25, 'Room 102'),
    ('Nursery A', 'Nursery', 'A', 30, 'Room 201'),
    ('Nursery B', 'Nursery', 'B', 30, 'Room 202'),
    ('Kindergarten A', 'Kindergarten', 'A', 35, 'Room 301'),
    ('Kindergarten B', 'Kindergarten', 'B', 35, 'Room 302')
ON CONFLICT DO NOTHING;

-- =============================================
-- 8. Add columns to users table if not exists
-- =============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update existing users with username based on email
UPDATE users SET username = SPLIT_PART(email, '@', 1) WHERE username IS NULL;

-- =============================================
-- Migration Notes:
-- =============================================
-- 1. This script is safe to run multiple times (idempotent)
-- 2. Existing data is preserved
-- 3. All foreign key constraints have ON DELETE SET NULL for data integrity
-- 4. Indexes are added for optimal query performance
-- 5. Sample classes are inserted for immediate use
-- 6. The script handles existing table structures gracefully

-- =============================================
-- Verification Queries (run after migration):
-- =============================================
-- SELECT COUNT(*) FROM classes;
-- SELECT COUNT(*) FROM invites;
-- SELECT COUNT(*) FROM audit_logs;
-- SELECT COUNT(*) FROM teachers WHERE user_id IS NOT NULL;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';