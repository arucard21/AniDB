UPDATE jtb SET status=16777224 WHERE status=0;
UPDATE jtb SET status=50331649 WHERE status=16;
UPDATE jtb SET status=17891330 WHERE status=48;
UPDATE jtb SET status=17956866 WHERE status=80;
UPDATE jtb SET status=19005442 WHERE status=112;
UPDATE jtb SET status=18939906 WHERE status=144;
UPDATE jtb SET status=16777217 WHERE status=240;
ALTER TABLE jtb ADD COLUMN avxml TEXT DEFAULT NULL;
UPDATE vtb SET ver=2;