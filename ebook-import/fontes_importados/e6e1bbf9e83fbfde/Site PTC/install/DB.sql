-- phpMyAdmin SQL Dump
-- version 2.11.0
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 30, 2008 at 09:16 PM
-- Server version: 5.0.45
-- PHP Version: 5.2.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- --------------------------------------------------------

--
-- Table structure for table `ads`
--

CREATE TABLE `ads` (
  `ad_id` int(11) NOT NULL auto_increment,
  `ad_name` varchar(75) NOT NULL,
  `ad_email` varchar(75) NOT NULL,
  `ad_plan` int(2) NOT NULL,
  `ad_url` varchar(75) NOT NULL,
  `ad_description` varchar(255) NOT NULL,
  `cat` int(3) NOT NULL,
  `premium` int(2) NOT NULL,
  `active` int(2) NOT NULL,
  `clicks` int(11) NOT NULL,
  `outside` int(11) NOT NULL,
  `clicksleft` int(11) NOT NULL,
  `ad_balance` int(11) NOT NULL default '0',
  PRIMARY KEY  (`ad_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `ads`
--

INSERT INTO `ads` VALUES(1, 'Alertpay Name', 'Alertpay Address', 1, 'http://thealternatif.info', 'Test Your Ads', 1, 0, 1, 0, 0, 100000, 0);

-- --------------------------------------------------------

--
-- Table structure for table `ad_clicks`
--

CREATE TABLE `ad_clicks` (
  `user` int(11) NOT NULL,
  `ad` int(11) NOT NULL,
  `day` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `ad_clicks`
--


-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `setname` varchar(255) NOT NULL,
  `setvalue` text NOT NULL,
  `set_day` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` VALUES('newadstoday', '0', 31);
INSERT INTO `settings` VALUES('totalads', '5', 0);

-- --------------------------------------------------------

--
-- Table structure for table `tb_buyref`
--

CREATE TABLE `tb_buyref` (
  `id` int(11) NOT NULL auto_increment,
  `sets` varchar(150) NOT NULL default '',
  `customer` varchar(150) NOT NULL default '',
  `amount` varchar(150) NOT NULL default '',
  `pemail` varchar(150) NOT NULL default '',
  `ip` varchar(15) NOT NULL default '',
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `tb_buyref`
--

INSERT INTO `tb_buyref` VALUES(1, '0', 'admin', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `tb_contact`
--

CREATE TABLE `tb_contact` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(150) NOT NULL default '',
  `email` varchar(150) NOT NULL default '',
  `topic` varchar(150) NOT NULL default '',
  `subject` varchar(150) NOT NULL default '',
  `comments` varchar(200) NOT NULL default '',
  `ip` varchar(15) NOT NULL default '',
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `tb_contact`
--


-- --------------------------------------------------------

--
-- Table structure for table `tb_history`
--

CREATE TABLE `tb_history` (
  `id` int(11) NOT NULL auto_increment,
  `user` varchar(150) NOT NULL default '',
  `date` varchar(150) NOT NULL default '',
  `amount` varchar(150) NOT NULL default '',
  `method` varchar(150) NOT NULL default '',
  `status` varchar(150) NOT NULL default '',
  KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `tb_history`
--


-- --------------------------------------------------------

--
-- Table structure for table `tb_payme`
--

CREATE TABLE `tb_payme` (
  `id` int(11) NOT NULL auto_increment,
  `username` varchar(150) NOT NULL default '',
  `pasword` varchar(150) NOT NULL default '',
  `email` varchar(150) NOT NULL default '',
  `pemail` varchar(150) NOT NULL default '',
  `country` varchar(150) NOT NULL default '',
  `money` varchar(150) NOT NULL default '',
  `ip` varchar(15) NOT NULL default '',
  `date` varchar(150) NOT NULL default '',
  `account` varchar(150) NOT NULL default '',
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

--
-- Dumping data for table `tb_payme`
--


-- --------------------------------------------------------

--
-- Table structure for table `tb_upgrade`
--

CREATE TABLE `tb_upgrade` (
  `id` int(11) NOT NULL auto_increment,
  `username` varchar(150) NOT NULL default '',
  `pemail` varchar(150) NOT NULL default '',
  `email` varchar(150) NOT NULL default '',
  `status` varchar(150) NOT NULL default '',
  `date` varchar(150) NOT NULL default '',
  `ip` varchar(15) NOT NULL default '',
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=8 ;

--
-- Dumping data for table `tb_upgrade`
--

-- --------------------------------------------------------

--
-- Table structure for table `tb_users`
--

CREATE TABLE `tb_users` (
  `id` int(11) NOT NULL auto_increment,
  `username` varchar(15) NOT NULL default '',
  `password` varchar(15) NOT NULL default '',
  `ip` varchar(15) NOT NULL default '',
  `email` varchar(150) NOT NULL default '',
  `pemail` varchar(150) NOT NULL default '',
  `referer` varchar(15) NOT NULL default '',
  `country` varchar(150) NOT NULL default '',
  `visits` varchar(150) NOT NULL default '0',
  `referals` varchar(150) NOT NULL default '0',
  `referalvisits` varchar(150) NOT NULL default '0',
  `money` varchar(150) NOT NULL default '0.00',
  `paid` varchar(150) NOT NULL default '0.00',
  `joindate` varchar(150) NOT NULL default '',
  `lastlogdate` varchar(150) NOT NULL default '',
  `lastiplog` varchar(150) NOT NULL default '',
  `account` varchar(150) NOT NULL default '',
  `adcode` text NOT NULL,
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=20 ;

--
-- Dumping data for table `tb_users`
--

INSERT INTO `tb_users` VALUES(1, 'admin', 'admin', '127.0.0.1', 'admin@admin.com', 'admin@admin.com', ' ', 'United Kingdom', '0', '0', '0', '0.05', '0.00', '1184512264', '1199134421', '172.213.71.18', 'premium', '');

-- ------------------------------------------------------

CREATE TABLE `tb_config` (
  `id` int(11) NOT NULL auto_increment,
  `item` varchar(15) collate latin1_general_ci NOT NULL,
  `howmany` varchar(15) collate latin1_general_ci NOT NULL,
  `price` varchar(150) collate latin1_general_ci NOT NULL,
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=7 ;

--
-- Dumping data for table `tb_config`
--

INSERT INTO `tb_config` VALUES (1, 'hits', '100', '1.50');
INSERT INTO `tb_config` VALUES (1, 'hits', '500', '7.50');
INSERT INTO `tb_config` VALUES (1, 'hits', '1000', '15');
INSERT INTO `tb_config` VALUES (1, 'hits', '2500', '37.50');
INSERT INTO `tb_config` VALUES (1, 'hits', '5000', '74');
INSERT INTO `tb_config` VALUES (1, 'hits', '10000', '145');
INSERT INTO `tb_config` VALUES (1, 'hits', '50000', '740');
INSERT INTO `tb_config` VALUES (1, 'hits', '100000', '1470');
INSERT INTO `tb_config` VALUES (1, 'hits', '500000', '7300');
INSERT INTO `tb_config` VALUES (1, 'hits', '1000000', '15999');
INSERT INTO `tb_config` VALUES (1, 'Site_Name', '1', 'SriptBux');
INSERT INTO `tb_config` VALUES (1, 'Admin_Alertpay_Email', '1', 'dgha@telkom.net');
INSERT INTO `tb_config` VALUES (1, 'Upgrade_Price', '1', '59');
INSERT INTO `tb_config` VALUES (1, 'Forum_URL', '1', 'http://thealternatif.info');
INSERT INTO `tb_config` VALUES (1, 'Site_Title', '1', 'ScriptBux | The Best PTC Script');
INSERT INTO `tb_config` VALUES (1, 'referal', '5', '6.95');
INSERT INTO `tb_config` VALUES (1, 'referal', '35', '34.65');
INSERT INTO `tb_config` VALUES (1, 'referal', '100', '89.95');
INSERT INTO `tb_config` VALUES (1, 'referal', '500', '429.00');


-- ------------------------------------------------------

CREATE TABLE `tb_clicks` (
  `id` int(11) NOT NULL auto_increment,
  `item` varchar(15) collate latin1_general_ci NOT NULL,
  `howmany` varchar(15) collate latin1_general_ci NOT NULL,
  `price` varchar(150) collate latin1_general_ci NOT NULL,
  KEY `id` (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=7 ;

--
-- Dumping data for table `tb_clicks`
--

INSERT INTO `tb_clicks` VALUES (1, 'click', '1', '0.01');
INSERT INTO `tb_clicks` VALUES (1, 'referalclick', '1', '0.01');
INSERT INTO `tb_clicks` VALUES (1, 'pclick', '1', '0.0125');
INSERT INTO `tb_clicks` VALUES (1, 'preferalclick', '1', '0.0125');

-- ------------------------------------------------------

CREATE TABLE `tb_messenger` (
  `id` int(11) NOT NULL auto_increment,
  `sendfrom` varchar(11) collate latin1_general_ci NOT NULL,
  `sendto` varchar(11) collate latin1_general_ci NOT NULL,
  `date` varchar(35) collate latin1_general_ci NOT NULL,
  `comments` varchar(150) collate latin1_general_ci NOT NULL,
  `status` varchar(11) collate latin1_general_ci NOT NULL default 'unread',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci AUTO_INCREMENT=29 ;

--
-- Dumping data for table `tb_messenger`
--

INSERT INTO `tb_messenger` VALUES (23, 'tester', 'admin', '09-01-08 03:24', 'This is a test message', 'read');

