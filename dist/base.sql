PRAGMA foreign_keys = ON;
CREATE TABLE VEHICULE(Code INTEGER PRIMARY KEY, Type TEXT NOT NULL, Marque TEXT NOT NULL, Puissance INTEGER NOT NULL);
CREATE TABLE GARAGE(Code INTEGER PRIMARY KEY, Nom TEXT NOT NULL, Adresse TEXT, Ville TEXT NOT NULL, Cpostal TEXT NOT NULL, Marque TEXT NOT NULL);
CREATE TABLE PLAQUE(Immat TEXT PRIMARY KEY NOT NULL, CodeV INTEGER NOT NULL REFERENCES VEHICULE(Code), Nom TEXT NOT NULL, Prenom TEXT NOT NULL, Adresse TEXT, Ville TEXT NOT NULL, Cpostal TEXT NOT NULL, Date TEXT NOT NULL);
INSERT INTO VEHICULE VALUES
(1,'Espace','Renault',100),(2,'Clio','Renault',60),(3,'Megane','Renault',80),(4,'Twingo','Renault',50),
(5,'106','Peugeot',45),(6,'206','Peugeot',60),(7,'306','Peugeot',80),(8,'807','Peugeot',110),(9,'407','Peugeot',130),
(10,'C4','Citroen',85),(11,'C5','Citroen',100),(12,'C3','Citroen',45),(13,'C8','Citroen',115),
(14,'Yaris','Toyota',55),(15,'Rav4','Toyota',95);
INSERT INTO GARAGE VALUES
(1,'Dupont','36 Route de Paris','Bar Le Duc','55000','Renault'),
(2,'Durand','75 Rue de Par là','Nancy','54000','Peugeot'),
(3,'Asterix','10 Allée le Ciel','Ailleurs','80100','Renault'),
(4,'Obelix','25 Allée du Ciel','Ailleurs','80100','Citroen'),
(5,'Le Barde','35 Va en enfer','ICI','81010','Toyota');
INSERT INTO PLAQUE VALUES
('150XY52',1,'Lucien','Raymond','36 par ici','Saint Dizier','52000','2005-10-01'),
('200XY55',2,'Traban','Fernand','60 rue du lac','Nancy','54000','2005-02-20'),
('300ATX57',3,'Tournesol','Luc','80 Avenue de Strasbourg','Metz','57000','2004-12-18'),
('220ACD80',4,'Dupond','Louis','35 rue de Moscou','Amiens','80000','2005-10-20'),
('300ATZ81',5,'Etienne','Marcel','20 rue de Toulouse','Albi','81990','2004-07-12'),
('400XZ55',6,'Durand','Maurice','35 rue de Belfort','Chambley','54120','2004-02-18'),
('20AAA80',7,'Lenoir','Louis','70 Rue de Bellefontaine','Amiens','80000','2005-05-27'),
('2875ATX57',8,'Leblanc','Lucien','80 Route de Vienne','Albi','81990','2004-07-12');
