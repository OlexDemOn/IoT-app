import type { MachineProps } from "../types/machines";
import type { PropertiesProps } from "../types/types";
import type { Group, SearchUser, User } from "../types/users";
import { fetchClient } from "./fetch";

const SERVER = import.meta.env.VITE_SERVER_URL;

const MACHINE_URL = `${SERVER}/getAllMachine`;
const MACHINE_BY_ID_URL = `${SERVER}/getMachineByID/`;
const MACHINE_PROPERTIES = `${SERVER}/getProperties`;
const LOGIN_URL = `${SERVER}/getUser`;
const CHECK_ADMIN = `${SERVER}/checkAdmin`;

const USERS_URL = `${SERVER}/showUsers`;
const CREATE_USER = `${SERVER}/addUser`;
const DELETE_USER = `${SERVER}/deleteUser`;
const EDIT_USER = `${SERVER}/editUser`;

const GROUPS_URL = `${SERVER}/showGroups`;
const CREATE_GROUP = `${SERVER}/addGroup`;
const DELETE_GROUP = `${SERVER}/deleteGroup`;
const EDIT_GROUP = `${SERVER}/editGroup`;

const LINES_URL = `${SERVER}/showProductLine`;

const GET_REPORT = `${SERVER}/getReport`;

export async function getAllMachine(userId: string, filters?: object) {
	return (await fetchClient<MachineProps[]>(MACHINE_URL, "POST", filters, userId)).toPlainObject();
}

export async function getMachineByID(id: string, start = "", end = "") {
	return (
		await fetchClient<MachineProps[]>(MACHINE_BY_ID_URL + id, "POST", { start: start, end: end })
	).toPlainObject();
}
export async function getProperties(userId: string) {
	return (await fetchClient<PropertiesProps[]>(MACHINE_PROPERTIES, "GET", null, userId)).toPlainObject();
}

export async function sendLogin(email: string, password: string) {
	const request = await fetch(LOGIN_URL, {
		body: JSON.stringify({ email: email, password: password }),
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!request.ok) {
		if (request.status === 401) {
			throw new Error("Wrong email or password");
		}
		throw new Error("Cannot log you in - Try again later");
	}
	const response = (await request.json()) as User;
	return response;
}

export async function checkAdmin(userId: string, user: User) {
	return (await fetchClient<boolean>(CHECK_ADMIN, "POST", user, userId)).toPlainObject();
}

export async function getUsers(userId: string, groups: string[] | undefined) {
	return (await fetchClient<SearchUser[]>(USERS_URL, "POST", groups, userId)).toPlainObject();
}

export async function createUsers(userId: string, newUser: SearchUser) {
	return (await fetchClient<boolean>(CREATE_USER, "POST", newUser, userId)).toPlainObject();
}

export async function deleteUsers(userId: string, delUser: SearchUser) {
	return (await fetchClient<boolean>(DELETE_USER, "DELETE", delUser, userId)).toPlainObject();
}

export async function modifyUser(userId: string, editUser: SearchUser) {
	return (await fetchClient<boolean>(EDIT_USER, "PUT", editUser, userId)).toPlainObject();
}

export async function getGroups(userId: string, groups: string[] | undefined) {
	return (await fetchClient<Group[]>(GROUPS_URL, "POST", groups, userId)).toPlainObject();
}

export async function createGroup(userId: string, newGroup: Group) {
	return (await fetchClient<boolean>(CREATE_GROUP, "POST", newGroup, userId)).toPlainObject();
}

export async function deleteGroup(userId: string, delGroup: Group) {
	return (await fetchClient<boolean>(DELETE_GROUP, "DELETE", delGroup, userId)).toPlainObject();
}

export async function modifyGroup(
	userId: string,
	editGroup: Group,
	newname: string,
	newmembers: string[],
	line: string,
) {
	return (
		await fetchClient<boolean>(
			EDIT_GROUP,
			"PUT",
			{ newname: newname, groups_id: editGroup.groups_id, newmembers: newmembers, productline: line },
			userId,
		)
	).toPlainObject();
}

export async function getProdLines(userId: string) {
	return (await fetchClient<{ product_line_id: string }[]>(LINES_URL, "POST", {}, userId)).toPlainObject();
}

export async function getReport(userId: string, date: string[]) {
	return (await fetchClient<boolean>(GET_REPORT, "POST", date, userId)).toPlainObject;
}
