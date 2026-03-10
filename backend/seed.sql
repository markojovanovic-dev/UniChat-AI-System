-- ═══════════════════════════════════════════════════════════════════
-- Univerzitetski informacioni sistem - Inicijalizacija baze podataka
-- Svi podaci su na srpskom jeziku
-- ═══════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS uni_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uni_db;

DROP TABLE IF EXISTS upisi;
DROP TABLE IF EXISTS ocene;
DROP TABLE IF EXISTS predmeti;
DROP TABLE IF EXISTS profesori;
DROP TABLE IF EXISTS studenti;

-- ─── Studenti ───────────────────────────────────────────────────────────────

CREATE TABLE studenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ime VARCHAR(50) NOT NULL,
    prezime VARCHAR(50) NOT NULL,
    broj_indeksa VARCHAR(20) NOT NULL UNIQUE,
    godina_upisa INT NOT NULL,
    smer VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO studenti (ime, prezime, broj_indeksa, godina_upisa, smer, email) VALUES
('Marko', 'Jovanović', '2023/0001', 2023, 'Računarstvo i informatika', 'marko.jovanovic@student.rs'),
('Jelena', 'Petrović', '2023/0002', 2023, 'Softversko inženjerstvo', 'jelena.petrovic@student.rs'),
('Nikola', 'Đorđević', '2022/0015', 2022, 'Računarstvo i informatika', 'nikola.djordjevic@student.rs'),
('Ana', 'Nikolić', '2023/0003', 2023, 'Informacioni sistemi', 'ana.nikolic@student.rs'),
('Stefan', 'Milić', '2022/0008', 2022, 'Softversko inženjerstvo', 'stefan.milic@student.rs'),
('Milica', 'Popović', '2023/0004', 2023, 'Računarstvo i informatika', 'milica.popovic@student.rs'),
('Luka', 'Stojanović', '2022/0012', 2022, 'Informacioni sistemi', 'luka.stojanovic@student.rs'),
('Teodora', 'Ilić', '2023/0005', 2023, 'Softversko inženjerstvo', 'teodora.ilic@student.rs'),
('Vuk', 'Marković', '2022/0020', 2022, 'Računarstvo i informatika', 'vuk.markovic@student.rs'),
('Sara', 'Kostić', '2023/0006', 2023, 'Informacioni sistemi', 'sara.kostic@student.rs'),
('Đorđe', 'Pavlović', '2022/0003', 2022, 'Softversko inženjerstvo', 'djordje.pavlovic@student.rs'),
('Maja', 'Stanković', '2023/0007', 2023, 'Računarstvo i informatika', 'maja.stankovic@student.rs'),
('Filip', 'Živković', '2022/0018', 2022, 'Informacioni sistemi', 'filip.zivkovic@student.rs'),
('Ivana', 'Ristić', '2023/0008', 2023, 'Softversko inženjerstvo', 'ivana.ristic@student.rs'),
('Aleksandar', 'Todorović', '2022/0025', 2022, 'Računarstvo i informatika', 'aleksandar.todorovic@student.rs'),
('Katarina', 'Savić', '2023/0009', 2023, 'Informacioni sistemi', 'katarina.savic@student.rs'),
('Nemanja', 'Vasić', '2022/0007', 2022, 'Softversko inženjerstvo', 'nemanja.vasic@student.rs'),
('Mina', 'Radović', '2023/0010', 2023, 'Računarstvo i informatika', 'mina.radovic@student.rs'),
('Petar', 'Đukić', '2022/0011', 2022, 'Informacioni sistemi', 'petar.djukic@student.rs'),
('Tamara', 'Lazić', '2023/0011', 2023, 'Softversko inženjerstvo', 'tamara.lazic@student.rs');

-- ─── Profesori ──────────────────────────────────────────────────────────────

CREATE TABLE profesori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ime VARCHAR(50) NOT NULL,
    prezime VARCHAR(50) NOT NULL,
    titula VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    kabinet VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO profesori (ime, prezime, titula, email, kabinet) VALUES
('Dragan', 'Simić', 'Redovni profesor', 'dragan.simic@fon.rs', 'K-301'),
('Milica', 'Stanković', 'Vanredni profesor', 'milica.stankovic@fon.rs', 'K-215'),
('Zoran', 'Pavlović', 'Docent', 'zoran.pavlovic@fon.rs', 'K-118'),
('Jelena', 'Mitrović', 'Redovni profesor', 'jelena.mitrovic@fon.rs', 'K-402');

-- ─── Predmeti ───────────────────────────────────────────────────────────────

CREATE TABLE predmeti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    sifra VARCHAR(20) NOT NULL UNIQUE,
    ects INT NOT NULL,
    semestar INT NOT NULL,
    profesor_id INT NOT NULL,
    FOREIGN KEY (profesor_id) REFERENCES profesori(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO predmeti (naziv, sifra, ects, semestar, profesor_id) VALUES
('Programiranje 1', 'CS101', 6, 1, 1),
('Matematika 1', 'MA101', 7, 1, 4),
('Uvod u računarstvo', 'CS102', 5, 1, 3),
('Programiranje 2', 'CS103', 6, 2, 1),
('Matematika 2', 'MA102', 7, 2, 4),
('Baze podataka', 'CS201', 6, 3, 2),
('Algoritmi i strukture podataka', 'CS202', 6, 3, 1),
('Operativni sistemi', 'CS203', 5, 3, 3),
('Web programiranje', 'CS301', 5, 5, 2),
('Veštačka inteligencija', 'CS302', 6, 5, 3);

-- ─── Ocene ──────────────────────────────────────────────────────────────────

CREATE TABLE ocene (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    predmet_id INT NOT NULL,
    ocena INT NOT NULL CHECK (ocena BETWEEN 5 AND 10),
    datum_polaganja DATE NOT NULL,
    semestar VARCHAR(20) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES studenti(id),
    FOREIGN KEY (predmet_id) REFERENCES predmeti(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Zimski semestar 2023/2024
INSERT INTO ocene (student_id, predmet_id, ocena, datum_polaganja, semestar) VALUES
(1, 1, 9, '2024-01-25', '2023/2024 zimski'),
(1, 2, 8, '2024-02-05', '2023/2024 zimski'),
(1, 3, 10, '2024-01-20', '2023/2024 zimski'),
(2, 1, 10, '2024-01-25', '2023/2024 zimski'),
(2, 2, 9, '2024-02-05', '2023/2024 zimski'),
(2, 3, 8, '2024-01-20', '2023/2024 zimski'),
(3, 6, 7, '2024-01-30', '2023/2024 zimski'),
(3, 7, 8, '2024-02-10', '2023/2024 zimski'),
(3, 8, 9, '2024-01-28', '2023/2024 zimski'),
(4, 1, 8, '2024-01-25', '2023/2024 zimski'),
(4, 2, 7, '2024-02-05', '2023/2024 zimski'),
(5, 4, 9, '2024-02-15', '2023/2024 zimski'),
(5, 5, 7, '2024-02-20', '2023/2024 zimski'),
(6, 1, 10, '2024-01-25', '2023/2024 zimski'),
(6, 2, 9, '2024-02-05', '2023/2024 zimski'),
(7, 6, 8, '2024-01-30', '2023/2024 zimski'),
(7, 7, 6, '2024-02-10', '2023/2024 zimski'),
(8, 1, 7, '2024-01-25', '2023/2024 zimski'),
(9, 6, 9, '2024-01-30', '2023/2024 zimski'),
(9, 7, 10, '2024-02-10', '2023/2024 zimski'),
(10, 1, 8, '2024-01-25', '2023/2024 zimski'),
(11, 4, 6, '2024-02-15', '2023/2024 zimski'),
(12, 1, 9, '2024-01-25', '2023/2024 zimski'),
(13, 6, 7, '2024-01-30', '2023/2024 zimski'),
(14, 1, 10, '2024-01-25', '2023/2024 zimski'),
(15, 6, 8, '2024-01-30', '2023/2024 zimski');

-- Letnji semestar 2023/2024
INSERT INTO ocene (student_id, predmet_id, ocena, datum_polaganja, semestar) VALUES
(1, 4, 9, '2024-06-15', '2023/2024 letnji'),
(1, 5, 8, '2024-06-20', '2023/2024 letnji'),
(2, 4, 10, '2024-06-15', '2023/2024 letnji'),
(2, 5, 10, '2024-06-20', '2023/2024 letnji'),
(3, 9, 9, '2024-06-25', '2023/2024 letnji'),
(3, 10, 8, '2024-06-28', '2023/2024 letnji'),
(4, 3, 9, '2024-06-10', '2023/2024 letnji'),
(5, 6, 8, '2024-06-15', '2023/2024 letnji'),
(6, 4, 10, '2024-06-15', '2023/2024 letnji'),
(6, 5, 8, '2024-06-20', '2023/2024 letnji'),
(7, 8, 7, '2024-06-22', '2023/2024 letnji'),
(8, 2, 8, '2024-06-05', '2023/2024 letnji'),
(9, 8, 9, '2024-06-22', '2023/2024 letnji'),
(9, 9, 10, '2024-06-25', '2023/2024 letnji'),
(10, 2, 7, '2024-06-05', '2023/2024 letnji'),
(11, 6, 8, '2024-06-15', '2023/2024 letnji'),
(12, 2, 9, '2024-06-05', '2023/2024 letnji'),
(14, 2, 9, '2024-06-05', '2023/2024 letnji'),
(15, 9, 7, '2024-06-25', '2023/2024 letnji'),
(16, 1, 8, '2024-06-10', '2023/2024 letnji'),
(17, 4, 9, '2024-06-15', '2023/2024 letnji'),
(18, 1, 10, '2024-06-10', '2023/2024 letnji'),
(19, 6, 7, '2024-06-15', '2023/2024 letnji'),
(20, 1, 8, '2024-06-10', '2023/2024 letnji');

-- ─── Upisi ──────────────────────────────────────────────────────────────────

CREATE TABLE upisi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    predmet_id INT NOT NULL,
    akademska_godina VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aktivan',
    FOREIGN KEY (student_id) REFERENCES studenti(id),
    FOREIGN KEY (predmet_id) REFERENCES predmeti(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO upisi (student_id, predmet_id, akademska_godina, status) VALUES
(1, 1, '2023/2024', 'položen'), (1, 2, '2023/2024', 'položen'), (1, 3, '2023/2024', 'položen'),
(1, 4, '2023/2024', 'položen'), (1, 5, '2023/2024', 'položen'),
(2, 1, '2023/2024', 'položen'), (2, 2, '2023/2024', 'položen'), (2, 3, '2023/2024', 'položen'),
(2, 4, '2023/2024', 'položen'), (2, 5, '2023/2024', 'položen'),
(3, 6, '2023/2024', 'položen'), (3, 7, '2023/2024', 'položen'), (3, 8, '2023/2024', 'položen'),
(3, 9, '2023/2024', 'položen'), (3, 10, '2023/2024', 'položen'),
(4, 1, '2023/2024', 'položen'), (4, 2, '2023/2024', 'položen'), (4, 3, '2023/2024', 'položen'),
(5, 4, '2023/2024', 'položen'), (5, 5, '2023/2024', 'položen'), (5, 6, '2023/2024', 'položen'),
(6, 1, '2023/2024', 'položen'), (6, 2, '2023/2024', 'položen'),
(6, 4, '2023/2024', 'položen'), (6, 5, '2023/2024', 'položen'),
(7, 6, '2023/2024', 'položen'), (7, 7, '2023/2024', 'aktivan'), (7, 8, '2023/2024', 'položen'),
(8, 1, '2023/2024', 'položen'), (8, 2, '2023/2024', 'položen'),
(9, 6, '2023/2024', 'položen'), (9, 7, '2023/2024', 'položen'),
(9, 8, '2023/2024', 'položen'), (9, 9, '2023/2024', 'položen'),
(10, 1, '2023/2024', 'položen'), (10, 2, '2023/2024', 'aktivan'),
(11, 4, '2023/2024', 'položen'), (11, 6, '2023/2024', 'položen'),
(12, 1, '2023/2024', 'položen'), (12, 2, '2023/2024', 'položen'),
(13, 6, '2023/2024', 'položen'), (14, 1, '2023/2024', 'položen'), (14, 2, '2023/2024', 'položen'),
(15, 6, '2023/2024', 'položen'), (15, 9, '2023/2024', 'položen'),
(16, 1, '2023/2024', 'položen'), (17, 4, '2023/2024', 'položen'),
(18, 1, '2023/2024', 'položen'), (19, 6, '2023/2024', 'položen'),
(20, 1, '2023/2024', 'položen');

INSERT INTO upisi (student_id, predmet_id, akademska_godina, status) VALUES
(1, 6, '2024/2025', 'aktivan'), (1, 7, '2024/2025', 'aktivan'),
(2, 6, '2024/2025', 'aktivan'), (2, 7, '2024/2025', 'aktivan'),
(4, 4, '2024/2025', 'aktivan'), (4, 5, '2024/2025', 'aktivan'),
(6, 6, '2024/2025', 'aktivan'), (6, 7, '2024/2025', 'aktivan'),
(8, 4, '2024/2025', 'aktivan'), (8, 5, '2024/2025', 'aktivan'),
(10, 3, '2024/2025', 'aktivan'), (10, 4, '2024/2025', 'aktivan'),
(12, 4, '2024/2025', 'aktivan'), (12, 5, '2024/2025', 'aktivan'),
(14, 4, '2024/2025', 'aktivan'), (14, 5, '2024/2025', 'aktivan');

-- ─── Read-only korisnik (pokrenite kao root) ────────────────────────────────
-- CREATE USER IF NOT EXISTS 'uni_reader'@'localhost' IDENTIFIED BY 'readonly123';
-- GRANT SELECT ON uni_db.* TO 'uni_reader'@'localhost';
-- FLUSH PRIVILEGES;
