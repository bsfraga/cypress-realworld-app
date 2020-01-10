import path from "path";
import v4 from "uuid";
import _ from "lodash";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { User } from "../models/user";
import { Contact } from "../models/contact";
import shortid from "shortid";

const testSeed = require(path.join(__dirname, "../data/", "test-seed.json"));
let databaseFileName;

if (process.env.NODE_ENV === "test") {
  databaseFileName = "database.test.json";
} else {
  databaseFileName = "database.json";
}

const databaseFile = path.join(__dirname, "../data", databaseFileName);
const adapter = new FileSync(databaseFile);

const db = () => low(adapter);

export const seedDatabase = () => {
  // seed database with test data
  // @ts-ignore
  db()
    .setState(testSeed)
    .write();
  console.log("test data seeded into test database");
};
export const getAllUsers = () =>
  db()
    .get("users")
    .value();

export const getAllContacts = () =>
  db()
    .get("contacts")
    .value();

export const getBy = (entity: string, key: string, value: any) =>
  db()
    .get(entity)
    // @ts-ignore
    .find({ [`${key}`]: value })
    .value();

// convenience methods
export const getContactBy = (key: string, value: any) =>
  getBy("contacts", key, value);
export const getUserBy = (key: string, value: any) =>
  getBy("users", key, value);
export const getUsersBy = (key: string, value: any) =>
  Array.of(getBy("users", key, value));
export const getContactsBy = (key: string, value: any) =>
  Array.of(getBy("contacts", key, value));

export const getContactsByUsername = (username: string) => {
  const user: User = getUserBy("username", username);
  const userContacts: Contact[] = getContactsBy("user_id", user.id);
  return userContacts;
};

export const createContact = (contact: Contact) => {
  db()
    .get("contacts")
    // @ts-ignore
    .push(contact)
    .write();

  // manual lookup after create
  return getContactBy("id", contact.id);
};

export const createContactForUser = (
  user_id: string,
  contact_user_id: string
) => {
  const contactId = shortid();
  const contact: Contact = {
    id: contactId,
    uuid: v4(),
    user_id,
    contact_user_id,
    created_at: new Date(),
    modified_at: new Date()
  };

  // TODO: check if contact exists

  // Write contact record to the database
  const result = createContact(contact);

  return result;
};

// dev/test private methods
export const getRandomUser = () => {
  const users = getAllUsers();
  return _.sample(users);
};

export default db;
