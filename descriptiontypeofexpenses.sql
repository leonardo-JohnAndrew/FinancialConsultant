-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 27, 2026 at 09:00 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `financialdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `descriptiontypeofexpenses`
--

CREATE TABLE `descriptiontypeofexpenses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `descriptiontypeofexpenses`
--

INSERT INTO `descriptiontypeofexpenses` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, '1.1 Temporary Visa for International Staff', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(2, '1.2 Temporary Visa for International Staff', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(3, '1.3 Working Visa Process for International Staff', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(4, '1.4 Working Visa Process for renewal', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(5, '2.1 ECC -  Emigration Clearance Certificate', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(6, '2.2 Rental car (MPV) with driver, fuel, O&M, insurance, parking ', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(7, '2.3 Rental car (VAN) with driver, fuel, O&M, insurance, parking ', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(8, '2.4 Rental car (MPV) with driver, fuel, O&M, insurance, parking ', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(9, '2.5 Rental car (Van) with driver, fuel, O&M, insurance, parking ', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(10, '2.6 Overtime Charge', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(11, '3.1 Additional Fees - Toll and Fuel ', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(12, '3.2 Office rental for main office, 1800 sq.m.', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(13, '3.3 Office Association Dues, 1800 sq.m.', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(14, '3.4 Office rental for main office, 500 sq.m.', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(15, '3.6 Office Association Dues, 500 sq.m.', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(16, '3.7 Office rental for main office - Extension', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(17, '3.8 Office Association Dues - Extension', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(18, '4.1 Storage Unit (200sqm x 1,000/Sqm)', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(19, '4.2 Domestic & International phone call', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(20, '4.2.a Internet charges', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(21, '4.2b Internet - Additional 30Mbps', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(22, '4.3 Additional Internet Cost (Back up)', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(23, '4.4 Mobile phone charge', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(24, '5.1 Courier & Postal services', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(25, '6.1 Reproduction of Reports (at cost)', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(26, '6.2 Office Furniture (at cost)', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(27, '6.3 Office Equipment (at cost)', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(28, ' Stationary / Office supplies (papers, clips, pens, printer toner cartridges, etc.)', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(29, 'Software (at cost)', '0000-00-00 00:00:00', '0000-00-00 00:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `descriptiontypeofexpenses`
--
ALTER TABLE `descriptiontypeofexpenses`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `descriptiontypeofexpenses`
--
ALTER TABLE `descriptiontypeofexpenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
