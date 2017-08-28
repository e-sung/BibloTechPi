CREATE TABLE `books` (
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `is_rented` smallint(6) NOT NULL DEFAULT '0',
  `renter_email` varchar(255),
  `rented_date` date,
  `due_date` date,
  `publisher` varchar(255),
  `id` int(11) NOT NULL AUTO_INCREMENT,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

CREATE TABLE `posts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `bookTitle` varchar(255) DEFAULT '',
  `postTitle` varchar(255) DEFAULT '',
  `postContent` text,
  `writtenTime` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `writer` varchar(124) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

CREATE TABLE `user` (
  `username` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phonenumber` varchar(11) NOT NULL,
  `rentscore` int(11) NOT NULL DEFAULT '0',
  `rentableBooks` smallint(6) NOT NULL,
  `readBooks` text CHARACTER SET utf8mb4,
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
