-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 06 déc. 2025 à 10:15
-- Version du serveur : 10.4.28-MariaDB
-- Version de PHP : 8.2.4

SET SQL_MODE = "";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `db_vcards`
--

-- --------------------------------------------------------

--
-- Structure de la table `companies`
--

CREATE TABLE `companies` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `legal_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `size` enum('1-10','11-50','51-200','201-500','501-1000','1000+') DEFAULT NULL,
  `founded_year` int(11) DEFAULT NULL,
  `tax_id` varchar(100) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_by` char(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `companies`
--

INSERT INTO `companies` (`id`, `name`, `legal_name`, `description`, `logo`, `website`, `industry`, `size`, `founded_year`, `tax_id`, `is_verified`, `created_by`, `created_at`, `updated_at`) VALUES
('7da96aed-f730-4a37-a18e-9fac3237184d', 'testing', NULL, 'testing123', NULL, 'test123.tn', NULL, NULL, NULL, NULL, 0, '7ed79aee-41e7-4a0b-a879-f604a7c5e19e', '2025-11-21 21:37:35', '2025-11-29 19:12:35');

-- --------------------------------------------------------

--
-- Structure de la table `company_employees`
--

CREATE TABLE `company_employees` (
  `id` char(36) NOT NULL,
  `company_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `profile_id` char(36) DEFAULT NULL,
  `job_title` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `employee_id` varchar(100) DEFAULT NULL,
  `role` enum('owner','admin','member') NOT NULL DEFAULT 'member',
  `is_active` tinyint(1) DEFAULT 1,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `company_employees`
--

INSERT INTO `company_employees` (`id`, `company_id`, `user_id`, `profile_id`, `job_title`, `department`, `employee_id`, `role`, `is_active`, `start_date`, `end_date`, `created_at`, `updated_at`, `email`) VALUES
('0d1a3da0-d0b1-4061-a367-2024b967af09', '7da96aed-f730-4a37-a18e-9fac3237184d', 'cfc9fe35-5d30-4808-ae66-752af106b00d', '314f6de1-2038-4dcf-a164-7318562afa42', '', NULL, NULL, 'member', 1, NULL, NULL, '2025-11-29 12:22:28', '2025-11-29 12:22:28', 'dddd@gmail.com'),
('5b65ca41-913b-4346-97dc-1a283ed694ee', '7da96aed-f730-4a37-a18e-9fac3237184d', '8007b8c9-b3c7-4a4b-bb92-5d06950e3342', 'cb426386-75a5-4b4b-a4a5-ebb56329ac1f', '', NULL, NULL, 'member', 1, NULL, NULL, '2025-11-26 20:54:52', '2025-11-26 20:54:52', 'adad@gmail.com'),
('668df22f-d838-49ff-a710-1732ccd5188b', '7da96aed-f730-4a37-a18e-9fac3237184d', '7ed79aee-41e7-4a0b-a879-f604a7c5e19e', 'c6880982-924a-4543-b426-b945e373b28e', '', NULL, NULL, 'owner', 1, NULL, NULL, '2025-11-21 21:37:35', '2025-11-21 21:37:35', 'test@gmail.com'),
('888da34f-4af3-459f-9c0e-f4f7a2aa6a9e', '7da96aed-f730-4a37-a18e-9fac3237184d', 'b3f32880-0ec3-4f9c-9212-cfffb47572cd', '90c2437e-9b9f-4dac-9904-25e1f02f6e52', '', NULL, NULL, 'member', 1, NULL, NULL, '2025-11-28 20:31:14', '2025-11-28 20:31:14', 'cccc@gmail.com');

-- --------------------------------------------------------

--
-- Structure de la table `company_invitations`
--

CREATE TABLE `company_invitations` (
  `id` char(36) NOT NULL,
  `company_id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('admin','member') NOT NULL DEFAULT 'member',
  `token` varchar(255) NOT NULL,
  `status` enum('pending','accepted','expired','cancelled') NOT NULL DEFAULT 'pending',
  `expires_at` datetime NOT NULL,
  `invited_by` char(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `profiles`
--

CREATE TABLE `profiles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `company_id` char(36) DEFAULT NULL,
  `display_name` varchar(255) NOT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `cover_url` varchar(255) DEFAULT NULL,
  `primary_color` varchar(255) DEFAULT '#4F46E5',
  `secondary_color` varchar(255) DEFAULT '#EC4899',
  `tier` enum('free','premium') DEFAULT 'free',
  `visibility` enum('public','private','floux') DEFAULT 'private',
  `is_banned` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `profile_type` enum('individual','company') NOT NULL DEFAULT 'individual'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `company_id`, `display_name`, `job_title`, `department`, `bio`, `avatar_url`, `cover_url`, `primary_color`, `secondary_color`, `tier`, `visibility`, `is_banned`, `created_at`, `updated_at`, `profile_type`) VALUES
('314f6de1-2038-4dcf-a164-7318562afa42', 'cfc9fe35-5d30-4808-ae66-752af106b00d', NULL, 'dddd', NULL, NULL, 'dddddddddddd', NULL, NULL, '#000000', '#ffffff', 'premium', 'public', 0, '2025-11-29 12:22:28', '2025-11-29 12:25:48', 'individual'),
('71942cca-4e88-44ce-bf2e-095ffe9c2851', '6fd8e3eb-441a-4c09-bd50-a4e044a3cb14', NULL, 'odoo', 'CEO', 'Management', 'test', '/uploads/file-1763416019834.png', '/uploads/file-1763416460103.jpg', '#e6e1c1', '#aed8db', 'free', 'public', 0, '2025-11-16 16:50:37', '2025-11-18 22:13:11', 'company'),
('86e789dc-5617-4125-bef2-905fc5b60aef', 'fd23085d-0aaf-4cb8-9881-d7edd8af5b2b', NULL, 'skandar', NULL, NULL, 'skaander ', NULL, NULL, '#000000ff', '#ffffffff', 'free', 'public', 0, '2025-11-22 11:26:10', '2025-11-29 18:17:46', 'individual'),
('90c2437e-9b9f-4dac-9904-25e1f02f6e52', 'b3f32880-0ec3-4f9c-9212-cfffb47572cd', NULL, 'cccc', NULL, NULL, '', NULL, NULL, '#4F46E5', '#EC4899', 'premium', 'floux', 0, '2025-11-28 20:31:14', '2025-11-29 19:52:42', 'individual'),
('9b872f4f-96cd-4123-84bc-e620d37c38cc', 'a0b3b957-e7e8-4662-b0c8-f602f0054fba', NULL, 'ahmed', NULL, NULL, 'ahmed', NULL, NULL, '#000000ff', '#ffffffff', 'free', 'private', 0, '2025-11-18 22:46:29', '2025-11-18 22:46:49', 'individual'),
('c6880982-924a-4543-b426-b945e373b28e', '7ed79aee-41e7-4a0b-a879-f604a7c5e19e', NULL, 'test', 'Développeur', 'IT', 'testing', NULL, NULL, '#000000ff', '#ffffffff', 'premium', 'private', 0, '2025-11-18 22:41:38', '2025-11-29 20:52:07', 'individual'),
('cb426386-75a5-4b4b-a4a5-ebb56329ac1f', '8007b8c9-b3c7-4a4b-bb92-5d06950e3342', NULL, 'adad', NULL, NULL, '', NULL, NULL, '#4F46E5', '#EC4899', 'free', 'public', 0, '2025-11-26 20:54:52', '2025-11-28 20:30:37', 'individual');

-- --------------------------------------------------------

--
-- Structure de la table `profile_addresses`
--

CREATE TABLE `profile_addresses` (
  `id` char(36) NOT NULL,
  `profile_id` char(36) NOT NULL,
  `address` text NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `profile_addresses`
--

INSERT INTO `profile_addresses` (`id`, `profile_id`, `address`, `label`, `display_order`, `created_at`) VALUES
('1be14b9b-a0b2-4963-9888-342a87224bb5', '71942cca-4e88-44ce-bf2e-095ffe9c2851', 'routesfax 2 Sfax sfax sfax', 'Principal', 0, '2025-11-17 21:10:49'),
('f9f9a3a7-df3a-4c9a-853b-ef4df11d8191', 'c6880982-924a-4543-b426-b945e373b28e', 'aaaa', '', 0, '2025-11-26 21:13:55');

-- --------------------------------------------------------

--
-- Structure de la table `profile_emails`
--

CREATE TABLE `profile_emails` (
  `id` char(36) NOT NULL,
  `profile_id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `profile_emails`
--

INSERT INTO `profile_emails` (`id`, `profile_id`, `email`, `label`, `display_order`, `created_at`) VALUES
('8b998e5d-de3d-4e86-a0e7-bdf1ebf99a3e', '314f6de1-2038-4dcf-a164-7318562afa42', 'dddd@gmail.com', '', 0, '2025-11-29 12:26:47'),
('b66b9484-072f-492b-963e-ffc98bfcbcd1', '71942cca-4e88-44ce-bf2e-095ffe9c2851', 'odooahmed64@gmail.com', 'odooahmed64@gmail.com', 0, '2025-11-18 20:31:50');

-- --------------------------------------------------------

--
-- Structure de la table `profile_favorites`
--

CREATE TABLE `profile_favorites` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `profile_id` char(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `profile_favorites`
--

INSERT INTO `profile_favorites` (`id`, `user_id`, `profile_id`, `created_at`) VALUES
('70f12408-c5e1-47ef-910e-cbaf4f39a1e2', '7ed79aee-41e7-4a0b-a879-f604a7c5e19e', '314f6de1-2038-4dcf-a164-7318562afa42', '2025-11-29 12:32:22');

-- --------------------------------------------------------

--
-- Structure de la table `profile_gallery`
--

CREATE TABLE `profile_gallery` (
  `id` char(36) NOT NULL,
  `profile_id` char(36) NOT NULL,
  `image_url` varchar(1024) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `profile_gallery`
--

INSERT INTO `profile_gallery` (`id`, `profile_id`, `image_url`, `display_order`, `created_at`) VALUES
('223e413d-a716-4f04-94db-bd01086e6a23', '71942cca-4e88-44ce-bf2e-095ffe9c2851', '/uploads/gallery/gallery-1763493486413.png', 2, '2025-11-18 19:18:06'),
('3efc41f4-166a-4708-8174-bbc9ced923f9', 'c6880982-924a-4543-b426-b945e373b28e', '/uploads/gallery/gallery-1764190767620.png', 0, '2025-11-26 20:59:27'),
('4f16e2d5-8133-4b5c-8cb1-e1cbe93a645a', '71942cca-4e88-44ce-bf2e-095ffe9c2851', '/uploads/gallery/gallery-1763493395670.gif', 0, '2025-11-18 19:16:35'),
('dfafa362-1760-4b60-bb22-624647094ff8', '71942cca-4e88-44ce-bf2e-095ffe9c2851', '/uploads/gallery/gallery-1763493480141.jpg', 1, '2025-11-18 19:18:00');

-- --------------------------------------------------------

--
-- Structure de la table `profile_localizations`
--

CREATE TABLE `profile_localizations` (
  `id` char(36) NOT NULL,
  `profile_id` char(36) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `profile_localizations`
--

INSERT INTO `profile_localizations` (`id`, `profile_id`, `address`, `latitude`, `longitude`, `is_primary`, `created_at`, `updated_at`, `createdAt`, `updatedAt`) VALUES
('884fc836-16d1-470d-888f-8d50edfeffa2', 'c6880982-924a-4543-b426-b945e373b28e', 'PQV8+4P7, Sfax', 34.74174200, 10.76752600, 0, '2025-11-26 22:33:05', '2025-11-26 22:33:05', '2025-11-26 22:33:05', '2025-11-26 22:33:05');

-- --------------------------------------------------------

--
-- Structure de la table `profile_phones`
--

CREATE TABLE `profile_phones` (
  `id` char(36) NOT NULL,
  `profile_id` char(36) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `profile_phones`
--

INSERT INTO `profile_phones` (`id`, `profile_id`, `phone`, `label`, `display_order`, `created_at`) VALUES
('51004b82-817d-41a6-9b66-35d9367ce490', '314f6de1-2038-4dcf-a164-7318562afa42', '21212121', '', 0, '2025-11-29 12:26:57'),
('c39f5724-f452-4c9d-a8cd-ed2e58a9861e', '71942cca-4e88-44ce-bf2e-095ffe9c2851', '29937594', '', 0, '2025-11-18 20:32:14'),
('f7713e3a-9ed4-479d-9825-25151c02721b', '71942cca-4e88-44ce-bf2e-095ffe9c2851', '21212134', 'Mobile', 0, '2025-11-17 21:00:38');

-- --------------------------------------------------------

--
-- Structure de la table `profile_social_links`
--

CREATE TABLE `profile_social_links` (
  `id` char(36) NOT NULL,
  `profile_id` char(36) NOT NULL,
  `platform_id` char(36) NOT NULL,
  `url` varchar(255) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `profile_social_links`
--

INSERT INTO `profile_social_links` (`id`, `profile_id`, `platform_id`, `url`, `display_order`, `created_at`) VALUES
('00803dcc-02aa-4568-b813-ced4dea61cf3', '314f6de1-2038-4dcf-a164-7318562afa42', '1b1c2c69-c305-11f0-b695-047c16a46333', 'facebook.com', 0, '2025-11-29 12:27:14'),
('14eb2e1b-e635-4445-9d08-12adc0ab760a', '71942cca-4e88-44ce-bf2e-095ffe9c2851', '1b1c2ea5-c305-11f0-b695-047c16a46333', 'www.twitter.com/aabb', 0, '2025-11-17 21:25:07'),
('1506a0c3-9d74-43cc-9291-dd2f4956d2e6', '71942cca-4e88-44ce-bf2e-095ffe9c2851', '1b1c2f01-c305-11f0-b695-047c16a46333', 'www.facebook.com/aabb', 0, '2025-11-17 21:12:57'),
('3b6e46f7-c094-48b7-a48f-2ce7f01729ec', '71942cca-4e88-44ce-bf2e-095ffe9c2851', '1b1c2f21-c305-11f0-b695-047c16a46333', 'www.instagram.com/aabb', 0, '2025-11-17 21:25:40');

-- --------------------------------------------------------

--
-- Structure de la table `qr_styles`
--

CREATE TABLE `qr_styles` (
  `id` char(36) NOT NULL,
  `profile_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `qr_styles`
--

INSERT INTO `qr_styles` (`id`, `profile_id`, `name`, `options`, `created_at`, `updated_at`, `createdAt`, `updatedAt`) VALUES
('256d3e4d-5f28-4ef6-9709-e078d28c825d', 'cb426386-75a5-4b4b-a4a5-ebb56329ac1f', 'azerty', '{\"color\":\"#000000\",\"bgColor\":\"transparent\",\"gradient\":{\"from\":\"#f22121\",\"to\":\"#000000\",\"type\":\"linear\"},\"cornerShape\":\"dots\",\"cornerDotShape\":\"dots\",\"frameStyle\":\"none\",\"modulePattern\":\"dots\",\"logoSize\":0.2,\"errorCorrection\":\"H\",\"useProfilePhoto\":false}', '2025-11-29 22:05:57', '2025-11-29 22:33:53', '2025-11-29 22:05:57', '2025-11-29 22:33:53'),
('c108eb46-d7a3-4ae2-b833-455ee19f4679', 'cb426386-75a5-4b4b-a4a5-ebb56329ac1f', 'dddddddd', '{\"color\":\"#000000\",\"bgColor\":\"transparent\",\"gradient\":{\"from\":\"#d3853c\",\"to\":\"#f50000\",\"type\":\"linear\"},\"cornerShape\":\"rounded\",\"cornerDotShape\":\"rounded\",\"frameStyle\":\"none\",\"modulePattern\":\"rounded\",\"logoSize\":0.2,\"errorCorrection\":\"H\",\"useProfilePhoto\":false}', '2025-11-29 22:35:41', '2025-11-29 22:37:04', '2025-11-29 22:35:41', '2025-11-29 22:37:04');

-- --------------------------------------------------------

--
-- Structure de la table `social_platforms`
--

CREATE TABLE `social_platforms` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon_name` varchar(255) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `social_platforms`
--

INSERT INTO `social_platforms` (`id`, `name`, `icon_name`, `display_order`, `created_at`) VALUES
('1b1c2c69-c305-11f0-b695-047c16a46333', 'LinkedIn', 'Linkedin', 1, '2025-11-16 15:58:34'),
('1b1c2ea5-c305-11f0-b695-047c16a46333', 'Twitter', 'Twitter', 2, '2025-11-16 15:58:34'),
('1b1c2f01-c305-11f0-b695-047c16a46333', 'Facebook', 'Facebook', 3, '2025-11-16 15:58:34'),
('1b1c2f21-c305-11f0-b695-047c16a46333', 'Instagram', 'Instagram', 4, '2025-11-16 15:58:34'),
('1b1c2f3f-c305-11f0-b695-047c16a46333', 'GitHub', 'Github', 5, '2025-11-16 15:58:34'),
('1b1c2f5c-c305-11f0-b695-047c16a46333', 'YouTube', 'Youtube', 6, '2025-11-16 15:58:34'),
('1b1c2f79-c305-11f0-b695-047c16a46333', 'TikTok', 'Music', 7, '2025-11-16 15:58:34'),
('1b1c2f93-c305-11f0-b695-047c16a46333', 'WhatsApp', 'MessageCircle', 8, '2025-11-16 15:58:34'),
('1b1c2fb3-c305-11f0-b695-047c16a46333', 'Telegram', 'Send', 9, '2025-11-16 15:58:34'),
('1b1c2fcc-c305-11f0-b695-047c16a46333', 'Discord', 'MessageSquare', 10, '2025-11-16 15:58:34');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user','company') NOT NULL DEFAULT 'user',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
('1ee105df-444a-4a00-801c-5aaf38bcf429', 'aaa@gmail.com', '$2b$10$uDpfDfelfrAaHHA8H7MpxetJfv3dsgl3/DJn2zwJ3vCIKaWbPd7iG', 'user', '2025-11-26 19:50:58', '2025-11-26 19:50:58'),
('6fd8e3eb-441a-4c09-bd50-a4e044a3cb14', 'odooahmed64@gmail.com', '$2b$10$ZasRk2twaAWn7xofIUINwORAVpG3dM352rUe8DZat1zx7egk20GJi', 'user', '2025-11-16 16:50:37', '2025-11-16 16:50:37'),
('7ed79aee-41e7-4a0b-a879-f604a7c5e19e', 'test@gmail.com', '$2b$10$CB8pkia4Gbau2XxG1Dwk3e3fYqOtReYfLH3QuWXZvLkBeJEeK8qRi', 'company', '2025-11-18 22:41:28', '2025-11-18 22:41:28'),
('8007b8c9-b3c7-4a4b-bb92-5d06950e3342', 'adad@gmail.com', '$2b$10$BW/2m.6qo9VLFIjr/kgsg./zL2MoSf6snZdP63alDVUfi4ZlFvY86', 'user', '2025-11-26 20:54:52', '2025-11-26 20:54:52'),
('a0b3b957-e7e8-4662-b0c8-f602f0054fba', 'ahmed@gmail.com', '$2b$10$oNa4LR5ScdAcRAENEBwWHu0uzEQJH4ZNtIaRGlBOLx9n2LHBECUoO', 'admin', '2025-11-18 22:46:20', '2025-11-18 22:46:20'),
('b3f32880-0ec3-4f9c-9212-cfffb47572cd', 'cccc@gmail.com', '$2b$10$rWzjvF6DlN2wou2dWWn0EeNeby/lmpuRC7Eo3bqR4XS91o7MBrARe', 'user', '2025-11-28 20:31:14', '2025-11-28 20:31:14'),
('cfc9fe35-5d30-4808-ae66-752af106b00d', 'dddd@gmail.com', '$2b$10$YPpdQvZrRwsTXgYBcGcO5uAlxjrSgHJyCHp09iFfp4DnlB9UzIEy2', 'user', '2025-11-29 12:22:28', '2025-11-29 12:22:28'),
('fd23085d-0aaf-4cb8-9881-d7edd8af5b2b', 'ska@gmail.com', '$2b$10$u1lbV8IWuYJX9rW4vlWzt.TMHxFrAPq5z3TZHDzNyeZDwu08KKceu', 'user', '2025-11-22 11:24:58', '2025-11-22 11:24:58');

-- --------------------------------------------------------

--
-- Structure de la table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `created_by` (`created_by`);

--
-- Index pour la table `company_employees`
--
ALTER TABLE `company_employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_company_user` (`company_id`,`user_id`),
  ADD UNIQUE KEY `unique_company_profile` (`company_id`,`profile_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `profile_id` (`profile_id`);

--
-- Index pour la table `company_invitations`
--
ALTER TABLE `company_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `invited_by` (`invited_by`);

--
-- Index pour la table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `profile_company_id` (`company_id`);

--
-- Index pour la table `profile_addresses`
--
ALTER TABLE `profile_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profile_id` (`profile_id`);

--
-- Index pour la table `profile_emails`
--
ALTER TABLE `profile_emails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profile_id` (`profile_id`);

--
-- Index pour la table `profile_favorites`
--
ALTER TABLE `profile_favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_favorite` (`user_id`,`profile_id`),
  ADD UNIQUE KEY `profile_favorites_user_id_profile_id` (`user_id`,`profile_id`),
  ADD KEY `profile_id` (`profile_id`);

--
-- Index pour la table `profile_gallery`
--
ALTER TABLE `profile_gallery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profile_id` (`profile_id`);

--
-- Index pour la table `profile_localizations`
--
ALTER TABLE `profile_localizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_profile_localizations_profile` (`profile_id`);

--
-- Index pour la table `profile_phones`
--
ALTER TABLE `profile_phones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profile_id` (`profile_id`);

--
-- Index pour la table `profile_social_links`
--
ALTER TABLE `profile_social_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profile_id` (`profile_id`),
  ADD KEY `platform_id` (`platform_id`);

--
-- Index pour la table `qr_styles`
--
ALTER TABLE `qr_styles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_qr_styles_profile` (`profile_id`);

--
-- Index pour la table `social_platforms`
--
ALTER TABLE `social_platforms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`);

--
-- Index pour la table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_role` (`user_id`,`role`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `company_employees`
--
ALTER TABLE `company_employees`
  ADD CONSTRAINT `company_employees_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `company_employees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `company_employees_ibfk_3` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `company_invitations`
--
ALTER TABLE `company_invitations`
  ADD CONSTRAINT `company_invitations_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `company_invitations_ibfk_2` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `profiles_ibfk_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `profile_addresses`
--
ALTER TABLE `profile_addresses`
  ADD CONSTRAINT `profile_addresses_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Contraintes pour la table `profile_emails`
--
ALTER TABLE `profile_emails`
  ADD CONSTRAINT `profile_emails_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Contraintes pour la table `profile_favorites`
--
ALTER TABLE `profile_favorites`
  ADD CONSTRAINT `profile_favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `profile_favorites_ibfk_2` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `profile_gallery`
--
ALTER TABLE `profile_gallery`
  ADD CONSTRAINT `profile_gallery_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `profile_localizations`
--
ALTER TABLE `profile_localizations`
  ADD CONSTRAINT `fk_profile_localizations_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `profile_phones`
--
ALTER TABLE `profile_phones`
  ADD CONSTRAINT `profile_phones_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Contraintes pour la table `profile_social_links`
--
ALTER TABLE `profile_social_links`
  ADD CONSTRAINT `profile_social_links_ibfk_3` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `profile_social_links_ibfk_4` FOREIGN KEY (`platform_id`) REFERENCES `social_platforms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Contraintes pour la table `qr_styles`
--
ALTER TABLE `qr_styles`
  ADD CONSTRAINT `fk_qr_styles_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
