CREATE TABLE users (
    id            INT          PRIMARY KEY AUTO_INCREMENT,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('student', 'organization')),
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id                  INT          PRIMARY KEY AUTO_INCREMENT,
    user_id             INT          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name           VARCHAR(150) NOT NULL,
    student_number      VARCHAR(50),
    volunteering_course BOOLEAN      NOT NULL DEFAULT FALSE,
    total_hours         DECIMAL(7,2) NOT NULL DEFAULT 0
);

CREATE TABLE organizations (
    id            INT          PRIMARY KEY AUTO_INCREMENT,
    user_id       INT          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    contact_phone VARCHAR(30)
);

CREATE TABLE tasks (
    id                INT          PRIMARY KEY AUTO_INCREMENT,
    org_id            INT          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title             VARCHAR(200) NOT NULL,
    description       TEXT         NOT NULL,
    volunteers_needed INT,
    status            VARCHAR(20)  NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    start_date        DATE,
    end_date          DATE,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    id         INT          PRIMARY KEY AUTO_INCREMENT,
    task_id    INT          NOT NULL REFERENCES tasks(id)    ON DELETE CASCADE,
    student_id INT          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status     VARCHAR(20)  NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'accepted', 'rejected')),
    applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (task_id, student_id)
);

CREATE TABLE work_logs (
    id             INT          PRIMARY KEY AUTO_INCREMENT,
    application_id INT          NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    hours_worked   DECIMAL(5,2) NOT NULL CHECK (hours_worked > 0),
    work_date      DATE         NOT NULL,
    notes          TEXT,
    logged_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DELIMITER //
CREATE TRIGGER update_total_hours
AFTER INSERT ON work_logs
FOR EACH ROW
BEGIN
    UPDATE students s
    JOIN applications a ON a.id = NEW.application_id
    SET s.total_hours = (
        SELECT COALESCE(SUM(wl.hours_worked), 0)
        FROM work_logs wl
        JOIN applications a2 ON a2.id = wl.application_id
        WHERE a2.student_id = a.student_id
    )
    WHERE s.id = a.student_id;
END //
DELIMITER ;