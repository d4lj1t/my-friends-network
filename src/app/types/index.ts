import { Document } from 'mongoose';

export type PeopleData = {
	userId: string;
	people: Person[];
	allPeople: Person[],
}

export type Person = {
	id: string,
	forename: string,
	surname: string,
	dob: string,
	ssn: string,
	issuedDateAndTime: string,
	friends: string[],
	image: string,
	primaryLocation: {
		type: 'string',
		coordinates: [number, number]
	}
} & Document;
