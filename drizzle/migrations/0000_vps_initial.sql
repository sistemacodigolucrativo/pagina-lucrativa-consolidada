CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT NULL,
  email VARCHAR(320) NULL,
  loginMethod VARCHAR(64) NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS memberProfiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  slug VARCHAR(96) NOT NULL,
  bio TEXT NULL,
  whatsapp VARCHAR(32) NULL,
  websiteUrl VARCHAR(512) NULL,
  photoUrl VARCHAR(1024) NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY member_profiles_user_unique (userId),
  UNIQUE KEY member_profiles_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS campaignLinks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(128) NOT NULL,
  destinationUrl VARCHAR(1024) NOT NULL,
  clicks INT NOT NULL DEFAULT 0,
  leads INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY campaign_links_user_created_idx (userId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ownerId INT NOT NULL,
  title VARCHAR(240) NOT NULL,
  description TEXT NULL,
  priceCents INT NOT NULL DEFAULT 0,
  status ENUM('draft','active','archived') NOT NULL DEFAULT 'draft',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY products_owner_updated_idx (ownerId, updatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('sale','commission','adjustment','withdrawal') NOT NULL,
  description VARCHAR(320) NOT NULL,
  amountCents INT NOT NULL,
  occurredAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY transactions_user_date_idx (userId, occurredAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  summary TEXT NULL,
  category VARCHAR(96) NULL,
  durationMinutes INT NOT NULL DEFAULT 0,
  level ENUM('fundamentos','pratica','avancado') NOT NULL DEFAULT 'fundamentos',
  isPublished INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS courseProgress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  courseId INT NOT NULL,
  progressPercent INT NOT NULL DEFAULT 0,
  lastAccessedAt TIMESTAMP NULL,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY course_progress_user_course_unique (userId, courseId),
  KEY course_progress_user_idx (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(180) NOT NULL,
  email VARCHAR(320) NOT NULL,
  whatsapp VARCHAR(32) NOT NULL,
  status ENUM('pending','contacted','approved','archived') NOT NULL DEFAULT 'pending',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY applications_status_date_idx (status, createdAt),
  KEY applications_email_idx (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS managedContent (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kind ENUM('material','article','faq','notice') NOT NULL,
  title VARCHAR(240) NOT NULL,
  summary TEXT NULL,
  body TEXT NULL,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  createdBy INT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY managed_content_status_kind_idx (status, kind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS supportTickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  subject VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open','answered','closed') NOT NULL DEFAULT 'open',
  adminResponse TEXT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY support_tickets_user_updated_idx (userId, updatedAt),
  KEY support_tickets_status_updated_idx (status, updatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO users (id, openId, name, email, loginMethod, role) VALUES
  (1, 'local_demo_admin', 'Administrador de demonstração', 'admin.demo@pagina-lucrativa.local', 'local_demo', 'admin'),
  (2, 'local_demo_member', 'Membro de demonstração', 'membro.demo@pagina-lucrativa.local', 'local_demo', 'user')
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), loginMethod=VALUES(loginMethod), role=VALUES(role);
