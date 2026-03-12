#机构/学校表 (Institutions)
CREATE TABLE Institutions(
	id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    licenseType VARCHAR(50),
    expireDate DATETIME NOT NULL
);

#用户表 (Users)
CREATE TABLE Users(
	id VARCHAR(36) PRIMARY KEY,
    institutionId VARCHAR(36),
    loginAccount VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL,
    customAvatar TEXT,
    createdAt DATETIME,
    title VARCHAR(50),
    grade VARCHAR(20),
    classId VARCHAR(36),
    FOREIGN KEY (institutionId) REFERENCES Institutions(id)
);

ALTER TABLE Users ADD COLUMN parentId VARCHAR(36);
ALTER TABLE Users ADD CONSTRAINT fk_users_class FOREIGN KEY (classId) REFERENCES Classes(id);
ALTER TABLE Users ADD CONSTRAINT fk_users_parent FOREIGN KEY (parentId) REFERENCES Users(id);

#班级表 (Classes)
CREATE TABLE Classes(
	id VARCHAR(36) PRIMARY KEY,
    institutionid VARCHAR(36),
    teacherId VARCHAR(36) ,
    name VARCHAR(100) NOT NULL,
    currentGrade VARCHAR(10) ,
    inviteCode VARCHAR(10) UNIQUE,
    status VARCHAR(20) DEFAULT 'active',
    createdAt DATETIME,
    FOREIGN KEY (institutionid) REFERENCES Institutions(id),
	FOREIGN KEY (teacherId) REFERENCES Users(id)
);

#词书目录表 (Wordbooks)
CREATE TABLE Wordbooks(
	id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    coverImage VARCHAR(255),
    unitCount INT,
    description TEXT
);

#词库表 (Vocabularies)
CREATE TABLE Vocabularies(
	id VARCHAR(36) PRIMARY KEY,
    word VARCHAR(50) NOT NULL,
    partOfSpeech VARCHAR(20) NOT NULL,
    translation VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    ukPhonetic VARCHAR(50),
    usPhonetic VARCHAR(50),
    ukAudioUrl VARCHAR(255),
    usAudioUrl VARCHAR(255)
);

#词书与单词关系表
CREATE TABLE Wordbook_Vocabularies_Relation(
	id VARCHAR(36) PRIMARY KEY,
    bookId VARCHAR(36) NOT NULL,
    wordId VARCHAR(36) NOT NULL,
    FOREIGN KEY (bookId) REFERENCES Wordbooks(id),
    FOREIGN KEY (wordId) REFERENCES Vocabularies(id),
    UNIQUE (bookId, wordId)
);

#单词例句表 (Word_Examples)
CREATE TABLE Word_Examples(
	id VARCHAR(36) PRIMARY KEY,
    wordId VARCHAR(36) NOT NULL,
    enSentence VARCHAR(500) NOT NULL,
    cnTranslation VARCHAR(500) NOT NULL,
    ukAUdioUrl VARCHAR(255),
    usAudioUrl VARCHAR(255),
    isPrimary BOOLEAN DEFAULT FALSE,
    difficultyLevel INT NOT NULL,
	FOREIGN KEY (wordId) REFERENCES Vocabularies(id)
);

