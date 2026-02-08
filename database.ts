import * as SQLite from 'expo-sqlite';

export interface User { id: number; firstName: string; lastName: string; responsibility: string; }
export interface AttendanceRecord { id: number; firstName: string; lastName: string; date: string; status: string; }

const db = SQLite.openDatabaseSync('office_management.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, firstName TEXT, lastName TEXT, responsibility TEXT);
    CREATE TABLE IF NOT EXISTS attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, date TEXT, status TEXT);
  `);
};

export const addUser = (fName: string, lName: string, resp: string) => {
  db.runSync('INSERT INTO users (firstName, lastName, responsibility) VALUES (?, ?, ?)', [fName, lName, resp]);
};

export const getUsersFromDB = (): User[] => db.getAllSync<User>('SELECT * FROM users');

export const updateUser = (id: number, fName: string, lName: string, resp: string) => {
  db.runSync('UPDATE users SET firstName = ?, lastName = ?, responsibility = ? WHERE id = ?', [fName, lName, resp, id]);
};

export const deleteUser = (id: number) => {
  db.runSync('DELETE FROM users WHERE id = ?', [id]);
};

export const saveAttendanceReport = (presentIds: number[], allUsers: User[]) => {
  const today = new Date().toLocaleDateString('fa-IR');
  allUsers.forEach(user => {
    const isPresent = presentIds.includes(user.id);
    db.runSync('INSERT INTO attendance (userId, date, status) VALUES (?, ?, ?)', [user.id, today, isPresent ? 'حاضر' : 'غایب']);
  });
};

export const getHistoryFromDB = (): AttendanceRecord[] => {
  return db.getAllSync<AttendanceRecord>(`
    SELECT attendance.id, users.firstName, users.lastName, attendance.date, attendance.status 
    FROM attendance JOIN users ON attendance.userId = users.id ORDER BY attendance.id DESC
  `);
};
