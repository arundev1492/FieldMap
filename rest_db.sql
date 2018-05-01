-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2018 at 12:14 AM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `rest_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `imported_data`
--

CREATE TABLE IF NOT EXISTS `imported_data` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `FileName` varchar(255) DEFAULT NULL,
  `CSVData` text,
  `CreatedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;

--
-- Dumping data for table `imported_data`
--

INSERT INTO `imported_data` (`ID`, `FileName`, `CSVData`, `CreatedDate`) VALUES
(1, 'asdas.csv', '[["Test title"],["1222"],["test Desc"],["12"],["5"]]', '2018-04-29 23:48:34'),
(2, 'asdas.csv', '[["Test title"],["1222"],["test Desc"],["12"],["5"]]', '2018-04-30 00:00:57'),
(3, 'asdas.csv', '[["Test title"],["1222"],["test Desc"],["12"],["5"]]', '2018-04-30 00:03:45'),
(4, 'asdas.csv', '[["Test title"],["1222"],["test Desc"],["12"],["5"]]', '2018-04-30 00:04:35'),
(5, 'asdas.csv', '[["Test title"],["1222"],["test Desc"],["12"],["5"]]', '2018-04-30 00:05:08'),
(6, 'asdas.csv', '[["Test title"],["1222"],["test Desc"],["12"],["5"]]', '2018-04-30 00:06:51'),
(7, 'asdas.csv', '[["Test title"],["1222"],["test Desc"],["12"],["5"]]', '2018-04-30 00:09:11');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE IF NOT EXISTS `products` (
  `ProductID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Title` varchar(50) DEFAULT NULL,
  `SKU` varchar(50) DEFAULT NULL,
  `Description` varchar(50) DEFAULT NULL,
  `Prize` varchar(50) DEFAULT NULL,
  `quantity` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ProductID`),
  UNIQUE KEY `SKU` (`SKU`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='products' AUTO_INCREMENT=2 ;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`ProductID`, `Title`, `SKU`, `Description`, `Prize`, `quantity`) VALUES
(1, 'Test title', '1222', 'test Desc', '12', '5');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
