-- 广西旅游后台管理系统数据库表结构

-- 创建数据库
CREATE DATABASE IF NOT EXISTS guangxi_tourism;
USE guangxi_tourism;

-- 角色表
CREATE TABLE IF NOT EXISTS `role` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
  `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `description` VARCHAR(255) COMMENT '角色描述',
  `permissions` JSON COMMENT '权限列表',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 管理员表
CREATE TABLE IF NOT EXISTS `admin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `name` VARCHAR(50) NOT NULL COMMENT '管理员姓名',
  `role_id` INT NOT NULL COMMENT '角色ID',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `last_login` DATETIME COMMENT '最后登录时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`role_id`) REFERENCES `role`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 景点分类表
CREATE TABLE IF NOT EXISTS `scenic_category` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `parent_id` INT DEFAULT 0 COMMENT '父分类ID',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='景点分类表';

-- 景点表
CREATE TABLE IF NOT EXISTS `scenic_spot` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '景点ID',
  `name` VARCHAR(100) NOT NULL COMMENT '景点名称',
  `address` VARCHAR(255) NOT NULL COMMENT '地址',
  `level` VARCHAR(20) COMMENT '景点等级',
  `category_id` INT COMMENT '分类ID',
  `ticket_price` DECIMAL(10,2) COMMENT '门票价格',
  `opening_hours` VARCHAR(255) COMMENT '开放时间',
  `description` TEXT COMMENT '图文详情',
  `traffic` TEXT COMMENT '交通信息',
  `contact` VARCHAR(255) COMMENT '联系方式',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-上架，0-下架',
  `views` INT DEFAULT 0 COMMENT '访问量',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`category_id`) REFERENCES `scenic_category`(`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='景点表';

-- 旅游攻略表
CREATE TABLE IF NOT EXISTS `travel_guide` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '攻略ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `author` VARCHAR(50) NOT NULL COMMENT '作者',
  `scenic_id` INT COMMENT '关联景点ID',
  `itinerary` TEXT COMMENT '行程安排',
  `content` TEXT COMMENT '图文内容',
  `tags` VARCHAR(255) COMMENT '标签',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-已通过，2-已驳回',
  `reject_reason` VARCHAR(255) COMMENT '驳回原因',
  `views` INT DEFAULT 0 COMMENT '阅读量',
  `favorites` INT DEFAULT 0 COMMENT '收藏数',
  `likes` INT DEFAULT 0 COMMENT '点赞数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`scenic_id`) REFERENCES `scenic_spot`(`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_scenic` (`scenic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='旅游攻略表';

-- 用户留言表
CREATE TABLE IF NOT EXISTS `user_message` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '留言ID',
  `user_name` VARCHAR(50) NOT NULL COMMENT '用户姓名',
  `email` VARCHAR(100) COMMENT '邮箱',
  `content` TEXT NOT NULL COMMENT '留言内容',
  `type` TINYINT DEFAULT 0 COMMENT '留言类型：0-景点留言，1-攻略留言',
  `target_id` INT NOT NULL COMMENT '关联ID（景点ID或攻略ID）',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-已通过，2-已隐藏',
  `reply` TEXT COMMENT '回复内容',
  `is_reported` TINYINT DEFAULT 0 COMMENT '是否被举报：0-否，1-是',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_status` (`status`),
  INDEX `idx_type_target` (`type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户留言表';

-- 系统日志表
CREATE TABLE IF NOT EXISTS `system_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  `admin_id` INT COMMENT '管理员ID',
  `action` VARCHAR(100) NOT NULL COMMENT '操作类型',
  `description` TEXT NOT NULL COMMENT '操作描述',
  `ip` VARCHAR(50) COMMENT '操作IP',
  `user_agent` VARCHAR(255) COMMENT '用户代理',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`),
  INDEX `idx_admin` (`admin_id`),
  INDEX `idx_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统日志表';

-- 数据统计表
CREATE TABLE IF NOT EXISTS `data_statistics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
  `type` VARCHAR(50) NOT NULL COMMENT '统计类型',
  `value` INT NOT NULL COMMENT '统计值',
  `date` DATE NOT NULL COMMENT '统计日期',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_type_date` (`type`, `date`),
  INDEX `idx_type` (`type`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据统计表';

-- 初始化数据
-- 角色数据
INSERT INTO `role` (`name`, `description`, `permissions`) VALUES
('超级管理员', '拥有所有权限', '{"admin": true, "scenic": true, "guide": true, "message": true, "statistics": true, "log": true}'),
('内容审核员', '负责内容审核', '{"scenic": true, "guide": true, "message": true}'),
('数据查看员', '仅查看数据', '{"statistics": true, "log": true}');

-- 管理员数据（密码：123456）
INSERT INTO `admin` (`username`, `password`, `name`, `role_id`, `status`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '超级管理员', 1, 1),
('reviewer', '$2b$10$e7VqfWj0y5g2n5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e', '内容审核员', 2, 1),
('viewer', '$2b$10$e7VqfWj0y5g2n5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e', '数据查看员', 3, 1);

-- 景点分类数据
INSERT INTO `scenic_category` (`name`, `parent_id`, `sort`) VALUES
('自然风光', 0, 1),
('人文景观', 0, 2),
('历史遗迹', 0, 3),
('主题公园', 0, 4),
('山水景观', 1, 1),
('海滩景观', 1, 2),
('森林景观', 1, 3);