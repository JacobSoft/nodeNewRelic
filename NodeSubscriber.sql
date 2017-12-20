USE master
GO

IF EXISTS (SELECT * FROM sys.Databases WHERE [name] = 'NodeSubscriber')
DROP DATABASE NodeSubscriber
GO

CREATE DATABASE NodeSubscriber
GO

USE NodeSubscriber
GO

CREATE TABLE Subscriber

(FirstName varchar (50) NOT NULL, 
LastName varchar (60) NOT NULL,
Email varchar (80) PRIMARY KEY
)
GO

INSERT INTO Subscriber VALUES ('Jake', 'Clark', 'clarksjake@gmail.com')
GO

SELECT * FROM Subscriber
GO